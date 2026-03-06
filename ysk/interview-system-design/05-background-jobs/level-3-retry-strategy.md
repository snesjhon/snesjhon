# Level 3: Retry Strategy, Queue Priority, and Queue Health

> **Goal**: Classify failures as transient or permanent, assign jobs to the right priority queue, and diagnose queue health from operational metrics.
>
> **Builds on Level 2**: You can make jobs idempotent. Now decide how they should fail and recover.

---

## Exercise 1: Retry or discard?

**Transient**: Temporary condition that will likely resolve. Retry with backoff.
**Permanent**: Fundamental problem. No amount of retrying will fix this. Discard to dead letter queue.

| Error | Transient or Permanent? | Why? |
|-------|-------------------------|------|
| Network connection timeout | | |
| Credit card permanently declined | | |
| Downstream API rate limit (HTTP 429) | | |
| Invalid email address (hard bounce) | | |
| DB connection pool exhausted | | |
| User record deleted before job ran | | |
| Upstream service overloaded (HTTP 503) | | |
| Malformed CSV data | | |
| DNS resolution failure | | |
| Account permanently closed | | |

**Pattern**: What's the key question that separates transient from permanent?

> _Your answer:_

---

## Exercise 2: Queue priority

Jobs get different SLAs. Assign each to the right queue.

- **Critical** (< 1 second SLA): payment confirmations, auth operations, real-time events
- **Default** (< 30 second SLA): transactional emails, search index updates
- **Bulk** (< 1 hour SLA): marketing campaigns, exports, reports, digests

| Job | Queue priority |
|-----|---------------|
| Payment confirmation | |
| Order receipt email | |
| Bulk marketing email campaign | |
| Auth token invalidation | |
| Search index update for new post | |
| Monthly report generation | |
| Real-time push notification | |
| Weekly digest email | |
| Activity feed update | |
| Data export to CSV | |

**Design**: Your critical queue is backed up with 50,000 jobs. Your bulk jobs are fine. What does that tell you, and what do you do?

> _Your answer:_

---

## Exercise 3: Queue health assessment

Given metrics, assess the queue state.

| Condition | Threshold |
|-----------|-----------|
| Healthy | depth < 1,000 AND error rate < 1% |
| Warning | depth 1k–10k OR error rate 1–5% |
| Critical | depth > 10,000 OR error rate > 5% |

| Queue depth | Error rate | Health status |
|-------------|------------|---------------|
| 100 | 0.1% | |
| 500 | 0.5% | |
| 5,000 | 0.1% | |
| 100 | 3% | |
| 50,000 | 0.1% | |
| 100 | 10% | |
| 10,001 | 0.1% | |
| 9,999 | 4.9% | |

**Scenario**: Your queue depth jumps from 500 to 8,000 over 10 minutes, but error rate stays at 0.5%. What's likely happening, and what do you check first?

> _Your answer:_

---

## Exercise 4: Exponential backoff

Sidekiq's base retry delay formula: `base_delay = retry_count^4 + 15` (seconds)

Calculate the base delay for each retry (before jitter is added):

| Retry attempt | Formula | Base delay (seconds) |
|---------------|---------|---------------------|
| 1 | 1⁴ + 15 | |
| 2 | 2⁴ + 15 | |
| 3 | 3⁴ + 15 | |
| 4 | 4⁴ + 15 | |
| 5 | 5⁴ + 15 | |
| 10 | 10⁴ + 15 | |

**Why does the delay grow so steeply?** Why add jitter on top of this?

> _Your answer:_

**At retry 5, the base delay is ~640 seconds (~10 minutes). A job that fails due to a rate limit at 9 PM might not retry until ~10 PM. Is that acceptable? How would you design around it?**

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Error | Answer |
|-------|--------|
| Network timeout | transient |
| Card permanently declined | permanent |
| API rate limit (429) | transient |
| Invalid email (hard bounce) | permanent |
| DB connection pool exhausted | transient |
| Record deleted before job ran | permanent |
| Upstream 503 | transient |
| Malformed input data | permanent |
| DNS failure | transient |
| Account permanently closed | permanent |

**Exercise 2**
| Job | Priority |
|-----|----------|
| Payment confirmation | critical |
| Order receipt email | default |
| Marketing campaign | bulk |
| Auth token invalidation | critical |
| Search index update | default |
| Monthly report | bulk |
| Real-time push notification | critical |
| Weekly digest | bulk |
| Activity feed update | default |
| Data export CSV | bulk |

**Exercise 3**
| Depth | Error rate | Status |
|-------|------------|--------|
| 100 | 0.1% | healthy |
| 500 | 0.5% | healthy |
| 5,000 | 0.1% | warning |
| 100 | 3% | warning |
| 50,000 | 0.1% | critical |
| 100 | 10% | critical |
| 10,001 | 0.1% | critical |
| 9,999 | 4.9% | warning |

**Exercise 4**
| Retry | Base delay |
|-------|------------|
| 1 | 16s |
| 2 | 31s |
| 3 | 96s |
| 4 | 271s |
| 5 | 640s |
| 10 | 10,015s |

</details>
