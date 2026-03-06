# Level 3: Pipeline Observability — Health Metrics, Alerts, and Tracing

> **Goal**: Assess pipeline health from operational metrics, determine alert thresholds, and design tracing strategies.
>
> **Builds on Level 2**: You can design pipeline dependencies. Now instrument them so you know when something's wrong.

---

## The three observability pillars

Before starting, describe each in your own words:

**Metrics** (quantitative measurements — queue depth, error rate, duration):

> _Your description:_

**Logs** (structured records of discrete events per job execution):

> _Your description:_

**Traces** (the path a single event takes through all pipeline stages):

> _Your description:_

---

## Exercise 1: SLA status

Is this pipeline within its SLA?

| Pipeline type | SLA (p99) | Actual p99 | Within SLA? |
|---------------|-----------|------------|-------------|
| Critical notification | 2 seconds | 1.5s | |
| Critical notification | 2 seconds | 2.1s | |
| Transactional email | 30 seconds | 25s | |
| Transactional email | 30 seconds | 45s | |
| Search index update | 60 seconds | 55s | |
| Bulk export | 3,600 seconds | 3,600s | |
| Bulk export | 3,600 seconds | 3,601s | |

**Why p99 and not average?** What does a healthy average with a bad p99 tell you about your pipeline?

> _Your answer:_

---

## Exercise 2: Multi-metric health assessment

Three signals: queue depth, error rate, and dead letter queue count.

| Condition | Threshold |
|-----------|-----------|
| Healthy | depth < 1,000 AND error rate < 1% AND dlq_count = 0 |
| Warning | depth 1k–10k OR error rate 1–5% OR dlq_count > 0 |
| Critical | depth > 10,000 OR error rate > 5% |

| Queue depth | Error rate | DLQ count | Status |
|-------------|------------|-----------|--------|
| 200 | 0.1% | 0 | |
| 5,000 | 0.1% | 0 | |
| 200 | 3% | 0 | |
| 200 | 0.1% | 1 | |
| 20,000 | 0.1% | 0 | |
| 200 | 10% | 0 | |
| 5,000 | 3% | 2 | |

**Notice**: The last row has multiple warning signals simultaneously but doesn't cross the critical threshold. Does that make you more or less concerned than a single warning signal? Why?

> _Your answer:_

---

## Exercise 3: Queue throughput — draining or growing?

Compare enqueue rate vs dequeue rate.

- **Draining**: dequeue > enqueue — workers keeping up, queue is shrinking
- **Stable**: rates match within 5% tolerance
- **Growing**: dequeue < enqueue (more than 5% behind) — workers falling behind

**Formula**: `if abs(enqueue − dequeue) / enqueue ≤ 0.05 → stable`

| Enqueue rate | Dequeue rate | Status |
|--------------|--------------|--------|
| 100/sec | 150/sec | |
| 100/sec | 100/sec | |
| 100/sec | 102/sec | |
| 100/sec | 94/sec | |
| 1,000/sec | 800/sec | |
| 1,000/sec | 960/sec | |

**Alert design**: If a queue shifts from stable to growing, at what point do you alert? Immediately on the first sample? After sustained growth for 5 minutes? Justify your choice.

> _Your answer:_

---

## Exercise 4: Trace ID propagation

A **trace ID** is a single identifier that follows an event through every stage of the pipeline. If any stage drops it, you lose the ability to reconstruct the full path of a request.

A complete trace: every stage has the same trace ID from the origin event.
An incomplete trace: at least one stage is missing it or generated a new one.

| Pipeline | Trace complete or incomplete? |
|----------|-------------------------------|
| All stages have `trace_id: true` | |
| One middle stage has `trace_id: false` | |
| No stages have a trace_id | |
| Single-stage pipeline with `trace_id: true` | |

**Design question**: You have a 5-stage video processing pipeline. Stage 3 (transcode) calls an external service that doesn't support trace IDs. How do you maintain end-to-end trace coverage?

> _Your answer:_

---

## Putting it all together: incident scenario

Your monitoring shows:
- Queue depth: 12,000 (normally 300)
- Error rate: 8% (normally 0.3%)
- DLQ count: 47 (normally 0)
- p99 latency: 4.2 minutes (SLA is 30 seconds)

Walk through your incident response:

1. What's the health status?
2. What do you check first?
3. How do you use traces to narrow down the failing stage?
4. If the error is transient (DB overloaded), what's your immediate action?
5. If the error is permanent (bad input data), what's your immediate action?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Pipeline | Actual p99 | Answer |
|----------|------------|--------|
| Critical notification | 1.5s | within_sla |
| Critical notification | 2.1s | sla_breached |
| Transactional email | 25s | within_sla |
| Transactional email | 45s | sla_breached |
| Search index update | 55s | within_sla |
| Bulk export | 3,600s | within_sla |
| Bulk export | 3,601s | sla_breached |

**Exercise 2**
| Depth | Error rate | DLQ | Status |
|-------|------------|-----|--------|
| 200 | 0.1% | 0 | healthy |
| 5,000 | 0.1% | 0 | warning |
| 200 | 3% | 0 | warning |
| 200 | 0.1% | 1 | warning |
| 20,000 | 0.1% | 0 | critical |
| 200 | 10% | 0 | critical |
| 5,000 | 3% | 2 | warning |

**Exercise 3**
| Enqueue | Dequeue | Status |
|---------|---------|--------|
| 100 | 150 | draining |
| 100 | 100 | stable |
| 100 | 102 | stable (2% within 5%) |
| 100 | 94 | growing (6% behind) |
| 1,000 | 800 | growing |
| 1,000 | 960 | stable (4% within 5%) |

**Exercise 4**
| Pipeline | Answer |
|----------|--------|
| All stages have trace_id | complete_trace |
| One stage missing trace_id | incomplete_trace |
| No stages have trace_id | incomplete_trace |
| Single stage with trace_id | complete_trace |

</details>
