# Scalable Pipelines: Fan-out, Partitioning, and Observability

> **Goal**: Design data pipelines that decompose complex flows into reliable, independently-scalable stages — and instrument them so you know when something is wrong.
>
> **Companion exercises**: `level-1-pipeline-patterns.rb`, `level-2-dependency-analysis.rb`, `level-3-observability.rb`

---

## 1. Overview

A pipeline is any system where data flows through a series of processing stages. User signup triggers welcome email, Slack notification, and analytics. Video upload triggers validation, transcoding, and thumbnail generation. These are pipelines. The patterns governing how stages connect — fan-out, sequential, backpressure — determine whether the pipeline is reliable, scalable, and debuggable.

---

## 2. Core Concept & Mental Model

### The Assembly Line Analogy

An assembly line has stations. Each station does one thing and passes the result to the next. If station 3 is slow, a buffer (queue) builds up before it. If station 3 breaks, the line pauses at that station — the car doesn't come out half-assembled.

**Pipeline** = sequential stations. Output of station N is input to station N+1.

**Fan-out** = one station splits into parallel tracks. A car body exits the paint station and simultaneously goes to: interior installation, wheel mounting, and quality inspection — all in parallel.

**Backpressure** = when station 3's buffer is full, station 2 stops producing. It doesn't drop work — it pauses until there's room. The opposite of dropping is queueing. The opposite of queueing forever is backpressure.

---

## 3. Building Blocks — Progressive Learning

### Level 1: The Five Pipeline Patterns

**Why this level matters**

Every pipeline scenario maps to one of five patterns. Misclassifying fan-out as pipeline (or vice versa) leads to unnecessary sequential bottlenecks or dangerous dependency ordering errors. Interviewers expect you to name the pattern and justify it.

**Fan-out: one event, N independent parallel jobs**

```
Trigger: user signs up
Fan-out:
  -> WelcomeEmailJob(user_id)
  -> SlackNotifyJob(user_id)
  -> AnalyticsEventJob(user_id)

Properties:
  - All three jobs are INDEPENDENT: if Slack fails, email still sends.
  - All three can run in parallel: no waiting on each other.
  - Fan-out is only correct when jobs have no dependencies between them.

Anti-pattern: using fan-out when jobs ARE dependent.
  -> ChargePaymentJob(order_id)
  -> SendReceiptJob(order_id)   <- WRONG as fan-out. Receipt requires charge to succeed first.
  These must be sequential (pipeline), not parallel (fan-out).
```

**Pipeline: sequential stages, each triggers the next**

```
Trigger: video uploaded
Pipeline:
  Stage 1: ValidateVideoJob -> if valid, enqueues Stage 2
  Stage 2: TranscodeVideoJob -> if done, enqueues Stage 3
  Stage 3: GenerateThumbnailJob -> if done, enqueues Stage 4
  Stage 4: NotifyUploaderJob

Properties:
  - Each stage waits for the previous stage to complete successfully.
  - If any stage fails, the pipeline stops at that point. No partial products.
  - The output of each stage is the input to the next.

When to use: when steps have hard dependencies. Step B requires the output or
             state change from step A to be correct before it can execute.
```

**Backpressure: slow the producer when the queue is backed up**

```
Problem: your API accepts 10,000 requests/second, but your workers process
         2,000 jobs/second. Queue grows by 8,000 per second. In 60 seconds,
         you have 480,000 pending jobs. Eventually memory is exhausted.

Wrong response: drop jobs (work is silently lost).
Right response: backpressure — slow or reject new work when queue is full.

Implementation:
  if queue.depth > BACKPRESSURE_THRESHOLD
    return http 429, "Queue at capacity. Retry after 30 seconds."
    # Or: use SQS ApproximateNumberOfMessages to decide whether to accept
  end

Backpressure is a feature, not a bug. A 429 is recoverable.
A silent job loss is not.
```

**Retry: transient failure, will work next time**

