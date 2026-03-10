							# Background Jobs: Async Patterns, Idempotency, and Reliable Queue Design

> **Goal**: Know when to defer work, how to make deferred work reliable, and how to operate a job queue at scale.
>
> **Companion exercises**: `level-1-sync-vs-async.rb`, `level-2-idempotency.rb`, `level-3-retry-strategy.rb`

---

## 1. Overview

Every web application eventually has work it should not do in the request cycle. Email sending, image processing, third-party API calls, search index updates — these are slow, potentially flaky, and the user doesn't need to wait for them. Background jobs are the answer. But "just throw it in a job" is not a system design answer. The real questions are: How do you make the job reliable? How do you handle failure? How do you scale the workers? How do you know it's working?

---

## 2. Core Concept & Mental Model

### The Restaurant Kitchen Analogy

A waiter (your web server) takes orders and delivers food. The kitchen (background worker) does the actual cooking. When a customer orders dessert, the waiter doesn't stand at the table while the kitchen bakes a soufflé — they take the order, write it on a ticket, and go serve other tables. The kitchen processes tickets in order.

**Sync work** = the waiter standing at the table while the kitchen cooks. Customer waits. Other tables wait.

**Async work** = the ticket system. Order is recorded instantly. Waiter is freed. Kitchen processes at its own pace. Customer gets notified when it's ready.

The catch: tickets can get lost. The kitchen might burn down. The soufflé might fail and need to be retried. These are the reliability problems that background job systems exist to solve.

---

## 3. Building Blocks — Progressive Learning

### Level 1: Sync or Async — The Decision Framework

**Why this level matters**

The decision to defer work is an architectural decision. Deferred work that should be synchronous causes correctness bugs (payment confirmed but no inventory decremented). Synchronous work that should be deferred causes slow requests and cascading failures.

**Three signals for async**

```
1. Slow: the operation takes > ~100ms (email, image processing, external API)
2. Deferrable: the user doesn't need the result before seeing the response
3. Retryable: if it fails, you can try again without user interaction

ALL THREE must be true. If any is false, lean toward sync.

Charge a credit card -> SYNC
  Slow? Sometimes (300ms). But:
  Deferrable? NO. User needs to know if the charge succeeded before proceeding.
  -> Sync. User waits. That's correct.

Send a receipt email -> ASYNC
  Slow? Yes (200ms+ per email service call).
  Deferrable? Yes. User is looking at the success page.
  Retryable? Yes. Transient email service failure should be retried.
  -> Async.

Decrement inventory count -> SYNC
  Deferrable? NO. Must happen in the same transaction as the order.
  If the order commits but inventory async fails, you've oversold.
  -> Sync. Inside the same DB transaction.
```

**What to pass to a job**

```
Rule: always pass IDs, never full objects.

Why:
  You enqueue the job at time T. The job executes at time T + N seconds/minutes.
  The object you serialized at T might have changed by T + N.
  By the time the job runs, your serialized object is stale.
  Passing the ID means the job fetches fresh data at execution time.

def perform(user_id)
  user = User.find(user_id)   # fresh at execution time
  UserMailer.welcome(user).deliver_now
end

# WRONG: serializing the object
def perform(user)  # user was captured at enqueue time, now stale
  UserMailer.welcome(user).deliver_now
end
```

**The time budget**

```
Acceptable web request response time: ~200ms (user-facing)
DB + auth overhead: ~50ms
Budget for synchronous work: 150ms

Any single operation > 150ms in your request path is a background job candidate.

Example breakdown:
  DB write (user record):   20ms -> sync
  Auth check:               10ms -> sync
  Welcome email (Mailgun):  300ms -> async (over budget)
  Image resize:             2000ms -> async
  Slack notification:       200ms -> async
  Cache write:              5ms -> sync
```

> **Mental anchor**: "Slow + deferrable + retryable = async. Always pass IDs. Over time budget = async. Never serialize full objects."

---

**-> Bridge to Level 2**: You've decided to defer the work. Now the dangerous part: jobs WILL run more than once. Networks fail. Workers crash mid-execution. The job framework will retry. If your job is not idempotent, retries cause bugs.

### Level 2: Idempotency — Making Jobs Safe to Run Multiple Times

**Why this level matters**

"At-least-once delivery" is the default for every major queue (SQS, Sidekiq, RabbitMQ). This means your job will be delivered at least once, but might be delivered twice, five times, or fifty times under failure conditions. If your job is not idempotent, you get double emails, double charges, double inventory decrements.

**What idempotent means**

