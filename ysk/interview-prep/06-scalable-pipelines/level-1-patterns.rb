# =============================================================================
# Level 1: Pipeline Pattern Recognition
# =============================================================================
# Before running: ruby level-1-patterns.rb
# Goal: given a scenario, identify the correct pipeline pattern and
#       understand why one pattern fits better than another.
#
# Five patterns:
#   :fan_out      - one event, N independent parallel jobs
#   :pipeline     - sequential stages, each triggers the next
#   :backpressure - slow the producer when queue is backed up
#   :retry        - transient failure, will work next time
#   :discard      - permanent failure, retrying is pointless

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
# Classify each scenario by pipeline pattern.
# Return one of: :fan_out, :pipeline, :backpressure, :discard, :retry
# -----------------------------------------------------------------------------
def pipeline_pattern_for(scenario)
  raise NotImplementedError, "TODO"
end

test("signup -> email + slack + analytics is fan-out",
  pipeline_pattern_for(:user_signup_triggers_email_slack_analytics), :fan_out)

test("upload validation -> transcode -> thumbnail is pipeline",
  pipeline_pattern_for(:upload_validate_then_transcode_then_thumbnail), :pipeline)

test("queue overload is backpressure",
  pipeline_pattern_for(:queue_has_500k_jobs_workers_cant_keep_up), :backpressure)

test("network timeout is retry",
  pipeline_pattern_for(:charge_fails_because_network_timeout), :retry)

test("card permanently declined is discard",
  pipeline_pattern_for(:charge_fails_because_card_permanently_declined), :discard)

test("post published -> search + email + log is fan-out",
  pipeline_pattern_for(:post_published_updates_search_sends_email_logs_activity), :fan_out)

test("malformed CSV is discard",
  pipeline_pattern_for(:import_fails_because_csv_is_malformed), :discard)

test("api faster than workers is backpressure",
  pipeline_pattern_for(:api_is_accepting_requests_faster_than_workers_process), :backpressure)

test("token then email is pipeline",
  pipeline_pattern_for(:send_password_reset_email_after_verification_token_created), :pipeline)

# -----------------------------------------------------------------------------
# Exercise 2
# Fan-out: are these jobs truly independent, or does one depend on another?
# Return :independent (fan-out ok) or :dependent (pipeline needed)
# -----------------------------------------------------------------------------
def fan_out_safe?(jobs)
  raise NotImplementedError, "TODO"
end

test("email + slack + analytics: independent (fan-out ok)",
  fan_out_safe?(:email_and_slack_and_analytics), :independent)

test("charge THEN receipt: dependent (pipeline)",
  fan_out_safe?(:charge_then_send_receipt_email), :dependent)

test("search index + view count: independent (fan-out ok)",
  fan_out_safe?(:update_search_index_and_increment_view_count), :independent)

test("order -> inventory -> warehouse: dependent (pipeline)",
  fan_out_safe?(:create_order_then_decrement_inventory_then_notify_warehouse), :dependent)

test("email + slack: independent (fan-out ok)",
  fan_out_safe?(:send_email_and_post_to_slack), :independent)

# -----------------------------------------------------------------------------
# Exercise 3
# Backpressure threshold.
# Given a queue depth and a threshold, decide whether to accept or reject the request.
# Return :accept or :reject
# -----------------------------------------------------------------------------
BACKPRESSURE_THRESHOLD = 10_000

def backpressure_decision(queue_depth)
  raise NotImplementedError, "TODO"
end

test("queue at 0: accept",          backpressure_decision(0),      :accept)
test("queue at 5000: accept",       backpressure_decision(5000),   :accept)
test("queue at 10000: accept",      backpressure_decision(10_000), :accept)
test("queue at 10001: reject",      backpressure_decision(10_001), :reject)
test("queue at 500000: reject",     backpressure_decision(500_000),:reject)

# -----------------------------------------------------------------------------
# Exercise 4
# Queue health: given metrics, decide if the pipeline is healthy.
# Return :healthy, :warning, or :critical
#
# Thresholds:
#   Healthy:  queue_depth < 1000 AND error_rate < 0.01
#   Warning:  queue_depth 1000-10000 OR error_rate 0.01-0.05
#   Critical: queue_depth > 10000 OR error_rate > 0.05
# -----------------------------------------------------------------------------
def queue_health(queue_depth:, error_rate:)
  raise NotImplementedError, "TODO"
end

test("low depth, low errors: healthy",
  queue_health(queue_depth: 500, error_rate: 0.001), :healthy)

test("medium depth, low errors: warning",
  queue_health(queue_depth: 5_000, error_rate: 0.001), :warning)

test("low depth, medium errors: warning",
  queue_health(queue_depth: 100, error_rate: 0.03), :warning)

test("high depth: critical",
  queue_health(queue_depth: 50_000, error_rate: 0.001), :critical)

test("high error rate: critical",
  queue_health(queue_depth: 100, error_rate: 0.1), :critical)