```
Network timeout, rate limit, upstream 503 — these are temporary.
The same job with the same input will likely succeed on the next attempt.

Action: enqueue with exponential backoff + jitter.
  retry_at = now + (retry_count^4 + 15 + rand(30)) seconds

Do NOT retry: permanently declined cards, deleted records, malformed data.
These will fail every time. Move to dead letter queue.
```

**Discard: permanent failure, retrying is pointless**

```
Malformed CSV file, invalid email address (hard bounce), user deleted.
The input is fundamentally wrong. No amount of retrying fixes it.

Action: move to dead letter queue for human inspection.
Alert on-call if it's a critical queue.
Provide tooling to replay after fixing the root cause.

How to distinguish:
  Catch specific exception types. Map exception -> retry or discard.
  rescue Stripe::CardError => e
    discard_to_dlq(job, e.message) if e.code == "card_permanently_declined"
  rescue Net::TimeoutError => e
    raise  # let Sidekiq retry this one
```

> **Mental anchor**: "Fan-out = independent parallel. Pipeline = sequential dependent. Backpressure = 429 before dropping. Retry transient. Discard permanent."

---

**-> Bridge to Level 2**: Choosing between fan-out and pipeline requires analyzing whether jobs are truly independent. Level 2 is that analysis.

### Level 2: Dependency Analysis and Partitioning

**Why this level matters**

Fan-out is only safe when the jobs have no dependencies between them. If Job B depends on Job A's result or side effect, they must run sequentially. Getting this wrong causes race conditions: Job B runs before Job A completes, reads stale data, and produces a wrong result.

**The independence test**

```
Jobs A and B are independent (fan-out safe) if:
  - B does not read data that A writes
  - B does not depend on A completing successfully first
  - B failing does not invalidate A's work (and vice versa)

Examples:
  send_welcome_email + post_to_slack + track_analytics
    -> Independent. None read each other's output. Fan-out safe.

  charge_payment + send_receipt_email
    -> Dependent. Receipt requires charge to succeed.
    -> Pipeline: charge first, enqueue receipt in charge's success callback.

  validate_video + transcode_video + generate_thumbnail
    -> Dependent chain. Each requires the previous to complete.
    -> Pipeline: each stage enqueues the next on success.

  update_search_index + increment_view_count
    -> Independent. Neither reads the other's output. Fan-out safe.
```

**Fan-out at scale: the celebrity problem**

```
Scenario: user with 10M followers publishes a post.
Fan-out: enqueue NotifyUserJob for each of 10M followers.

Problem: 10M jobs enqueued instantly. Queue depth: 10M.
Workers at 1,000 jobs/sec: 10,000 seconds = ~3 hours to clear.
Other jobs (order confirmations!) stuck behind the notification wave.

Solutions:

1. Separate queues by priority (notifications are :default, not :critical).
   Order confirmations go to :critical queue, processed by dedicated workers.

2. Tiered fan-out:
   Instead of fanning out directly to 10M users,
   fan out to 1,000 "notification batch" jobs, each processing 10,000 users.
   More predictable queue growth. Each batch can apply backpressure independently.

3. Rate-limited fan-out:
   Enqueue batches at a controlled rate.
   "Enqueue 10,000 notification jobs per second" instead of all at once.
   Queue stays manageable. Workers stay ahead of it.
```

**Partitioning for scale**

```
Problem: all events go to one queue. Some events are urgent. Some are huge.

Solution 1: Partition by priority (as above)
  :critical / :default / :bulk

Solution 2: Partition by region
  Users in us-east-1 -> queue in us-east-1 -> workers in us-east-1
  Users in eu-west-1 -> queue in eu-west-1 -> workers in eu-west-1
  Benefit: no cross-region latency in job execution. GDPR: EU data stays in EU.

Solution 3: Partition by tenant (multi-tenant SaaS)
  Large enterprise tenants get dedicated worker pools.
  Other tenants share a pool.
  Prevents one large tenant's export job from starving everyone else's notifications.
```

> **Mental anchor**: "Fan-out only when truly independent. Celebrity problem = tiered fan-out + queue separation. Partition by priority, region, or tenant to prevent starvation."

