# Quick Reference: Volunteer Shift System

## Common Scenarios & Solutions

### 1. Prevent Overbooking (Race Condition)

**Problem**: Two volunteers sign up for the last spot simultaneously.

**Solution A: Pessimistic Locking** (PostgreSQL)
```javascript
async function signupForShift(shiftId, volunteerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock row - other transactions must wait
    const shift = await client.query(
      `SELECT s.capacity,
              COUNT(su.id) as signup_count
       FROM shifts s
       LEFT JOIN signups su ON su.shift_id = s.id AND su.status = 'confirmed'
       WHERE s.id = $1
       GROUP BY s.id, s.capacity
       FOR UPDATE OF s`,
      [shiftId]
    );

    if (!shift.rows[0]) throw new Error('Shift not found');

    const { capacity, signup_count } = shift.rows[0];

    if (signup_count >= capacity) {
      await client.query('ROLLBACK');
      return { success: false, error: 'SHIFT_FULL' };
    }

    await client.query(
      'INSERT INTO signups (shift_id, volunteer_id, status) VALUES ($1, $2, $3)',
      [shiftId, volunteerId, 'confirmed']
    );

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**Solution B: Optimistic Locking** (with version field)
```javascript
async function signupForShift(shiftId, volunteerId) {
  let retries = 3;

  while (retries > 0) {
    try {
      const shift = await db.query(
        'SELECT version, capacity FROM shifts WHERE id = $1',
        [shiftId]
      );

      const signupCount = await db.query(
        'SELECT COUNT(*) FROM signups WHERE shift_id = $1 AND status = $2',
        [shiftId, 'confirmed']
      );

      if (signupCount.rows[0].count >= shift.rows[0].capacity) {
        return { success: false, error: 'SHIFT_FULL' };
      }

      // Try to update with version check
      const result = await db.query(
        'UPDATE shifts SET version = version + 1 WHERE id = $1 AND version = $2',
        [shiftId, shift.rows[0].version]
      );

      if (result.rowCount === 0) {
        // Version changed, someone else updated - retry
        retries--;
        continue;
      }

      await db.query(
        'INSERT INTO signups (shift_id, volunteer_id) VALUES ($1, $2)',
        [shiftId, volunteerId]
      );

      return { success: true };
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'ALREADY_SIGNED_UP' };
      }
      throw error;
    }
  }

  return { success: false, error: 'CONFLICT_RETRY_EXHAUSTED' };
}
```

---

### 2. Waitlist with Auto-Promotion

**Problem**: When someone cancels a full shift, automatically promote the next person from waitlist.

**Solution**:
```javascript
async function cancelSignup(shiftId, volunteerId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Remove the signup
    const deleted = await client.query(
      `UPDATE signups
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE shift_id = $1 AND volunteer_id = $2 AND status = 'confirmed'
       RETURNING id`,
      [shiftId, volunteerId]
    );

    if (deleted.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'SIGNUP_NOT_FOUND' };
    }

    // Check if there's anyone on waitlist
    const nextInLine = await client.query(
      `SELECT volunteer_id, position
       FROM waitlist
       WHERE shift_id = $1
       ORDER BY position ASC
       LIMIT 1
       FOR UPDATE`,
      [shiftId]
    );

    if (nextInLine.rows.length > 0) {
      const promotedVolunteer = nextInLine.rows[0].volunteer_id;

      // Move from waitlist to signups
      await client.query(
        'INSERT INTO signups (shift_id, volunteer_id, status) VALUES ($1, $2, $3)',
        [shiftId, promotedVolunteer, 'confirmed']
      );

      await client.query(
        'DELETE FROM waitlist WHERE shift_id = $1 AND volunteer_id = $2',
        [shiftId, promotedVolunteer]
      );

      // Update positions for remaining people
      await client.query(
        'UPDATE waitlist SET position = position - 1 WHERE shift_id = $1',
        [shiftId]
      );

      // TODO: Send notification to promoted volunteer
      await notificationService.sendPromotion(promotedVolunteer, shiftId);
    }

    await client.query('COMMIT');
    return { success: true, promoted: nextInLine.rows[0]?.volunteer_id };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

