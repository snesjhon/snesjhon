# Interview Prep: Final Round Overview

Three sessions. Three domains. One mental model each.

---

## Backend Coding Exercise (1hr)

**Mental Model**: You are a surgeon. Diagnose before you cut. Think aloud every step.

| Topic | File | Key Concept |
|-------|------|-------------|
| Rails CRUD + API | `01-rails-crud-api.md` | GraphQL mutations/queries, input types, auth/authz |
| ActiveRecord patterns | `02-activerecord-patterns.md` | N+1, includes vs joins, transactions |
| Background jobs | `03-background-jobs.md` | Sidekiq/ActiveJob, idempotency, retries |
| AWS fundamentals | `04-aws-fundamentals.md` | S3, EC2, RDS, SQS basics |

---

## System Design (1hr)

**Mental Model**: You are an architect. Always justify the beam before placing it.

| Topic | File | Key Concept |
|-------|------|-------------|
| API design | `05-system-design-api-graphql.md` | GraphQL-first design, schema, resolvers, N+1 |
| Back of envelope | `05-system-design-api-graphql.md` | QPS, storage, bandwidth estimates |
| CAP theorem | `../system-design/03-cap-theorem.md` | CP vs AP, which data needs what |
| Caching | `../system-design/04-caching-strategies.md` | Cache-aside, TTL, stampede |
| Background jobs | `03-background-jobs.md` | Queue depth, retry, idempotency |
| GraphQL schema | `05-system-design-api-graphql.md` | Types, resolvers, N+1 in GraphQL |
| Scalable pipelines | `06-scalable-pipelines.md` | Partitioning, fan-out, observability |

---

## Stack Assumption

All exercises and examples assume this architecture:
- **Backend**: Rails (API-only mode, no ERB views)
- **API layer**: GraphQL (`POST /graphql` single endpoint — no 7 REST routes)
- **Frontend**: React (manages form state for create/edit; reads mutation responses)

If a note mentions `respond_to`, `render :new`, or `redirect_to`, mentally replace it with the GraphQL equivalent (mutation payload with `errors:` array or `post:` on success).

---

## The Interview Formula

### Backend Coding
```
1. Read the problem -> Clarify: "Should this be paginated? Authenticated?"
2. Sketch the model/controller skeleton -> Talk through it
3. Write the happy path -> Then add edge cases
4. Mention what you'd test and how
5. Note performance implications (N+1, index, transaction boundary)
```

### System Design
```
1. Clarify scope -> "Is this for 1M or 100M users? Read-heavy or write-heavy?"
2. Estimate -> QPS, storage, bandwidth (back of envelope)
3. High-level diagram -> Client -> LB -> App -> Cache -> DB
4. Drill into the interesting parts -> Don't boil the ocean
5. Trade-off every decision -> "I chose X over Y because..."
6. Operational concerns last -> Monitoring, failure modes, scaling
```

---

## React Frontend Interview (1hr)

**Mental Model**: You are a senior engineer pairing with your interviewer. Design before you type. Narrate every decision.

| Topic | File | Key Concept |
|-------|------|-------------|
| React component build | `07-react-interview/` | Hooks, state design, optimistic updates, a11y |

---

## Files in This Directory

```
interview-prep/
  00-overview.md                  <- you are here
  01-rails-crud-api.md            <- Rails CRUD patterns + API building
  02-activerecord-patterns.md     <- Queries, includes/joins, transactions
  03-background-jobs.md           <- Sidekiq/ActiveJob deep dive
  04-aws-fundamentals.md          <- S3, EC2, RDS, SQS, IAM
  05-system-design-api-graphql.md <- API design, back-of-envelope, GraphQL
  06-scalable-pipelines.md        <- Scalable system design patterns
  07-react-interview/
    00-overview.md                <- how to approach the interview
    requirements.md               <- the spec (read this first, then code)
    concepts.md                   <- key React patterns to know cold
    starter/ActivityFeed.tsx      <- start here
    solution/ActivityFeed.tsx     <- reference solution
    solution/useActivityFeed.ts   <- extracted hook solution
    solution/WALKTHROUGH.md       <- what to say for each decision
```