---

**-> Bridge to Level 3**: Your pipeline is designed. Now: how do you know it's working? Level 3 is observability — the operational layer that turns invisible failures into visible signals.

### Level 3: Observability — Seeing the Pipeline from the Outside

**Why this level matters**

"How do you know this is working?" is a question every system design answer must address. A pipeline that runs correctly in development but silently fails in production is not a reliable pipeline. Observability is the discipline of making failure visible before users report it.

**The three pillars of observability**

```
Metrics  -> quantitative measurements over time (counters, gauges, histograms)
Logs     -> structured records of discrete events (job started, job failed, job completed)
Traces   -> the path a single request/event took through the system
```

**Essential pipeline metrics**

```
Metric                  Type        What it tells you
----------------------  ----------  ----------------------------------------
queue_depth             Gauge       Are workers keeping up with producers?
job_duration_ms         Histogram   Are jobs slower than expected? (p50, p95, p99)
job_success_rate        Counter     What fraction complete without error?
retry_count             Counter     How many jobs need multiple attempts?
dead_letter_count       Counter     How many jobs gave up entirely?
worker_utilization      Gauge       Are workers saturated? (% busy)
enqueue_rate            Counter     How fast is work arriving?
dequeue_rate            Counter     How fast are workers consuming?

Key ratio: enqueue_rate / dequeue_rate
  > 1.0 sustained -> queue is growing; workers can't keep up
  < 1.0 sustained -> queue is draining; workers are ahead
  ~1.0            -> steady state
```

**Alert thresholds**

```
Metric                  Warning             Critical            Action
----------------------  ------------------  ------------------  -----------------------
queue_depth (critical)  > 100               > 1,000             Add workers or page on-call
queue_depth (default)   > 5,000             > 50,000            Add workers
queue_depth (bulk)      > 100,000           > 1,000,000         Investigate enqueue rate
error_rate              > 1%                > 5%                Investigate failure type
dead_letter_count       > 0 (critical)      Any                 Page on-call immediately
job_duration_p99        > 2x expected SLA   > 5x expected SLA   Investigate slow jobs
worker_utilization      > 70%               > 90%               Add workers
```

**Structured logging for pipelines**

```ruby
# Every job should log at key lifecycle points with a correlation_id

class WelcomeEmailJob < ApplicationJob
  def perform(user_id, event_id)
    correlation_id = "#{self.class.name}:#{user_id}:#{event_id}"
    logger.info({
      event: "job_started",
      job: self.class.name,
      user_id: user_id,
      correlation_id: correlation_id
    })

    user = User.find(user_id)
    UserMailer.welcome(user).deliver_now

    logger.info({
      event: "job_completed",
      job: self.class.name,
      user_id: user_id,
      correlation_id: correlation_id,
      duration_ms: job_duration
    })
  rescue => e
    logger.error({
      event: "job_failed",
      job: self.class.name,
      user_id: user_id,
      correlation_id: correlation_id,
      error: e.class.name,
      message: e.message
    })
    raise  # re-raise so Sidekiq can retry/DLQ
  end
end
```

**Distributed tracing for multi-stage pipelines**

```
Problem: a video upload fails at stage 3 (thumbnail generation).
Without tracing: you know the thumbnail job failed. You don't know if
the validation and transcoding stages succeeded or failed too.

With tracing:
  Attach a trace_id to the original upload event.
  Propagate trace_id through every job in the pipeline.
  Each stage logs: trace_id, stage_name, status, duration.

  Search: trace_id = "abc123"
  Result:
    Stage 1 ValidateVideo:   SUCCESS, 120ms
    Stage 2 TranscodeVideo:  SUCCESS, 45s
    Stage 3 GenerateThumbnail: FAILED, 3s, reason: "unsupported codec"
    Stage 4 NotifyUploader:  SKIPPED (stage 3 failed)

  You can reconstruct the full pipeline execution from trace_id alone.
  This is the gold standard for pipeline debugging.
```

**SLA measurement**

