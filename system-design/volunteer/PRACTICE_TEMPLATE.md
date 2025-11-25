# Practice Template: Volunteer Shift System

Use this template to practice building the system. Start from scratch and work through each section.

---

## Part 1: Project Setup (15 minutes)

### Initialize Project
```bash
mkdir volunteer-shift-system
cd volunteer-shift-system
npm init -y

# Install dependencies
npm install express pg dotenv
npm install --save-dev jest supertest nodemon

# Or for Python/FastAPI:
# pip install fastapi uvicorn sqlalchemy psycopg2-binary pytest
```

### Create Basic Structure
```
volunteer-shift-system/
├── src/
│   ├── index.js          # Entry point
│   ├── db.js             # Database connection
│   ├── routes/
│   │   ├── shifts.js     # Shift endpoints
│   │   └── signups.js    # Signup endpoints
│   ├── controllers/      # Business logic
│   └── middleware/       # Validation, error handling
├── tests/
│   ├── shifts.test.js
│   └── signups.test.js
├── migrations/
│   └── 001_initial_schema.sql
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

### Environment Setup
Create `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/volunteer_shifts
PORT=3000
NODE_ENV=development
```

---

## Part 2: Database Schema (20 minutes)

Create `migrations/001_initial_schema.sql`:

```sql
-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TODO: Add volunteers table
-- Columns: id, organization_id, name, email, phone, created_at

-- TODO: Add shifts table
-- Columns: id, organization_id, title, description, start_time, end_time, capacity, location, created_at

-- TODO: Add signups table
-- Columns: id, shift_id, volunteer_id, status, signed_up_at, cancelled_at
-- Unique constraint: (shift_id, volunteer_id)

-- TODO: Add waitlist table (optional)
-- Columns: id, shift_id, volunteer_id, position, created_at

-- TODO: Add indexes for performance
-- Index on: shifts.start_time, signups.shift_id, signups.volunteer_id
```

**Exercise**: Complete the TODOs above before looking at the solution.

---

## Part 3: Database Connection (10 minutes)

Create `src/db.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(-1);
});

module.exports = { pool };
```

**Exercise**: Write a function to run migrations from `migrations/` directory.

---

## Part 4: Basic Server Setup (15 minutes)

Create `src/index.js`:

```javascript
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// TODO: Import and mount routes
// app.use('/api/shifts', shiftsRouter);
// app.use('/api/signups', signupsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing
```

---

## Part 5: Shift CRUD Operations (30 minutes)

Create `src/routes/shifts.js`:

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/shifts - List all shifts
router.get('/', async (req, res, next) => {
  try {
    // TODO: Implement pagination (page, pageSize from query params)
    // TODO: Add filtering by date range
    // TODO: Include current signup count

    const result = await pool.query(`
      SELECT
        s.*,
        COUNT(su.id) as current_signups,
        s.capacity - COUNT(su.id) as available_spots
      FROM shifts s
      LEFT JOIN signups su ON su.shift_id = s.id AND su.status = 'confirmed'
      GROUP BY s.id
      ORDER BY s.start_time ASC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/shifts/:id - Get single shift
router.get('/:id', async (req, res, next) => {
  try {
    // TODO: Implement this
    // Include signup count and list of volunteers
  } catch (error) {
    next(error);
  }
});