### 3. Prevent Double-Booking (Overlapping Shifts)

**Problem**: Volunteer shouldn't sign up for overlapping shifts.

**Solution**:
```javascript
async function checkForConflicts(volunteerId, newShiftStartTime, newShiftEndTime) {
  const conflicts = await db.query(
    `SELECT s.id, s.title, s.start_time, s.end_time
     FROM signups su
     JOIN shifts s ON s.id = su.shift_id
     WHERE su.volunteer_id = $1
       AND su.status = 'confirmed'
       AND (
         (s.start_time <= $2 AND s.end_time > $2) OR  -- new shift starts during existing
         (s.start_time < $3 AND s.end_time >= $3) OR  -- new shift ends during existing
         (s.start_time >= $2 AND s.end_time <= $3)    -- new shift encompasses existing
       )`,
    [volunteerId, newShiftStartTime, newShiftEndTime]
  );

  if (conflicts.rows.length > 0) {
    return {
      hasConflict: true,
      conflictingShifts: conflicts.rows
    };
  }

  return { hasConflict: false };
}

// Use in signup flow:
async function signupForShift(shiftId, volunteerId) {
  const shift = await db.query('SELECT start_time, end_time FROM shifts WHERE id = $1', [shiftId]);

  const conflicts = await checkForConflicts(
    volunteerId,
    shift.rows[0].start_time,
    shift.rows[0].end_time
  );

  if (conflicts.hasConflict) {
    return {
      success: false,
      error: 'SCHEDULE_CONFLICT',
      conflicts: conflicts.conflictingShifts
    };
  }

  // Proceed with signup...
}
```

---

### 4. Efficient Availability Query

**Problem**: Find all shifts a volunteer can sign up for (not full, not conflicting).

**Solution**:
```sql
-- Get available shifts for a volunteer
SELECT
  s.id,
  s.title,
  s.start_time,
  s.end_time,
  s.capacity,
  COUNT(su.id) as current_signups,
  s.capacity - COUNT(su.id) as available_spots
FROM shifts s
LEFT JOIN signups su ON su.shift_id = s.id AND su.status = 'confirmed'
WHERE s.start_time > NOW()  -- Only future shifts
  AND s.id NOT IN (
    -- Exclude shifts volunteer already signed up for
    SELECT shift_id FROM signups
    WHERE volunteer_id = $1 AND status = 'confirmed'
  )
  AND s.id NOT IN (
    -- Exclude shifts that conflict with volunteer's schedule
    SELECT s2.id
    FROM shifts s2
    JOIN signups su2 ON su2.shift_id = s2.id
    WHERE su2.volunteer_id = $1
      AND su2.status = 'confirmed'
      AND (
        (s2.start_time <= s.start_time AND s2.end_time > s.start_time) OR
        (s2.start_time < s.end_time AND s2.end_time >= s.end_time) OR
        (s2.start_time >= s.start_time AND s2.end_time <= s.end_time)
      )
  )
GROUP BY s.id, s.title, s.start_time, s.end_time, s.capacity
HAVING COUNT(su.id) < s.capacity  -- Only shifts with space
ORDER BY s.start_time ASC;
```

---

### 5. Validation Middleware (Express)

**Problem**: Centralize input validation.

**Solution**:
```javascript
const Joi = require('joi');

const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: errors
        }
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Define schemas
const createShiftSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  startTime: Joi.date().iso().greater('now').required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
  capacity: Joi.number().integer().min(1).max(100).required(),
  location: Joi.string().max(255).optional(),
  requiredSkills: Joi.array().items(Joi.string()).optional()
});

const signupSchema = Joi.object({
  volunteerId: Joi.string().uuid().required()
});

// Use in routes
app.post('/api/shifts', validateSchema(createShiftSchema), async (req, res) => {
  const data = req.validatedBody;
  // data is now validated and safe to use
});

app.post('/api/shifts/:id/signup', validateSchema(signupSchema), async (req, res) => {
  // ...
});
```

