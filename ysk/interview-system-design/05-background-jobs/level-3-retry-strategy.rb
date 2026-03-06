# =============================================================================
# Level 3: Retry Strategy, Queue Priority, and Queue Health
# =============================================================================
# Before running: ruby level-3-retry-strategy.rb
# Goal: classify failure types, assign jobs to the right priority queue,
#       and assess queue health from operational metrics.
#
# Failure types:
#   :transient  -> temporary condition; RETRY with exponential backoff + jitter
#   :permanent  -> fundamental problem; DISCARD to dead letter queue, do not retry
#
# Queue priority tiers (by SLA):
#   :critical -> < 1 second SLA (payment confirms, auth, real-time)
#   :default  -> < 30 second SLA (transactional email, search updates)
#   :bulk     -> < 1 hour SLA (marketing campaigns, exports, reports)
#
# Queue health states:
#   :healthy  -> depth low, error rate low
#   :warning  -> depth elevated OR error rate elevated
#   :critical -> depth high OR error rate high

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
# Retry or discard? Classify the failure type.
# Return :transient or :permanent
#
# Transient: the problem will likely resolve itself (network, rate limit, overload).
# Permanent: no amount of retrying will fix this (bad input, deleted resource, hard decline).
# -----------------------------------------------------------------------------
def failure_type(error)
  raise NotImplementedError, "TODO"
end

test("network timeout -> transient",
  failure_type(:network_connection_timeout),           :transient)

test("credit card permanently declined -> permanent",
  failure_type(:card_permanently_declined),            :permanent)

test("downstream API rate limit (429) -> transient",
  failure_type(:api_rate_limit_429),                   :transient)

test("invalid email address (hard bounce) -> permanent",
  failure_type(:email_hard_bounce_invalid_address),    :permanent)

test("DB connection pool exhausted -> transient",
  failure_type(:db_connection_pool_exhausted),         :transient)

test("user record deleted before job ran -> permanent",
  failure_type(:record_not_found_deleted),             :permanent)

test("upstream service 503 (overloaded) -> transient",
  failure_type(:upstream_service_503),                 :transient)

test("malformed CSV data -> permanent",
  failure_type(:malformed_input_data),                 :permanent)

test("DNS resolution failure -> transient",
  failure_type(:dns_resolution_failure),               :transient)

test("account already closed -> permanent",
  failure_type(:account_permanently_closed),           :permanent)

# -----------------------------------------------------------------------------
# Exercise 2
# Queue priority assignment.
# Return :critical, :default, or :bulk
# -----------------------------------------------------------------------------
def queue_priority_for(job_type)
  raise NotImplementedError, "TODO"
end

test("payment confirmation job -> critical",
  queue_priority_for(:payment_confirmation),                 :critical)

test("transactional email (order receipt) -> default",
  queue_priority_for(:order_receipt_email),                  :default)

test("bulk marketing email campaign -> bulk",
  queue_priority_for(:marketing_email_campaign),             :bulk)

test("auth token invalidation -> critical",
  queue_priority_for(:auth_token_invalidation),              :critical)

test("search index update for new post -> default",
  queue_priority_for(:search_index_update),                  :default)

test("monthly report generation -> bulk",
  queue_priority_for(:monthly_report_generation),            :bulk)

test("real-time push notification -> critical",
  queue_priority_for(:realtime_push_notification),           :critical)

test("weekly digest email -> bulk",
  queue_priority_for(:weekly_digest_email),                  :bulk)

test("activity feed update -> default",
  queue_priority_for(:activity_feed_update),                 :default)

test("data export to CSV -> bulk",
  queue_priority_for(:data_export_csv),                      :bulk)

# -----------------------------------------------------------------------------
# Exercise 3
# Queue health assessment.
# Return :healthy, :warning, or :critical
#
# Healthy:  queue_depth < 1_000    AND error_rate < 0.01
# Warning:  queue_depth 1k-10k     OR  error_rate 0.01-0.05
# Critical: queue_depth > 10_000   OR  error_rate > 0.05
# -----------------------------------------------------------------------------
def queue_health(queue_depth:, error_rate:)
  raise NotImplementedError, "TODO"
end

test("depth 100, error 0.001 -> healthy",
  queue_health(queue_depth: 100, error_rate: 0.001),     :healthy)

test("depth 500, error 0.005 -> healthy",
  queue_health(queue_depth: 500, error_rate: 0.005),     :healthy)

test("depth 5000, error 0.001 -> warning (depth elevated)",
  queue_health(queue_depth: 5_000, error_rate: 0.001),   :warning)

test("depth 100, error 0.03 -> warning (error rate elevated)",
  queue_health(queue_depth: 100, error_rate: 0.03),      :warning)

test("depth 50000, error 0.001 -> critical (depth too high)",
  queue_health(queue_depth: 50_000, error_rate: 0.001),  :critical)

test("depth 100, error 0.1 -> critical (error rate too high)",
  queue_health(queue_depth: 100, error_rate: 0.1),       :critical)

test("depth 10001, error 0.001 -> critical (just over threshold)",
  queue_health(queue_depth: 10_001, error_rate: 0.001),  :critical)

test("depth 9999, error 0.049 -> warning (both elevated but below critical)",
  queue_health(queue_depth: 9_999, error_rate: 0.049),   :warning)

# -----------------------------------------------------------------------------
# Exercise 4
# Exponential backoff with jitter.
# Given retry_count, return the base delay in seconds before jitter.
# Formula: base_delay = retry_count^4 + 15
# Return an Integer.
#
# This is Sidekiq's base formula (before jitter).
# Understanding this helps you reason about when retried jobs will fire.
# -----------------------------------------------------------------------------
def base_retry_delay(retry_count)
  raise NotImplementedError, "TODO"
end

test("retry 1: 1^4 + 15 = 16s",   base_retry_delay(1), 16)
test("retry 2: 2^4 + 15 = 31s",   base_retry_delay(2), 31)
test("retry 3: 3^4 + 15 = 96s",   base_retry_delay(3), 96)
test("retry 4: 4^4 + 15 = 271s",  base_retry_delay(4), 271)
test("retry 5: 5^4 + 15 = 640s",  base_retry_delay(5), 640)
test("retry 10: 10^4 + 15 = 10015s", base_retry_delay(10), 10_015)
