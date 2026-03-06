# =============================================================================
# Level 1: Sync or Async — Classifying Operations and Time Budgets
# =============================================================================
# Before running: ruby level-1-sync-vs-async.rb
# Goal: correctly classify operations as synchronous or asynchronous,
#       understand the time budget model, and apply the "what to pass" rule.
#
# Three signals for async:
#   1. Slow (> ~100ms): email, image processing, external API
#   2. Deferrable: user doesn't need it before seeing the response
#   3. Retryable: if it fails, can retry without user interaction
#
# Rule: if ANY signal is missing (not slow, not deferrable, not retryable), lean sync.

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
# Classify each operation. Return :sync or :async
# -----------------------------------------------------------------------------
def classify(operation)
  raise NotImplementedError, "TODO"
end

test("validate params -> sync (fast, user needs result)",
  classify(:validate_user_params),           :sync)

test("save user to DB -> sync (user needs confirmation)",
  classify(:save_user_to_database),          :sync)

test("send welcome email -> async (slow, deferrable, retryable)",
  classify(:send_welcome_email),             :async)

test("post to Slack channel -> async (slow, deferrable, retryable)",
  classify(:post_to_slack_channel),          :async)

test("generate PDF report -> async (slow)",
  classify(:generate_pdf_report),            :async)

test("check if user exists -> sync (fast, user needs result)",
  classify(:check_if_user_exists),           :sync)

test("resize uploaded image -> async (slow, 2s+)",
  classify(:resize_uploaded_image),          :async)

test("charge credit card -> sync (NOT deferrable: user needs to know outcome)",
  classify(:charge_credit_card),             :sync)

test("update Elasticsearch index -> async (deferrable, retryable)",
  classify(:update_search_index),            :async)

test("decrement inventory count -> sync (must happen in same transaction as order)",
  classify(:decrement_inventory_count),      :sync)

test("send SMS verification code -> sync (user is waiting for it)",
  classify(:send_sms_verification_code),     :sync)

test("sync to analytics platform -> async (deferrable, retryable)",
  classify(:sync_to_analytics_platform),     :async)

test("generate thumbnail for video -> async (slow)",
  classify(:generate_video_thumbnail),       :async)

test("insert order row to DB -> sync (must complete before response)",
  classify(:insert_order_row),               :sync)

# -----------------------------------------------------------------------------
# Exercise 2
# What should you pass to a background job?
# Return :id_only or :full_object
#
# Rule: always pass IDs. Objects serialized at enqueue time are stale at execution.
# The job must fetch fresh data from the DB at execution time.
# -----------------------------------------------------------------------------
def what_to_pass(scenario)
  raise NotImplementedError, "TODO"
end

test("recently created user -> id_only",
  what_to_pass(:user_created_moments_ago),     :id_only)

test("post with many associations -> id_only",
  what_to_pass(:post_with_associations),       :id_only)

test("large order object -> id_only",
  what_to_pass(:large_order_object),           :id_only)

test("simple scalar like email -> id_only (pass user.id, load email in job)",
  what_to_pass(:simple_scalar_email),          :id_only)

test("notification with metadata -> id_only",
  what_to_pass(:notification_with_metadata),   :id_only)

# -----------------------------------------------------------------------------
# Exercise 3
# Time budget for a web request.
# Total acceptable response time: 200ms
# DB + auth overhead: 50ms
# Remaining budget for synchronous work: 150ms
#
# Any single operation over the remaining budget should become a background job.
# -----------------------------------------------------------------------------
def time_left_for_sync(total_budget_ms, overhead_ms)
  raise NotImplementedError, "TODO"
end

def should_be_async?(operation_ms, remaining_budget_ms)
  raise NotImplementedError, "TODO"
end

remaining = time_left_for_sync(200, 50)

test("time left for sync work", remaining, 150)
test("welcome email (400ms) -> async",     should_be_async?(400, remaining),  true)
test("DB write (20ms) -> sync",            should_be_async?(20,  remaining),  false)
test("image resize (2000ms) -> async",     should_be_async?(2000, remaining), true)
test("cache write (5ms) -> sync",          should_be_async?(5,   remaining),  false)
test("external API call (300ms) -> async", should_be_async?(300, remaining),  true)
test("validation (10ms) -> sync",          should_be_async?(10,  remaining),  false)
test("Slack post (200ms) -> async",        should_be_async?(200, remaining),  true)
test("exactly at budget (150ms) -> sync",  should_be_async?(150, remaining),  false)
test("one ms over (151ms) -> async",       should_be_async?(151, remaining),  true)