// POST /api/shifts - Create new shift
router.post('/', async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, capacity, location } = req.body;

    // TODO: Add validation
    // - title required, 3-255 chars
    // - startTime must be in future
    // - endTime must be after startTime
    // - capacity must be positive integer

    const result = await pool.query(
      `INSERT INTO shifts (title, description, start_time, end_time, capacity, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, startTime, endTime, capacity, location]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/shifts/:id - Update shift
router.patch('/:id', async (req, res, next) => {
  try {
    // TODO: Implement this
    // Allow updating title, description, capacity, location
    // Don't allow changing times if signups exist
  } catch (error) {
    next(error);
  }
});

// DELETE /api/shifts/:id - Delete shift
router.delete('/:id', async (req, res, next) => {
  try {
    // TODO: Implement this
    // Should notify volunteers if shift has signups
    // Or prevent deletion if signups exist
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

**Exercise**: Complete all the TODOs above.

---

## Part 6: Signup Operations with Conflict Resolution (45 minutes)

Create `src/routes/signups.js`:

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /api/shifts/:shiftId/signup - Sign up for shift
router.post('/:shiftId/signup', async (req, res, next) => {
  const { shiftId } = req.params;
  const { volunteerId } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // TODO: Step 1 - Get shift details with lock
    // SELECT ... FROM shifts WHERE id = $1 FOR UPDATE

    // TODO: Step 2 - Check if volunteer exists

    // TODO: Step 3 - Check for schedule conflicts
    // Query for overlapping shifts this volunteer is signed up for

    // TODO: Step 4 - Check current signup count
    // If >= capacity, return error or add to waitlist

    // TODO: Step 5 - Check if already signed up

    // TODO: Step 6 - Create signup
    // INSERT INTO signups ...

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: signup });

  } catch (error) {
    await client.query('ROLLBACK');

    // Handle specific errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_SIGNED_UP', message: 'Already signed up for this shift' }
      });
    }

    next(error);
  } finally {
    client.release();
  }
});

// DELETE /api/shifts/:shiftId/signup/:volunteerId - Cancel signup
router.delete('/:shiftId/signup/:volunteerId', async (req, res, next) => {
  const { shiftId, volunteerId } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // TODO: Step 1 - Mark signup as cancelled
    // UPDATE signups SET status = 'cancelled', cancelled_at = NOW() ...

    // TODO: Step 2 - Check if there's a waitlist
    // If yes, promote first person

    // TODO: Step 3 - Update waitlist positions

    await client.query('COMMIT');
    res.json({ success: true });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// GET /api/volunteers/:volunteerId/shifts - Get volunteer's shifts
router.get('/volunteers/:volunteerId/shifts', async (req, res, next) => {
  try {
    const { volunteerId } = req.params;

    // TODO: Implement this
    // Get all shifts (past and future) for this volunteer
    // Include shift details and signup status

  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

**Exercise**: Complete the signup flow with all TODOs. This is the most critical part!

---

## Part 7: Testing (30 minutes)

Create `tests/signups.test.js`:

```javascript
const request = require('supertest');
const app = require('../src/index');
const { pool } = require('../src/db');

describe('Shift Signups', () => {
  let testShift;
  let testVolunteer;

  beforeAll(async () => {
    // Setup test database
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    await pool.query('ROLLBACK');
    await pool.end();
  });

  beforeEach(async () => {
    // Create test data
    const shift = await pool.query(
      `INSERT INTO shifts (title, start_time, end_time, capacity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      ['Test Shift', new Date('2025-12-01T10:00:00Z'), new Date('2025-12-01T12:00:00Z'), 5]
    );
    testShift = shift.rows[0];

    const volunteer = await pool.query(
      `INSERT INTO volunteers (name, email) VALUES ($1, $2) RETURNING *`,
      ['Test Volunteer', 'test@example.com']
    );
    testVolunteer = volunteer.rows[0];
  });

  test('should successfully signup for available shift', async () => {
    // TODO: Write test
  });

  test('should reject signup for full shift', async () => {
    // TODO: Fill shift to capacity
    // TODO: Try to signup another volunteer
    // TODO: Expect 409 error
  });

  test('should handle concurrent signups correctly', async () => {
    // TODO: Create shift with capacity 1
    // TODO: Create 5 volunteers
    // TODO: All try to signup simultaneously
    // TODO: Verify only 1 succeeds
  });

  test('should prevent double booking', async () => {
    // TODO: Volunteer signs up for shift A
    // TODO: Create overlapping shift B
    // TODO: Try to signup for shift B
    // TODO: Expect conflict error
  });

  test('should promote from waitlist on cancellation', async () => {
    // TODO: Fill shift to capacity
    // TODO: Add 2 volunteers to waitlist
    // TODO: Cancel one confirmed signup
    // TODO: Verify first waitlist person is now confirmed
  });
});
```

**Exercise**: Implement all test cases.

---

## Part 8: README Documentation (20 minutes)

Create `README.md`:

```markdown
# Volunteer Shift Signup System

[Brief description of what this system does]

## Assumptions

- [List your assumptions]
- Single organization for MVP
- No authentication (volunteer IDs provided)
- Times stored in UTC
- etc.

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation
\`\`\`bash
# Install dependencies
npm install

# Setup database
createdb volunteer_shifts
psql volunteer_shifts < migrations/001_initial_schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run server
npm start
\`\`\`

### Running Tests
\`\`\`bash
npm test
\`\`\`

## API Documentation

### Shifts

#### List Shifts
\`\`\`
GET /api/shifts?page=1&pageSize=20&startDate=2025-11-25
\`\`\`

[Include request/response examples]

## Design Decisions

### Concurrency Handling
I chose pessimistic locking (SELECT FOR UPDATE) because...

### Database Schema
I normalized the schema to...

### Error Handling
I implemented consistent error responses with codes...

## Trade-offs

1. **Pessimistic vs Optimistic Locking**
   - Chose pessimistic for simplicity and strong consistency
   - Trade-off: Slightly lower throughput under high contention
   - Alternative: Could use optimistic locking with retry logic

2. **Synchronous vs Asynchronous Notifications**
   - Currently notifications are TODO/stubbed
   - In production, would use message queue (SQS, RabbitMQ)

## Future Improvements

- [ ] Add authentication and authorization
- [ ] Implement notification system
- [ ] Add recurring shift templates
- [ ] Support multiple organizations
- [ ] Add volunteer skill matching
- [ ] Implement reporting/analytics
- [ ] Add API rate limiting
- [ ] Deploy with Docker

## Time Spent

- Setup & schema design: 1 hour
- Core CRUD operations: 2 hours
- Signup logic with conflict resolution: 2 hours
- Testing: 1.5 hours
- Documentation: 0.5 hours
- **Total: 7 hours**

With more time, I would:
- Implement the notification system
- Add more comprehensive tests
- Build a simple frontend
- Add monitoring and logging
\`\`\`

---

## Checklist Before Submission

- [ ] All endpoints implemented and working
- [ ] Race condition handling verified with tests
- [ ] Input validation on all endpoints
- [ ] Error handling returns helpful messages
- [ ] Database schema includes indexes
- [ ] At least 70% test coverage on critical paths
- [ ] README has clear setup instructions
- [ ] Code is formatted and linted
- [ ] Git commits are meaningful
- [ ] .env.example provided
- [ ] No sensitive data committed
- [ ] API returns consistent response format
- [ ] Handled timezone considerations
- [ ] Documented design decisions
- [ ] Listed assumptions and trade-offs
- [ ] Noted what you'd do with more time

---

## Common Mistakes to Avoid

1. ❌ Not using transactions for multi-step operations
2. ❌ Forgetting to lock rows when checking capacity
3. ❌ Not validating that end_time > start_time
4. ❌ Allowing volunteers to book overlapping shifts
5. ❌ Returning unclear error messages
6. ❌ Not testing concurrent signup scenarios
7. ❌ Storing times in local timezone instead of UTC
8. ❌ Missing indexes on frequently queried fields
9. ❌ Not documenting assumptions and trade-offs
10. ❌ Over-engineering with unnecessary features

---

## Practice Schedule

### Session 1 (3 hours): Basic CRUD
- Setup project and database
- Implement shift CRUD operations
- Basic validation

### Session 2 (3 hours): Signup Logic
- Implement signup endpoint
- Add conflict checking
- Handle race conditions with transactions

### Session 3 (2 hours): Advanced Features
- Implement cancellation
- Add waitlist functionality
- Test concurrent scenarios

### Session 4 (2 hours): Polish
- Write comprehensive tests
- Complete documentation
- Final code review and cleanup

---

## Tips for Success

1. **Start with the schema** - Get this right and everything else follows
2. **Test as you go** - Don't wait until the end to write tests
3. **Commit frequently** - Shows your thought process
4. **Document decisions** - Explain why you chose certain approaches
5. **Keep it simple** - Don't add features not in requirements
6. **Handle errors well** - Clear error messages show attention to detail
7. **Focus on correctness** - Better to have fewer features that work perfectly
8. **Read the requirements carefully** - Make sure you understand what's being asked
9. **Ask questions early** - Clarify ambiguities before coding
10. **Budget your time** - Don't spend 4 hours perfecting the schema

Good luck!
```

---

## Next Steps

1. Set up a practice repository
2. Work through the exercises in order
3. Time yourself on each section
4. Review your code against the quick reference
5. Do a full practice run before the real interview