```
For each pipeline, define and measure the end-to-end SLA.
  Event occurs at T0. User sees the result at T1.
  SLA = T1 - T0.

Example: "post published" -> "followers notified"
  SLA: 95th percentile < 30 seconds.

Measure: track T0 (enqueue time) and T1 (last notification delivered).
Alert: when p95 latency > 30 seconds.

Without an SLA, you don't know if the pipeline is meeting user expectations.
With an SLA, you have a specific, testable, alertable contract.
```

> **Mental anchor**: "Metrics answer 'is it working?'. Logs answer 'what happened?'. Traces answer 'where did this specific event go?'. Define an SLA. Alert when you breach it."

---

## 4. Decision Framework

```
Fan-out or pipeline?
  Are all triggered jobs independent? (No job reads another job's output?)
  -> Yes: fan-out. Run in parallel.
  -> No: pipeline. Sequential stages, each triggered by the previous.

Fan-out at scale?
  > 100,000 records to fan out? -> Tiered fan-out (batches)
  Celebrity problem? -> Rate-limited enqueue + separate priority queues

Backpressure threshold?
  Queue depth = (enqueue_rate - dequeue_rate) * time_to_drain_target
  Set threshold = max acceptable depth before users see SLA breach.

Partitioning strategy?
  Different urgency levels? -> Priority queues (:critical/:default/:bulk)
  Multi-region? -> Region-partitioned queues
  Multi-tenant with large customers? -> Dedicated pools for large tenants

Observability minimum?
  Every pipeline stage must emit: started, completed, failed events.
  Every pipeline must have: queue_depth + error_rate alerts.
  Every pipeline must have: a trace_id that follows the event end-to-end.
```

---

## 5. Common Gotchas

**1. Fan-out when jobs are actually dependent**

The most common pipeline design error. Always ask: "What happens if Job B runs 30 seconds before Job A completes?" If the answer is "it reads stale data and produces a wrong result," they're dependent and must run sequentially.

**2. No backpressure on fan-out**

Fanning out to 10M users without rate limiting creates a 10M job spike. This overwhelms workers, starves critical queues, and can crash the queue store. Always plan the fan-out throughput before implementing.

**3. Not propagating trace IDs**

When an event spawns 5 jobs, each job gets its own ID. Without a shared trace_id, you cannot reconstruct the pipeline's execution from logs. Always attach a correlation/trace ID at the origin event and propagate it through every job it spawns.

**4. Alerting only on errors, not queue depth**

A pipeline can have a 0% error rate while the queue depth grows from 1,000 to 1,000,000 — because all jobs succeed, just slowly. Queue depth is the leading indicator of "workers are falling behind." Error rate is the indicator of "something is broken." Both must be alerted on.

**5. No dead letter queue**

Jobs that exhaust retries silently disappear without a DLQ. Users never get their notification. Reports are never generated. You never know. Always configure a DLQ, always alert when it receives entries.

---

## 6. Practice Scenarios

- [ ] "Design the notification pipeline for a Twitter-like app. A post is published. Up to 10M followers should be notified within 30 seconds." (Fan-out vs tiered fan-out, celebrity problem, queue separation, SLA definition)
- [ ] "An order is placed. Design the pipeline: charge payment, update inventory, send receipt, update analytics, notify warehouse." (Which steps are parallel, which are sequential? What happens if payment fails mid-pipeline?)
- [ ] "Your bulk email campaign queue is backed up with 500K jobs. Order confirmation emails are stuck behind them." (Queue partitioning, priority separation)
- [ ] "A video upload pipeline has stages: validate, transcode, thumbnail, notify. How do you instrument this to know the exact failure point for any upload?" (Trace ID propagation, structured logging per stage, dead letter with stage metadata)
- [ ] "Design the observability stack for a notification pipeline with 1M events/day." (Metrics to collect, alert thresholds, log format, SLA measurement)

**Run the exercises**:
```
ruby level-1-pipeline-patterns.rb
ruby level-2-dependency-analysis.rb
ruby level-3-observability.rb
```
