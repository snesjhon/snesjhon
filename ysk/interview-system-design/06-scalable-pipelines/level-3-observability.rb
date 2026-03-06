# =============================================================================
# Level 3: Pipeline Observability — Health Metrics, Alerts, and Tracing
# =============================================================================
# Before running: ruby level-3-observability.rb
# Goal: assess pipeline health from operational metrics, determine correct
#       alert thresholds, and design tracing/correlation ID strategies.
#
# The three observability pillars:
#   Metrics -> quantitative measurements (queue depth, error rate, duration)
#   Logs    -> structured records of discrete events per job execution
#   Traces  -> the path a single event takes through all pipeline stages
#
# Alert severity:
#   :healthy  -> no action needed
#   :warning  -> investigate, not yet an outage
#   :critical -> page on-call, potential user-facing impact

# =============================================================================
# Test harness
# =============================================================================
def test(desc, actual, expected)
  pass = actual == expected
  puts "#{pass ? 'PASS' : 'FAIL'} #{desc}"
  unless pass
    puts "  expected: #{expected.inspect}"
    puts "  received: #{actual.inspect}"
  end
end

# -----------------------------------------------------------------------------
# Exercise 1
# Pipeline SLA: is the end-to-end latency within the defined SLA?
# Return :within_sla or :sla_breached
#
# Use these SLAs by pipeline type:
#   :critical_notification  -> p99 < 2 seconds
#   :transactional_email    -> p99 < 30 seconds
#   :search_index_update    -> p99 < 60 seconds
#   :bulk_export            -> p99 < 3600 seconds (1 hour)
# -----------------------------------------------------------------------------
SLA_LIMITS = {
  critical_notification: 2,
  transactional_email:   30,
  search_index_update:   60,
  bulk_export:           3600
}

def sla_status(pipeline_type, p99_latency_seconds)
  raise NotImplementedError, "TODO"
end

test("critical notification, 1.5s p99 -> within_sla",
  sla_status(:critical_notification, 1.5),   :within_sla)

test("critical notification, 2.1s p99 -> sla_breached",
  sla_status(:critical_notification, 2.1),   :sla_breached)

test("transactional email, 25s p99 -> within_sla",
  sla_status(:transactional_email, 25.0),    :within_sla)

test("transactional email, 45s p99 -> sla_breached",
  sla_status(:transactional_email, 45.0),    :sla_breached)

test("search index update, 55s p99 -> within_sla",
  sla_status(:search_index_update, 55.0),    :within_sla)

test("bulk export, 1 hour p99 -> within_sla (exactly at limit)",
  sla_status(:bulk_export, 3600.0),          :within_sla)

test("bulk export, 3601s p99 -> sla_breached",
  sla_status(:bulk_export, 3601.0),          :sla_breached)

# -----------------------------------------------------------------------------
# Exercise 2
# Multi-metric health assessment.
# Return :healthy, :warning, or :critical
#
# Healthy:  depth < 1000  AND error_rate < 0.01 AND dlq_count == 0
# Warning:  depth 1k-10k  OR  error_rate 0.01-0.05 OR dlq_count > 0
# Critical: depth > 10000 OR  error_rate > 0.05
# -----------------------------------------------------------------------------
def pipeline_health(queue_depth:, error_rate:, dlq_count:)
  raise NotImplementedError, "TODO"
end

test("depth 200, rate 0.001, dlq 0 -> healthy",
  pipeline_health(queue_depth: 200, error_rate: 0.001, dlq_count: 0),      :healthy)

test("depth 5000, rate 0.001, dlq 0 -> warning (depth elevated)",
  pipeline_health(queue_depth: 5_000, error_rate: 0.001, dlq_count: 0),    :warning)

test("depth 200, rate 0.03, dlq 0 -> warning (error rate elevated)",
  pipeline_health(queue_depth: 200, error_rate: 0.03, dlq_count: 0),       :warning)