---

### 6. Error Handling Middleware

**Problem**: Consistent error responses.

**Solution**:
```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined errors
class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Global error handler
app.use((err, req, res, next) => {
  if (err.isOperational) {
    // Known operational error
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }

  // Unknown error - log and return generic message
  console.error('UNEXPECTED ERROR:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Usage in routes
app.post('/api/shifts/:id/signup', async (req, res, next) => {
  try {
    const shift = await db.query('SELECT * FROM shifts WHERE id = $1', [req.params.id]);

    if (shift.rows.length === 0) {
      throw new NotFoundError('Shift');
    }

    // Check capacity
    if (shift.rows[0].current_signups >= shift.rows[0].capacity) {
      throw new ConflictError('Shift is full', 'SHIFT_FULL');
    }

    // ...
    res.json({ success: true, data: signup });
  } catch (error) {
    next(error);
  }
});
```

---

### 7. Pagination Helper

**Problem**: Paginate large lists of shifts.

**Solution**:
```javascript
const paginate = (page = 1, pageSize = 20) => {
  const normalizedPage = Math.max(1, parseInt(page));
  const normalizedPageSize = Math.min(100, Math.max(1, parseInt(pageSize)));
  const offset = (normalizedPage - 1) * normalizedPageSize;

  return {
    limit: normalizedPageSize,
    offset,
    page: normalizedPage,
    pageSize: normalizedPageSize
  };
};

const buildPaginationResponse = (items, total, page, pageSize) => {
  return {
    success: true,
    data: items,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPrevPage: page > 1
    }
  };
};

// Usage
app.get('/api/shifts', async (req, res) => {
  const { limit, offset, page, pageSize } = paginate(req.query.page, req.query.pageSize);

  const [shifts, countResult] = await Promise.all([
    db.query('SELECT * FROM shifts ORDER BY start_time ASC LIMIT $1 OFFSET $2', [limit, offset]),
    db.query('SELECT COUNT(*) FROM shifts')
  ]);

  const total = parseInt(countResult.rows[0].count);

  res.json(buildPaginationResponse(shifts.rows, total, page, pageSize));
});
```

---

### 8. Date/Time Handling

**Problem**: Store in UTC, display in user's timezone.

**Solution**:
```javascript
const { DateTime } = require('luxon');

// Store in database as UTC (PostgreSQL TIMESTAMP)
const shift = {
  startTime: new Date('2025-11-26T14:00:00Z'), // Always store UTC
  endTime: new Date('2025-11-26T17:00:00Z')
};

// Convert for display
function formatShiftForTimezone(shift, timezone = 'America/New_York') {
  return {
    ...shift,
    startTime: shift.startTime.toISOString(),
    endTime: shift.endTime.toISOString(),
    localStartTime: DateTime.fromJSDate(shift.startTime)
      .setZone(timezone)
      .toFormat('yyyy-MM-dd HH:mm:ss ZZZZ'),
    localEndTime: DateTime.fromJSDate(shift.endTime)
      .setZone(timezone)
      .toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')
  };
}

// Parse user input
function parseUserDateTime(dateString, userTimezone = 'America/New_York') {
  // User provides: "2025-11-26 14:00"
  const dt = DateTime.fromFormat(dateString, 'yyyy-MM-dd HH:mm', {
    zone: userTimezone
  });

  // Convert to UTC for storage
  return dt.toUTC().toJSDate();
}

// In API response
app.get('/api/shifts/:id', async (req, res) => {
  const shift = await db.query('SELECT * FROM shifts WHERE id = $1', [req.params.id]);
  const userTimezone = req.query.timezone || 'UTC';

  res.json({
    success: true,
    data: formatShiftForTimezone(shift.rows[0], userTimezone)
  });
});
```

---

### 9. Testing Concurrent Signups

**Problem**: Simulate race conditions in tests.

