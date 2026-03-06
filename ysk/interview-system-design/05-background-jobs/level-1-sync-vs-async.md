# Level 1: Sync or Async — Classifying Operations

> **Goal**: Correctly classify operations as synchronous or asynchronous, understand the time budget model, and apply the "what to pass" rule.

---

## The three signals for async

An operation should be async if it meets ALL three:
1. **Slow** (> ~100ms): email, image processing, external API calls
2. **Deferrable**: the user doesn't need the result before seeing the response
3. **Retryable**: if it fails, it can be retried without user interaction

If ANY signal is missing — lean sync.

---

## Exercise 1: Sync or async?

Before classifying each row, write which signal(s) it fails for sync operations:

| Operation | Sync or Async? | Missing signal (if async) |
|-----------|---------------|--------------------------|
| Validate user input params | | |
| Save user to the database | | |
| Send welcome email | | |
| Post a message to a Slack channel | | |
| Generate a PDF report | | |
| Check if a user exists | | |
| Resize an uploaded image | | |
| Charge a credit card | | |
| Update an Elasticsearch index | | |
| Decrement inventory count (in same transaction as order) | | |
| Send SMS verification code | | |
| Sync data to an analytics platform | | |
| Generate a thumbnail for a video | | |
| Insert an order row to the database | | |

**Tricky one**: Why is "charge a credit card" synchronous even though it can be slow (external API call)?

> _Your answer:_

---

## Exercise 2: What do you pass to a background job?

**Rule**: Always pass IDs only. Never serialize and pass the full object.

**Why**: The object you serialize at enqueue time is already stale by the time the job runs. The job must fetch fresh data from the DB at execution time.

| Scenario | Pass ID only or full object? | Why? |
|----------|------------------------------|------|
| Recently created user | | |
| Post with many associations | | |
| Large order object | | |
| Simple scalar like email | | |
| Notification with metadata | | |

**Follow-up**: You enqueue `SendWelcomeEmailJob.perform_later(user)` instead of `SendWelcomeEmailJob.perform_later(user.id)`. The user updates their email 2 seconds later. What does the job send?

> _Your answer:_

---

## Exercise 3: Time budget

Your total acceptable response time is **200ms**. DB + auth overhead takes **50ms**. That leaves **150ms** for synchronous work.

Any single operation exceeding the remaining budget should become a background job.

**Formula**: `async? = operation_ms > remaining_budget_ms`

First, calculate the remaining budget:
- Total budget: 200ms − Overhead: 50ms = **remaining budget**: ____ms

Then classify each operation:

| Operation | Duration | Should be async? |
|-----------|----------|-----------------|
| Welcome email | 400ms | |
| DB write | 20ms | |
| Image resize | 2,000ms | |
| Cache write | 5ms | |
| External API call | 300ms | |
| Validation | 10ms | |
| Slack post | 200ms | |
| Exactly at budget | 150ms | |
| 1ms over budget | 151ms | |

**Design question**: Your Slack notification takes 200ms and your time budget is 150ms. Making it async means there's a small chance it fails silently. Do you always make it async, or does the importance of the notification change your decision?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Operation | Answer |
|-----------|--------|
| Validate params | sync |
| Save user to DB | sync |
| Send welcome email | async |
| Post to Slack | async |
| Generate PDF | async |
| Check if user exists | sync |
| Resize image | async |
| Charge credit card | sync |
| Update Elasticsearch | async |
| Decrement inventory | sync |
| Send SMS verification | sync |
| Sync to analytics | async |
| Generate video thumbnail | async |
| Insert order row | sync |

**Exercise 2**
All answers: **id_only**

Reasoning: Always pass IDs. The job fetches fresh data at execution time.

**Exercise 3**
Remaining budget: **150ms**

| Operation | Duration | Async? |
|-----------|----------|--------|
| Welcome email | 400ms | true |
| DB write | 20ms | false |
| Image resize | 2,000ms | true |
| Cache write | 5ms | false |
| External API | 300ms | true |
| Validation | 10ms | false |
| Slack post | 200ms | true |
| Exactly at budget | 150ms | false |
| 1ms over | 151ms | true |

</details>
