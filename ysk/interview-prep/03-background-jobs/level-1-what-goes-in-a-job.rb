# =============================================================================
# Level 1: Sync or Async? What Belongs in a Background Job
# =============================================================================
# Before running: ruby level-1-what-goes-in-a-job.rb
# Goal: classify work as synchronous (do it in the request) or
#       asynchronous (enqueue a job).
#
# Three signals for a background job:
#   1. Slow (> ~100ms): email, image processing, third-party APIs
#   2. The user doesn't need it before seeing the response
#   3. Retryable on transient failure without user interaction

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
# Classify each operation: :sync or :async
#
# Ask yourself:
#   a) Does the user need this to happen before they see the response?
#   b) Is it slow or potentially slow?
#   c) Can it fail and be retried safely?
# -----------------------------------------------------------------------------
def classify(operation)
  raise NotImplementedError, "TODO"
end

test("validate params is sync",          classify(:validate_user_params),  :sync)
test("save to DB is sync",               classify(:save_user_to_database),  :sync)
test("welcome email is async",           classify(:send_welcome_email),     :async)
test("slack notification is async",      classify(:post_to_slack_channel),  :async)
test("pdf generation is async",          classify(:generate_pdf_report),    :async)
test("check user exists is sync",        classify(:check_if_user_exists),   :sync)
test("image resize is async",            classify(:resize_uploaded_image),  :async)
test("credit card charge is sync",       classify(:charge_credit_card),     :sync)
test("search index update is async",     classify(:update_search_index),    :async)
test("inventory decrement is sync",      classify(:decrement_inventory_count), :sync)

# -----------------------------------------------------------------------------
# Exercise 2
# What should you pass to a background job?
# Return :id_only or :full_object
#
# Rule: always pass the ID.
# The object might change between enqueue and execution.
# The worker should always find fresh data from the database.
# -----------------------------------------------------------------------------
def what_to_pass(scenario)
  raise NotImplementedError, "TODO"
end

test("user created: pass id", what_to_pass(:user_created_moments_ago),   :id_only)
test("post with associations: pass id", what_to_pass(:post_with_associations), :id_only)
test("large object: still pass id", what_to_pass(:large_model_object),   :id_only)
test("even for email: pass user.id, load email in job", what_to_pass(:simple_scalar_like_email), :id_only)

# -----------------------------------------------------------------------------
# Exercise 3
# Time budget for a web request.
# If the total acceptable response time is 200ms, and DB + auth takes 50ms,
# how much time is left for synchronous work?
# Any single operation over the remaining budget should become a job.
# -----------------------------------------------------------------------------
def time_left_for_sync(total_budget_ms, db_and_auth_ms)
  raise NotImplementedError, "TODO"
end

def should_be_async?(operation_ms, remaining_budget_ms)
  raise NotImplementedError, "TODO"
end

remaining = time_left_for_sync(200, 50)  # should be 150ms

test("time left for sync work", remaining, 150)
test("email (500ms) should be async",   should_be_async?(500, remaining), true)
test("DB write (20ms) can be sync",     should_be_async?(20,  remaining), false)
test("image resize (2000ms) is async",  should_be_async?(2000, remaining), true)
test("cache write (5ms) can be sync",   should_be_async?(5,   remaining), false)