**Solution**:
```javascript
const { test, expect } = require('@jest/globals');

test('should handle concurrent signups correctly', async () => {
  // Create a shift with capacity of 1
  const shift = await createTestShift({ capacity: 1 });

  // Create 5 volunteers
  const volunteers = await Promise.all(
    Array.from({ length: 5 }, () => createTestVolunteer())
  );

  // All 5 try to signup simultaneously
  const signupPromises = volunteers.map(v =>
    signupForShift(shift.id, v.id)
  );

  const results = await Promise.allSettled(signupPromises);

  // Exactly 1 should succeed
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
  expect(successful).toHaveLength(1);

  // Others should fail with SHIFT_FULL
  const failed = results.filter(r =>
    r.status === 'fulfilled' && !r.value.success && r.value.error === 'SHIFT_FULL'
  );
  expect(failed).toHaveLength(4);

  // Verify database state
  const signups = await db.query(
    'SELECT COUNT(*) FROM signups WHERE shift_id = $1 AND status = $2',
    [shift.id, 'confirmed']
  );
  expect(parseInt(signups.rows[0].count)).toBe(1);
});
```

---

### 10. Seeding Test Data

**Problem**: Need realistic data for development/demo.

**Solution**:
```javascript
const { faker } = require('@faker-js/faker');

async function seedDatabase() {
  console.log('Seeding database...');

  // Create organization
  const org = await db.query(
    'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
    ['Community Food Bank']
  );
  const orgId = org.rows[0].id;

  // Create 20 volunteers
  const volunteers = [];
  for (let i = 0; i < 20; i++) {
    const result = await db.query(
      `INSERT INTO volunteers (organization_id, name, email, phone)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        orgId,
        faker.person.fullName(),
        faker.internet.email(),
        faker.phone.number()
      ]
    );
    volunteers.push(result.rows[0].id);
  }

  // Create shifts for the next 30 days
  const shifts = [];
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);

    // Morning shift
    const morningStart = new Date(date.setHours(9, 0, 0, 0));
    const morningEnd = new Date(date.setHours(12, 0, 0, 0));

    const morning = await db.query(
      `INSERT INTO shifts (organization_id, title, start_time, end_time, capacity, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [orgId, 'Morning Food Distribution', morningStart, morningEnd, 8, 'Main Warehouse']
    );
    shifts.push(morning.rows[0].id);

    // Afternoon shift
    const afternoonStart = new Date(date.setHours(14, 0, 0, 0));
    const afternoonEnd = new Date(date.setHours(17, 0, 0, 0));

    const afternoon = await db.query(
      `INSERT INTO shifts (organization_id, title, start_time, end_time, capacity, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [orgId, 'Afternoon Food Distribution', afternoonStart, afternoonEnd, 6, 'Main Warehouse']
    );
    shifts.push(afternoon.rows[0].id);
  }

  // Create some signups (randomly fill 30-70% of shifts)
  for (const shiftId of shifts) {
    const numSignups = Math.floor(Math.random() * 4) + 2; // 2-5 signups
    const selectedVolunteers = faker.helpers.arrayElements(volunteers, numSignups);

    for (const volunteerId of selectedVolunteers) {
      try {
        await db.query(
          'INSERT INTO signups (shift_id, volunteer_id, status) VALUES ($1, $2, $3)',
          [shiftId, volunteerId, 'confirmed']
        );
      } catch (err) {
        // Skip if volunteer already signed up for this shift
      }
    }
  }

  console.log('Seeding complete!');
  console.log(`Created ${volunteers.length} volunteers`);
  console.log(`Created ${shifts.length} shifts`);
}

// Run with: node seed.js
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
```

---

## Key Takeaways

1. **Always use transactions** for operations that modify multiple tables
2. **Lock rows** when checking capacity to prevent race conditions
3. **Validate thoroughly** - both schema and business rules
4. **Handle errors gracefully** - return helpful error codes and messages
5. **Test concurrency** - simulate multiple users acting simultaneously
6. **Store dates in UTC** - convert to local time only for display
7. **Index appropriately** - shift start times, foreign keys, status fields
8. **Document assumptions** - explain your design decisions
9. **Keep it simple** - don't over-engineer for scale you don't need
10. **Write tests** - especially for critical signup/cancel flows
