# Level 1: Pipeline Pattern Recognition

> **Goal**: Given a scenario, identify the correct pipeline pattern and understand why one fits better than the alternatives.

---

## The five patterns

Before starting, write a one-line definition of each in your own words:

**Fan-out** (one event → N independent parallel jobs):

> _Your definition:_

**Pipeline** (sequential stages; each triggers the next on success):

> _Your definition:_

**Backpressure** (slow/reject the producer when the queue is backed up):

> _Your definition:_

**Retry** (transient failure; same input will likely succeed next time):

> _Your definition:_

**Discard** (permanent failure; retrying will never succeed):

> _Your definition:_

---

## Exercise 1: Classify the scenario

| Scenario | Pattern | Key signal |
|----------|---------|------------|
| User signs up → trigger email + Slack + analytics | | |
| Upload → validate → transcode → generate thumbnail | | |
| Queue has 500k jobs, workers can't keep up | | |
| Payment charge fails due to network timeout | | |
| Credit card permanently declined | | |
| Post published → update search + send email + write activity log | | |
| Malformed CSV uploaded for import | | |
| API accepting requests faster than workers process them | | |
| Send password reset: create token then send email | | |
| Order placed → charge → fulfill → ship → notify customer | | |
| DNS lookup fails | | |
| User record deleted before the job ran | | |

**Pattern check**: Fan-out and pipeline both involve multiple jobs triggered from one event. How do you tell them apart?

> _Your answer:_

---

## Exercise 2: Backpressure threshold

Your queue has a max depth of 10,000 jobs. Above that threshold, reject new work rather than let the queue grow unboundedly.

| Queue depth | Accept or reject? |
|-------------|------------------|
| 0 | |
| 5,000 | |
| 10,000 | |
| 10,001 | |
| 500,000 | |

**Design question**: What do you return to the caller when you reject their request due to backpressure? (HTTP status? error message?) What should the caller do next?

> _Your answer:_

---

## Exercise 3: Queue health

Use these thresholds:

| Condition | Threshold |
|-----------|-----------|
| Healthy | depth < 1,000 AND error rate < 1% |
| Warning | depth 1k–10k OR error rate 1–5% |
| Critical | depth > 10,000 OR error rate > 5% |

| Queue depth | Error rate | Health |
|-------------|------------|--------|
| 500 | 0.1% | |
| 5,000 | 0.1% | |
| 100 | 3% | |
| 50,000 | 0.1% | |
| 100 | 10% | |

**Scenario**: Your queue is healthy (depth 200, error rate 0.2%). Over the next 5 minutes, depth rises to 4,000 while error rate stays at 0.2%. What's likely happening? What's your first diagnostic step?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Scenario | Pattern |
|----------|---------|
| Signup → email + Slack + analytics | fan_out |
| Upload → validate → transcode → thumbnail | pipeline |
| Queue 500k, workers behind | backpressure |
| Charge fails, network timeout | retry |
| Card permanently declined | discard |
| Post published → search + email + activity | fan_out |
| Malformed CSV | discard |
| API faster than workers | backpressure |
| Create token then send reset email | pipeline |
| Order → charge → fulfill → ship → notify | pipeline |
| DNS lookup fails | retry |
| User deleted before job ran | discard |

**Exercise 2**
| Depth | Decision |
|-------|----------|
| 0 | accept |
| 5,000 | accept |
| 10,000 | accept |
| 10,001 | reject |
| 500,000 | reject |

**Exercise 3**
| Depth | Error rate | Status |
|-------|------------|--------|
| 500 | 0.1% | healthy |
| 5,000 | 0.1% | warning |
| 100 | 3% | warning |
| 50,000 | 0.1% | critical |
| 100 | 10% | critical |

</details>