```
A function is idempotent if calling it multiple times produces the same result
as calling it once.

f(x) = x^2
  idempotent? No. f(f(3)) = f(9) = 81 != f(3) = 9.

SET user.email_verified = true
  idempotent? YES. Running this 5 times has the same result as running it once.

SEND welcome email to user
  idempotent? NO (by default). Running twice sends two emails.
  Needs explicit idempotency protection.

INCREMENT user.login_count
  idempotent? NO. Each run adds 1. Must be redesigned.
  Fix: log each login event as a separate row, count rows. Inserting the same
  row twice can be made idempotent with a unique constraint.
```

**Idempotency patterns**

```
Pattern 1: Unique idempotency key (Redis or DB check before processing)

  def perform(user_id, event_id)
    key = "job:welcome_email:#{user_id}:#{event_id}"
    return if redis.exists?(key)      # already processed

    redis.setex(key, 86_400, "1")     # mark as in-progress
    UserMailer.welcome(User.find(user_id)).deliver_now
  end

  Pro: simple. Works for any operation.
  Con: Redis key TTL means protection is not permanent. Race condition possible
       between check and set (use SET NX for atomic check-and-set).

  Atomic version (Redis NX):
    return unless redis.set(key, "1", nx: true, ex: 86400)

Pattern 2: Database upsert (for DB write jobs)

  def perform(user_id, event_id)
    EmailLog.create_or_find_by!(user_id: user_id, event_id: event_id)
    # If record already exists (constraint violation), find it instead.
    # Job can safely run again; the DB prevents the duplicate.
    UserMailer.welcome(User.find(user_id)).deliver_now
  end

  Pro: durable (persisted, not just Redis). Self-documenting.
  Con: requires a DB table for tracking.
  Use: when you need a permanent audit trail of job execution.

Pattern 3: Natural idempotency (redesign the operation)

  BAD (not idempotent):
    user.increment!(:login_count)      # adds 1 every time

  GOOD (idempotent via event log):
    LoginEvent.find_or_create_by!(user_id:, occurred_at:, session_id:)
    # Unique constraint on session_id prevents duplicate events.
    # login_count = LoginEvent.where(user: user).count  <- derived, always correct

  Pro: correct by design. No special protection needed.
  Con: requires data model changes.
```

> **Mental anchor**: "Jobs run more than once. Idempotency = safe to call twice. Check before act (Redis NX). DB upsert for writes. Natural idempotency by redesigning the operation."

---

**-> Bridge to Level 3**: Jobs will fail. The question is not whether to retry but HOW to retry — and when to give up entirely.

### Level 3: Retry Strategy, Queue Architecture, and Failure Handling

**Why this level matters**

Undifferentiated retries are dangerous. Retrying a "card permanently declined" error 25 times wastes resources and achieves nothing. Not retrying a "network timeout" means losing work that would have succeeded on attempt 2. The retry strategy must match the failure type.

**Failure taxonomy**

```
Transient failure:
  Cause: temporary condition that will resolve itself.
  Examples: network timeout, downstream API rate limit, DB connection pool exhausted.
  Correct action: RETRY with exponential backoff.
  Example: Sidekiq default (25 retries over 21 days).

Permanent failure:
  Cause: fundamental problem that will not resolve with time.
  Examples: card permanently declined, invalid email address (hard bounce),
            malformed input data, resource not found (deleted record).
  Correct action: DISCARD (move to dead letter queue, alert, stop retrying).

Resource failure:
  Cause: the job's dependency is down (database, third-party service).
  Correct action: RETRY with longer backoff. Also alert — this is an outage.
```

**Exponential backoff**

```
Retry attempt    Delay
-------------    -----
1                30 seconds
2                2 minutes
3                8 minutes
4                30 minutes
5                2 hours
...
25               ~21 days

Formula (Sidekiq default): (retry_count^4) + 15 + (rand(30) * (retry_count + 1))
The random jitter (rand(30)) prevents all retried jobs from firing simultaneously.
Always include jitter in any backoff formula.

Without jitter: all jobs that failed at the same time retry at the same time.
-> Synchronized retry storm. The downstream service gets hammered again. Fails again.
With jitter: retries spread out over time. Load is distributed. Recovery succeeds.
```

**Queue architecture by priority**

```
Problem: a single queue where "send 1M marketing emails" and
"send order confirmation" compete means order confirmations are delayed.

Solution: separate queues by SLA:

  Queue: critical   (< 1 second SLA)
    -> Payment confirmations
    -> Auth tokens
    -> Real-time notifications
    -> 2 dedicated workers, no backlog tolerance

  Queue: default    (< 30 second SLA)
    -> Email notifications (transactional)
    -> Search index updates
    -> Activity feed updates
    -> 10 workers, moderate backlog tolerance

  Queue: bulk       (< 1 hour SLA)
    -> Marketing email campaigns
    -> Report generation
    -> Data exports
    -> 5 workers, high backlog tolerance

Sidekiq config:
  sidekiq_options queue: :critical, retry: 3
  sidekiq_options queue: :bulk, retry: 5
```

