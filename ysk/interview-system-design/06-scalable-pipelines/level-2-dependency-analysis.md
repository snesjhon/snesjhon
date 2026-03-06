# Level 2: Dependency Analysis — Fan-out Safety and Sequential Dependencies

> **Goal**: Determine whether jobs can safely run in parallel or must run sequentially, and identify the correct execution order for dependent operations.
>
> **Builds on Level 1**: You can classify the pattern. Now reason about the dependencies between jobs within a pipeline or fan-out.

---

## The core question

**Fan-out is safe when**:
- No job reads data that another job in the set writes
- No job depends on another completing successfully first
- A job failing doesn't invalidate other jobs' work

**Pipeline is required when**:
- Job B uses the output or side effect of Job A
- Job B must not run if Job A failed

---

## Exercise 1: Fan-out safe or pipeline required?

| Jobs | Independent or Dependent? | Why? |
|------|--------------------------|------|
| Send email + post Slack + write analytics (all read same event) | | |
| Charge payment THEN send receipt | | |
| Update search index + increment view count | | |
| Create order → decrement inventory → notify warehouse | | |
| Send email + post to Slack | | |
| Verify reset token → send password reset email | | |
| Log to analytics + send notification | | |
| Transcode video → generate thumbnail | | |

**Explain the receipt example**: Why can't you run "send receipt" in parallel with "charge payment"?

> _Your answer:_

---

## Exercise 2: Pipeline ordering

Given jobs with dependency declarations, write the correct execution order.

**Scenario A**: Video processing
- `validate`: no dependencies
- `transcode`: depends on `validate`
- `thumbnail`: depends on `transcode`
- `notify`: depends on `thumbnail`

Execution order:

> _Your answer:_

---

**Scenario B**: Order fulfillment
- `charge`: no dependencies
- `fulfill`: depends on `charge`
- `send_receipt`: depends on `charge`

Note: `fulfill` and `send_receipt` both depend on `charge`, but not on each other.

Execution order (write all stages, use "parallel" where applicable):

> _Your answer:_

---

**Scenario C**: Password reset
- `create_token`: no dependencies
- `send_email`: depends on `create_token`

Execution order:

> _Your answer:_

---

## Exercise 3: Fan-out scale — direct or tiered?

When you fan-out to many recipients, you can either enqueue one job per recipient immediately (direct) or batch them (tiered).

- **Direct fan-out**: Enqueue one job per recipient immediately. Safe up to **100,000 recipients**.
- **Tiered fan-out**: Enqueue batch jobs (e.g., 10,000 per batch). Each batch job enqueues its own individual jobs. Required when recipients ≥ 100,000 — prevents instantly flooding the queue.

| Recipient count | Strategy |
|-----------------|----------|
| 100 | |
| 50,000 | |
| 99,999 | |
| 100,000 | |
| 10,000,000 (celebrity post) | |

**Explain the failure mode**: A celebrity with 10M followers posts a photo. You use direct fan-out and enqueue one job per follower immediately. What happens to your queue and your workers?

> _Your answer:_

---

## Exercise 4: Batch job count

For tiered fan-out, how many batch jobs do you need?

**Formula**: `batch_jobs = ceil(total_recipients / batch_size)`

| Total recipients | Batch size | Batch jobs needed | Your work |
|-----------------|------------|-------------------|-----------|
| 1,000,000 | 10,000 | | |
| 10,000,000 | 10,000 | | |
| 150,000 | 10,000 | | |
| 105,000 | 10,000 | | |

**Design question**: For the 105,000 recipient case, the last batch has only 5,000 recipients. Why do you round up to 11 batches instead of handling the remainder differently?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Jobs | Answer |
|------|--------|
| Email + Slack + analytics | independent |
| Charge THEN send receipt | dependent |
| Update search + increment view | independent |
| Order → inventory → warehouse | dependent |
| Email + Slack | independent |
| Verify token → send email | dependent |
| Log analytics + send notification | independent |
| Transcode → thumbnail | dependent |

**Exercise 2**

Scenario A: `validate → transcode → thumbnail → notify`

Scenario B: `charge → [fulfill, send_receipt] (parallel)`
(or written linearly: `charge → fulfill → send_receipt`)

Scenario C: `create_token → send_email`

**Exercise 3**
| Recipients | Strategy |
|------------|----------|
| 100 | direct_fanout |
| 50,000 | direct_fanout |
| 99,999 | direct_fanout |
| 100,000 | tiered_fanout |
| 10,000,000 | tiered_fanout |

**Exercise 4**
| Total | Batch size | Batch jobs |
|-------|------------|------------|
| 1M | 10k | 100 |
| 10M | 10k | 1,000 |
| 150k | 10k | 15 |
| 105k | 10k | 11 |

</details>
