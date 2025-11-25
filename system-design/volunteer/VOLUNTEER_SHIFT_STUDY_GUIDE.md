# Volunteer Shift Signup System - Study Guide

## Overview
This guide will help you prepare for a take-home interview focused on designing and implementing a volunteer shift signup system. The guide includes system design concepts, implementation patterns, and hands-on exercises.

---

## Study Timeline (7-Day Plan)

### **Day 1-2: System Design Fundamentals**
**Focus**: Understanding the problem domain and high-level architecture

#### Topics to Master:
1. **Requirements gathering**
   - Functional requirements (what the system must do)
   - Non-functional requirements (performance, scalability, availability)
   - Constraints and assumptions

2. **Domain modeling**
   - Core entities: Volunteers, Shifts, Signups, Organizations
   - Entity relationships and cardinality
   - State machines for signup lifecycle

3. **High-level architecture**
   - Client-Server architecture
   - API design principles (REST vs GraphQL)
   - Service boundaries and responsibilities

#### Resources:
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- "Designing Data-Intensive Applications" by Martin Kleppmann (Chapters 1-3)
- [Web Scalability for Startup Engineers](https://www.lecloud.net/tagged/scalability)

#### Hands-On Exercise:
Create a requirements document for a volunteer shift system. Include:
- User stories for volunteers and coordinators
- Capacity planning: estimate requests/second, data storage
- Draw a high-level architecture diagram (boxes and arrows)

---

### **Day 3: Database Design & Data Modeling**
**Focus**: Designing schemas that support your requirements

#### Topics to Master:
1. **Schema design**
   - Normalization vs denormalization
   - Choosing primary keys (UUID vs auto-increment)
   - Foreign key relationships and constraints
   - Indexes for query performance

2. **Specific patterns for scheduling systems**
   - Handling recurring events
   - Time-based queries and indexing
   - Audit trails and soft deletes
   - Timezone storage (always UTC!)

3. **SQL vs NoSQL decision making**
   - When to use SQL (ACID transactions, complex queries)
   - When to use NoSQL (flexibility, horizontal scaling)

#### Resources:
- [SQL Tutorial - Mode Analytics](https://mode.com/sql-tutorial/)
- [Database Design Course](https://www.youtube.com/watch?v=ztHopE5Wnpc)
- PostgreSQL documentation on indexes and transactions

#### Hands-On Exercise:
Design the complete database schema:
```sql
-- Create tables for:
-- 1. volunteers
-- 2. shifts
-- 3. signups
-- 4. waitlist (bonus)
-- 5. organizations
--
-- Include:
-- - Appropriate data types
-- - Primary and foreign keys
-- - Indexes on commonly queried fields
-- - CHECK constraints for business rules
-- - Created_at/updated_at timestamps
```

Practice writing queries:
- Find all available shifts for a given date range
- List volunteers signed up for a specific shift
- Count how many shifts a volunteer has completed
- Find shifts that are nearly full (>80% capacity)

---

### **Day 4: API Design & Implementation**
**Focus**: Building RESTful APIs with proper validation

#### Topics to Master:
1. **REST API principles**
   - Resource naming conventions
   - HTTP methods (GET, POST, PUT/PATCH, DELETE)
   - Status codes (200, 201, 400, 404, 409, 500)
   - Request/response formats (JSON)

2. **API patterns for scheduling**
   - Pagination and filtering
   - Sorting and searching
   - Idempotency for critical operations
   - Rate limiting

3. **Input validation**
   - Schema validation (Joi, Yup, Pydantic)
   - Business rule validation
   - Error message clarity

#### Resources:
- [REST API Tutorial](https://restfulapi.net/)
- [Microsoft API Design Guidelines](https://github.com/microsoft/api-guidelines)
- Express.js or FastAPI documentation

#### Hands-On Exercise:
Implement these core endpoints (pseudocode or real code):

```javascript
// Core shift endpoints
GET    /api/shifts
GET    /api/shifts/:id
POST   /api/shifts
PATCH  /api/shifts/:id
DELETE /api/shifts/:id

// Signup operations
POST   /api/shifts/:id/signup
DELETE /api/shifts/:id/signup/:volunteerId

// Volunteer operations
GET    /api/volunteers/:id/shifts
GET    /api/volunteers/:id/upcoming-shifts
```

Write validation logic for:
- Shift start time must be in the future
- Capacity must be positive
- End time must be after start time
- Volunteer can't signup for overlapping shifts

---

### **Day 5: Concurrency & Race Conditions**
**Focus**: Handling simultaneous signups correctly

#### Topics to Master:
1. **Concurrency problems**
   - Race conditions in signup scenarios
   - Lost updates problem
   - Phantom reads

2. **Solutions**
   - Database transactions (BEGIN/COMMIT/ROLLBACK)
   - Isolation levels (READ COMMITTED, SERIALIZABLE)
   - Pessimistic locking (SELECT FOR UPDATE)
   - Optimistic locking (version numbers)
   - Distributed locks (Redis)

3. **Testing concurrent scenarios**
   - Simulating race conditions
   - Load testing tools (k6, Apache Bench)

#### Resources:
- PostgreSQL docs on [transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Designing Data-Intensive Applications Chapter 7: Transactions](https://dataintensive.net/)
- [Understanding Database Locking](https://www.postgresql.org/docs/current/explicit-locking.html)

#### Hands-On Exercise:
Implement signup logic that prevents overbooking:

```javascript
async function signupForShift(shiftId, volunteerId) {
  // Start transaction
  // 1. Lock the shift row
  // 2. Check current capacity vs max capacity
  // 3. Check volunteer doesn't have conflicting shift
  // 4. If space available: insert signup, increment counter
  // 5. If full: add to waitlist
  // 6. Commit transaction
  // Handle errors and rollback
}
```

Write tests that:
- Simulate 10 volunteers signing up for 1 remaining spot
- Verify only 1 succeeds, others get proper error/waitlist
- Test cancellation logic (removing signup, promoting from waitlist)

---

### **Day 6: Advanced Features & Edge Cases**
**Focus**: Waitlists, notifications, and error handling

#### Topics to Master:
1. **Waitlist management**
   - Queue data structures
   - Auto-promotion logic
   - Position tracking

2. **Notification systems**
   - Email/SMS for confirmations
   - Reminder notifications
   - Async job processing (queues)

3. **Edge cases**
   - Shift cancellation by coordinator
   - Volunteer no-shows
   - Last-minute changes
   - Timezone conversions for users

4. **Background jobs**
   - Job queues (Bull, Celery)
   - Cron jobs for reminders
   - Retry logic and dead letter queues

#### Resources:
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [SendGrid Email API](https://docs.sendgrid.com/)
- [Handling Timezones in JavaScript](https://moment.github.io/luxon/)

#### Hands-On Exercise:
Implement waitlist logic:
```javascript
// When volunteer cancels a full shift:
// 1. Remove their signup
// 2. Find next person on waitlist
// 3. Move them to confirmed signups
// 4. Send notification
// 5. Update waitlist positions
```

Add a background job:
```javascript
// Daily reminder job (pseudo-cron)
// - Find shifts happening in next 24 hours
// - For each shift, get confirmed volunteers
// - Send reminder email/notification
```

---

### **Day 7: Testing, Documentation & Polish**
**Focus**: Making your solution production-ready

#### Topics to Master:
1. **Testing strategy**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - End-to-end tests for critical flows
   - Test coverage goals (70%+ is good)

2. **Documentation**
   - README with setup instructions
   - API documentation (Swagger/OpenAPI)
   - Architecture decision records (ADRs)
   - Code comments for complex logic

3. **Code quality**
   - Linting and formatting
   - Error handling patterns
   - Logging best practices
   - Security considerations (SQL injection, XSS)

4. **Deployment readiness**
   - Environment variables for config
   - Database migrations
   - Seed data for testing
   - Docker containerization (optional)

#### Resources:
- [Jest Testing Framework](https://jestjs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Swagger API Documentation](https://swagger.io/docs/)
- [12 Factor App Methodology](https://12factor.net/)

#### Hands-On Exercise:
Create a complete take-home submission structure:

```
volunteer-shift-system/
├── README.md              # Setup, assumptions, design decisions
├── ARCHITECTURE.md        # System design, diagrams, tradeoffs
├── API.md                 # API documentation with examples
├── docker-compose.yml     # Local development setup
├── .env.example           # Environment variables template
├── package.json           # Dependencies
├── src/
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, validation, error handling
│   ├── services/         # External services (email, etc)
│   └── utils/            # Helper functions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/         # Test data
└── migrations/           # Database migrations
```

Write your README.md with:
- Problem statement and assumptions
- Setup instructions (5 minutes or less)
- How to run tests
- API endpoint examples
- Design decisions and tradeoffs
- Future improvements
- Time spent and what you'd do with more time

---

## Quick Reference Cheat Sheets

### Database Schema Template
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  skills TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  location VARCHAR(255),
  required_skills TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled, completed
  signed_up_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  UNIQUE(shift_id, volunteer_id)
);

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shift_id, volunteer_id)
);

-- Indexes for performance
CREATE INDEX idx_shifts_start_time ON shifts(start_time);
CREATE INDEX idx_shifts_organization ON shifts(organization_id);
CREATE INDEX idx_signups_shift ON signups(shift_id);
CREATE INDEX idx_signups_volunteer ON signups(volunteer_id);
CREATE INDEX idx_waitlist_shift_position ON waitlist(shift_id, position);
```

### API Response Formats
```json
// Success response
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Food Bank Shift",
    "startTime": "2025-11-26T09:00:00Z",
    "endTime": "2025-11-26T12:00:00Z",
    "capacity": 10,
    "currentSignups": 7,
    "availableSpots": 3
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "SHIFT_FULL",
    "message": "This shift is currently full. You have been added to the waitlist.",
    "details": {
      "waitlistPosition": 3
    }
  }
}

// List response with pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 157,
    "totalPages": 8
  }
}
```

### Transaction Pattern (Node.js/PostgreSQL)
```javascript
const signup = async (shiftId, volunteerId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock the shift row to prevent race conditions
    const shiftResult = await client.query(
      'SELECT capacity, (SELECT COUNT(*) FROM signups WHERE shift_id = $1 AND status = $2) as current_count FROM shifts WHERE id = $1 FOR UPDATE',
      [shiftId, 'confirmed']
    );

    if (shiftResult.rows.length === 0) {
      throw new Error('Shift not found');
    }

    const { capacity, current_count } = shiftResult.rows[0];

    if (current_count >= capacity) {
      // Add to waitlist
      const position = await client.query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM waitlist WHERE shift_id = $1',
        [shiftId]
      );

      await client.query(
        'INSERT INTO waitlist (shift_id, volunteer_id, position) VALUES ($1, $2, $3)',
        [shiftId, volunteerId, position.rows[0].next_position]
      );

      await client.query('COMMIT');
      return { status: 'waitlisted', position: position.rows[0].next_position };
    }

    // Create signup
    await client.query(
      'INSERT INTO signups (shift_id, volunteer_id, status) VALUES ($1, $2, $3)',
      [shiftId, volunteerId, 'confirmed']
    );

    await client.query('COMMIT');
    return { status: 'confirmed' };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

---

## Practice Problems

### Problem 1: Basic Implementation (2-3 hours)
Build a minimal API with these endpoints:
- Create a shift
- List available shifts
- Signup for a shift
- Cancel a signup

Requirements:
- Use any language/framework you're comfortable with
- In-memory data store is fine (or SQLite)
- No authentication needed
- Basic validation only

### Problem 2: Add Concurrency Handling (1-2 hours)
Enhance Problem 1 to handle:
- Race condition when multiple volunteers signup for last spot
- Test with concurrent requests
- Implement proper error messages

### Problem 3: Add Waitlist Feature (2-3 hours)
Add waitlist functionality:
- When shift is full, volunteers join waitlist
- When someone cancels, promote first person from waitlist
- API to view waitlist position

### Problem 4: Full System (8-12 hours)
Complete production-ready system with:
- Database (PostgreSQL)
- Full CRUD for shifts and volunteers
- Signup/cancel with conflict resolution
- Waitlist with auto-promotion
- Basic email notifications (mock or real)
- Comprehensive tests
- Docker setup
- Complete documentation

---

## Common Interview Pitfalls to Avoid

1. **Over-engineering**: Don't build for 1 million users if the problem says "small nonprofit"
2. **Under-engineering**: Don't ignore concurrency issues or validation
3. **Poor error handling**: Return helpful error messages, not just 500s
4. **Ignoring timezones**: Always store times in UTC, convert for display
5. **No tests**: Write at least some tests for critical paths
6. **Bad README**: Interviewers need to run your code easily
7. **Incomplete features**: Better to have 3 polished features than 10 half-done
8. **No design documentation**: Explain your thinking, tradeoffs, and decisions
9. **Hardcoded values**: Use environment variables for configuration
10. **Security holes**: Validate inputs, prevent SQL injection, handle auth properly

---

## Pre-Interview Checklist

Before you receive the actual take-home:

- [ ] Choose your tech stack and be comfortable with it
- [ ] Have a project template ready (DB setup, basic server, testing framework)
- [ ] Know how to implement database transactions in your language
- [ ] Practice drawing architecture diagrams (use Excalidraw, Draw.io)
- [ ] Have a README template with sections for setup, design, etc.
- [ ] Review your last few projects for code quality standards
- [ ] Test your Docker setup if using containers
- [ ] Prepare questions to ask the interviewer about requirements

---

## During the Take-Home

### Time Management (assuming 8-hour take-home):
- **Hour 1**: Read requirements, ask clarifying questions, design schema
- **Hours 2-3**: Setup project, database, core models
- **Hours 4-5**: Implement core API endpoints
- **Hour 6**: Add conflict resolution and validation
- **Hour 7**: Write tests for critical paths
- **Hour 8**: Documentation, README, polish, final review

### Git Commit Strategy:
Make frequent, meaningful commits:
```
git commit -m "Initial project setup with Express and PostgreSQL"
git commit -m "Add database schema and migrations"
git commit -m "Implement shift CRUD endpoints"
git commit -m "Add signup endpoint with capacity checking"
git commit -m "Implement transaction-based concurrency control"
git commit -m "Add tests for signup race conditions"
git commit -m "Add API documentation and README"
```

---

## Recommended Tech Stacks

### Stack 1: JavaScript/Node.js
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with `pg` driver
- **Testing**: Jest + Supertest
- **Validation**: Joi or Yup
- **Good for**: Fast prototyping, JavaScript developers

### Stack 2: Python
- **Runtime**: Python 3.9+
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **Testing**: Pytest
- **Validation**: Pydantic (built into FastAPI)
- **Good for**: Clean code, automatic API docs

### Stack 3: TypeScript/Node.js
- **Runtime**: Node.js with TypeScript
- **Framework**: Express or NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest
- **Validation**: Zod
- **Good for**: Type safety, catching bugs early

---

## Additional Resources

### Books:
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "System Design Interview" - Alex Xu
- "Database Design for Mere Mortals" - Michael Hernandez

### Online Courses:
- [Grokking the System Design Interview](https://www.educative.io/courses/grokking-the-system-design-interview)
- [SQL for Data Analysis](https://mode.com/sql-tutorial/)
- [REST API Design Course](https://www.udemy.com/course/rest-api/)

### YouTube Channels:
- Hussein Nasser (Database and backend concepts)
- Gaurav Sen (System design)
- Tech Dummies (System design interviews)

### Practice Platforms:
- LeetCode (for system design discussions)
- Exercism (for language practice)
- GitHub (review other scheduling systems)

---

## Sample Questions to Ask Interviewer

Before starting, clarify:
1. What's the expected time commitment? (4 hours? 8 hours? Weekend project?)
2. Should I focus more on system design or implementation?
3. Are there specific technologies you'd like me to use?
4. What's the expected scale? (users, organizations, shifts per day)
5. Are there specific features that are must-haves vs nice-to-haves?
6. Should I deploy it somewhere or is local development fine?
7. What's more important: test coverage or feature completeness?

---

## Final Tips

1. **Start simple, iterate**: Get basic functionality working first
2. **Time-box your work**: Don't spend 3 hours on the perfect database schema
3. **Document as you go**: Write README sections while building
4. **Test critical paths**: Focus tests on signup/cancel race conditions
5. **Show your thinking**: Comments in code, design docs, commit messages
6. **Ask questions early**: Don't wait until last day to clarify requirements
7. **Use Git properly**: Commit frequently with clear messages
8. **Review before submitting**: Run through the setup instructions fresh
9. **Explain tradeoffs**: Discuss what you'd do differently with more time
10. **Be honest about time**: If specs say 4 hours but it took 6, say so

Good luck with your interview!
