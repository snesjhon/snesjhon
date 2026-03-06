# =============================================================================
# Level 1: Pipeline Pattern Recognition
# =============================================================================
# Before running: ruby level-1-pipeline-patterns.rb
# Goal: given a scenario, identify the correct pipeline pattern and
#       understand why one fits better than the alternatives.
#
# Five patterns:
#   :fan_out      -> one event triggers N independent parallel jobs
#   :pipeline     -> sequential stages; each triggers the next on success
#   :backpressure -> slow/reject the producer when queue is backed up
#   :retry        -> transient failure; same input will likely succeed next time
#   :discard      -> permanent failure; retrying will never succeed

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
# Classify the scenario by pipeline pattern.
# Return :fan_out, :pipeline, :backpressure, :retry, or :discard
# -----------------------------------------------------------------------------
def pipeline_pattern_for(scenario)
  raise NotImplementedError, "TODO"
end

test("signup -> email + slack + analytics -> fan_out",
  pipeline_pattern_for(:user_signup_triggers_email_slack_analytics),        :fan_out)

test("upload -> validate -> transcode -> thumbnail -> pipeline",
  pipeline_pattern_for(:upload_validate_then_transcode_then_thumbnail),     :pipeline)

test("queue has 500k jobs, workers can't keep up -> backpressure",
  pipeline_pattern_for(:queue_500k_workers_behind),                         :backpressure)

test("charge fails due to network timeout -> retry",
  pipeline_pattern_for(:charge_fails_network_timeout),                      :retry)

test("card permanently declined -> discard",
  pipeline_pattern_for(:card_permanently_declined),                         :discard)

test("post published -> search + email + activity log -> fan_out",
  pipeline_pattern_for(:post_published_search_email_activity),              :fan_out)

test("malformed CSV uploaded -> discard",
  pipeline_pattern_for(:import_fails_malformed_csv),                        :discard)

test("API accepting requests faster than workers process -> backpressure",
  pipeline_pattern_for(:api_faster_than_workers),                           :backpressure)

test("send password reset: create token then send email -> pipeline",
  pipeline_pattern_for(:create_token_then_send_reset_email),                :pipeline)

test("order placed -> charge -> fulfill -> ship -> notify -> pipeline",
  pipeline_pattern_for(:order_charge_fulfill_ship_notify),                  :pipeline)

test("DNS lookup fails -> retry",
  pipeline_pattern_for(:dns_lookup_failure),                                :retry)

test("user deleted before job ran -> discard",
  pipeline_pattern_for(:user_deleted_before_job_executed),                  :discard)

# -----------------------------------------------------------------------------
# Exercise 2
# Backpressure threshold.
# Given a queue depth and a threshold, decide whether to accept or reject.
# Return :accept or :reject
# -----------------------------------------------------------------------------
BACKPRESSURE_THRESHOLD = 10_000

def backpressure_decision(queue_depth)
  raise NotImplementedError, "TODO"
end

test("queue at 0 -> accept",         backpressure_decision(0),        :accept)
test("queue at 5000 -> accept",      backpressure_decision(5_000),    :accept)
test("queue at 10000 -> accept",     backpressure_decision(10_000),   :accept)
test("queue at 10001 -> reject",     backpressure_decision(10_001),   :reject)
test("queue at 500000 -> reject",    backpressure_decision(500_000),  :reject)

# -----------------------------------------------------------------------------
# Exercise 3
# Queue health assessment.
# Return :healthy, :warning, or :critical
#
# Healthy:  depth < 1000   AND error_rate < 0.01
# Warning:  depth 1k-10k   OR  error_rate 0.01-0.05
# Critical: depth > 10000  OR  error_rate > 0.05
# -----------------------------------------------------------------------------
def queue_health(queue_depth:, error_rate:)
  raise NotImplementedError, "TODO"
end

test("depth 500, rate 0.001 -> healthy",
  queue_health(queue_depth: 500, error_rate: 0.001),       :healthy)

test("depth 5000, rate 0.001 -> warning",
  queue_health(queue_depth: 5_000, error_rate: 0.001),     :warning)

test("depth 100, rate 0.03 -> warning",
  queue_health(queue_depth: 100, error_rate: 0.03),        :warning)

test("depth 50000, rate 0.001 -> critical",
  queue_health(queue_depth: 50_000, error_rate: 0.001),    :critical)

test("depth 100, rate 0.10 -> critical",
  queue_health(queue_depth: 100, error_rate: 0.10),        :critical)