test("depth 200, rate 0.001, dlq 1 -> warning (dead letters present)",
  pipeline_health(queue_depth: 200, error_rate: 0.001, dlq_count: 1),      :warning)

test("depth 20000, rate 0.001, dlq 0 -> critical (depth critical)",
  pipeline_health(queue_depth: 20_000, error_rate: 0.001, dlq_count: 0),   :critical)

test("depth 200, rate 0.10, dlq 0 -> critical (error rate critical)",
  pipeline_health(queue_depth: 200, error_rate: 0.10, dlq_count: 0),       :critical)

test("depth 5000, rate 0.03, dlq 2 -> warning (multiple warning signals, not critical)",
  pipeline_health(queue_depth: 5_000, error_rate: 0.03, dlq_count: 2),     :warning)

# -----------------------------------------------------------------------------
# Exercise 3
# Queue throughput: is the queue draining or growing?
# Given enqueue_rate and dequeue_rate (jobs per second),
# return :draining, :stable, or :growing
#
# Draining: dequeue_rate > enqueue_rate
# Stable:   dequeue_rate == enqueue_rate (within 5% tolerance)
# Growing:  dequeue_rate < enqueue_rate (more than 5% behind)
#
# Tolerance: if abs(enqueue - dequeue) / enqueue <= 0.05 -> stable
# -----------------------------------------------------------------------------
def queue_throughput_status(enqueue_rate, dequeue_rate)
  raise NotImplementedError, "TODO"
end

test("enqueue 100, dequeue 150 -> draining",
  queue_throughput_status(100, 150),  :draining)

test("enqueue 100, dequeue 100 -> stable",
  queue_throughput_status(100, 100),  :stable)

test("enqueue 100, dequeue 102 -> stable (within 5% tolerance)",
  queue_throughput_status(100, 102),  :stable)

test("enqueue 100, dequeue 94 -> growing (6% behind)",
  queue_throughput_status(100, 94),   :growing)

test("enqueue 1000, dequeue 800 -> growing",
  queue_throughput_status(1000, 800), :growing)

test("enqueue 1000, dequeue 960 -> stable (4% within tolerance)",
  queue_throughput_status(1000, 960), :stable)

# -----------------------------------------------------------------------------
# Exercise 4
# Trace ID strategy: does this pipeline configuration propagate trace IDs correctly?
# Return :complete_trace or :incomplete_trace
#
# Complete trace: every stage receives and logs the same trace_id from the origin event.
# Incomplete trace: at least one stage generates a new ID or doesn't propagate the original.
#
# Represented as an array of hashes: [{ stage: :name, has_trace_id: true/false }]
# Complete if ALL stages have has_trace_id: true
# -----------------------------------------------------------------------------
def trace_coverage(pipeline_stages)
  raise NotImplementedError, "TODO"
end

test("all stages have trace_id -> complete_trace",
  trace_coverage([
    { stage: :validate,  has_trace_id: true },
    { stage: :transcode, has_trace_id: true },
    { stage: :thumbnail, has_trace_id: true },
    { stage: :notify,    has_trace_id: true }
  ]),
  :complete_trace)

test("one stage missing trace_id -> incomplete_trace",
  trace_coverage([
    { stage: :validate,  has_trace_id: true },
    { stage: :transcode, has_trace_id: false },  # dropped the trace ID
    { stage: :thumbnail, has_trace_id: true },
    { stage: :notify,    has_trace_id: true }
  ]),
  :incomplete_trace)

test("no stages have trace_id -> incomplete_trace",
  trace_coverage([
    { stage: :charge,  has_trace_id: false },
    { stage: :fulfill, has_trace_id: false }
  ]),
  :incomplete_trace)

test("single-stage pipeline with trace_id -> complete_trace",
  trace_coverage([
    { stage: :send_email, has_trace_id: true }
  ]),
  :complete_trace)