**Dead letter queue (DLQ)**

```
Every queue needs a dead letter destination.
When a job exhausts all retries, it goes to the DLQ instead of being silently dropped.

DLQ rules:
  1. Never delete DLQ entries automatically.
  2. Alert when DLQ count > 0.
  3. DLQ entries are for human inspection: understand why the job failed permanently.
  4. Provide a UI or tooling to replay DLQ entries after fixing the root cause.

What NOT to do:
  -> Silently drop failed jobs (you'll never know what was lost)
  -> Retry indefinitely (permanent failures waste resources forever)
  -> Have one DLQ for all queues (mixing critical failures with bulk failures)
```

**Queue health metrics to monitor**

```
queue_depth:         how many jobs waiting? (gauge per queue)
                     Alert: critical queue > 100, default > 10,000
job_duration_p99:    99th percentile execution time (histogram)
                     Alert: duration > 2x the expected SLA
error_rate:          % of jobs failing (counter)
                     Alert: error_rate > 5% for any queue
retry_rate:          % of jobs needing at least 1 retry
                     Warning: > 10% signals instability in a dependency
dead_letter_count:   jobs that gave up (counter per queue)
                     Alert: dead_letter_count > 0 (page on-call for critical)
worker_utilization:  % of workers busy
                     Alert: > 80% sustained (need more workers)
```

> **Mental anchor**: "Retry transient. Discard permanent. Exponential backoff with jitter. Separate queues by SLA. DLQ for everything. Alert on queue depth, error rate, and dead letter."

---

## 4. Decision Framework

```
Sync or async?
  User needs result before response AND operation can fail the request -> sync
  Slow + deferrable + retryable -> async

What to pass?
  Always IDs. Never serialized objects.

Idempotency strategy?
  Non-critical, fire-and-forget event -> Redis NX key
  DB write, need audit trail -> DB upsert with unique constraint
  Can redesign as event log -> natural idempotency (best)

Retry or discard?
  Transient (network, rate limit, connection pool) -> retry with backoff + jitter
  Permanent (validation, not-found, card declined) -> discard to DLQ

Queue priority?
  < 1 sec SLA: critical queue
  < 30 sec SLA: default queue
  < 1 hr SLA:  bulk queue
```

---

## 5. Common Gotchas

**1. Enqueuing a job inside a transaction**

`after_create` callbacks run inside the database transaction. If you enqueue a job in `after_create`, the job might execute before the transaction commits. The job calls `User.find(id)` and gets `RecordNotFound`. Use `after_commit` for job enqueueing, not `after_create`.

**2. Jobs that are not atomic**

A job that does Step A and Step B should be written so that if it fails between A and B and is retried, running it again doesn't cause a problem. Either make both steps idempotent, or use a database transaction to wrap them, or break them into two separate jobs with individual idempotency.

**3. Unbounded job fan-out**

A job that enqueues N more jobs (e.g., "notify all followers") can create a runaway cascade. A user with 10M followers enqueues 10M jobs. Queue depth hits 10M. Workers are overwhelmed. Implement backpressure: if queue depth > threshold, delay or batch the fan-out.

**4. Missing dead letter alerting**

Jobs that fail permanently vanish silently without a DLQ. You'll never know what was lost. Always configure a DLQ and always alert when it receives items.

---

## 6. Practice Scenarios

- [ ] "A user signs up. Design the full async pipeline for what happens next." (Welcome email, Slack notify, search indexing, analytics — fan-out. All async. Idempotency key on each.)
- [ ] "Your email job is retrying 25 times because the email address is invalid (hard bounce). Fix it." (Catch the specific exception, rescue and discard to DLQ instead of retrying)
- [ ] "Your payment job runs twice during a network partition and the customer is charged twice. How do you prevent this?" (Idempotency key in the payment API call. Check before charge.)
- [ ] "Your Sidekiq queue depth is growing. Workers can't keep up. What do you do?" (Add workers, check for slow jobs, check for retry storms, add backpressure)
- [ ] "Design the job architecture for a notification system with 3 tiers: SMS (1s SLA), email (10s SLA), weekly digest (1hr SLA)." (Three separate queues, dedicated workers per tier, DLQ per queue)

**Run the exercises**:
```
ruby level-1-sync-vs-async.rb
ruby level-2-idempotency.rb
ruby level-3-retry-strategy.rb
```
