# =============================================================================
# Level 2: Idempotency — Safe to Run Multiple Times
# =============================================================================
# Before running: ruby level-2-idempotency.rb
# Goal: understand what makes a job idempotent and how to make one that isn't.
#
# An idempotent job: running it 10 times has the same effect as running it once.
# Why it matters: Sidekiq retries on failure. Your job WILL run more than once.

# -----------------------------------------------------------------------------
# Exercise 1
# Simulate a job that's NOT idempotent.
# track_pageview increments a counter every time it's called.
# Running it 3 times produces a count of 3, not 1.
#
# Then implement an idempotent version using a "seen" set.
# Return the count after N runs with a given event ID.
# -----------------------------------------------------------------------------
# Non-idempotent version
def track_pageview_naive(page_id, runs)
  count = 0
  runs.times { count += 1 }
  count
end

# Idempotent version — uses a set to track which events were already processed
def track_pageview_idempotent(page_id, event_ids)
  seen = Set.new
  count = 0
  event_ids.each do |event_id|
    unless seen.include?(event_id)
      seen.add(event_id)
      count += 1
    end
  end
  count
end

require "set"

test("naive: 3 runs = count of 3 (wrong for retry scenario)",
  track_pageview_naive("home", 3), 3)

test("naive: 1 run = count of 1",
  track_pageview_naive("home", 1), 1)

# Simulate 3 retries of the same event (same event_id repeated)
test("idempotent: same event_id 3 times = count of 1",
  track_pageview_idempotent("home", ["evt_1", "evt_1", "evt_1"]), 1)

# Simulate 3 different events (each should count)
test("idempotent: 3 unique events = count of 3",
  track_pageview_idempotent("home", ["evt_1", "evt_2", "evt_3"]), 3)

# -----------------------------------------------------------------------------
# Exercise 2
# Simulate an idempotent charge.
# Given an order with a :charged boolean, the charge should only happen once.
# Return the number of times the charge was actually executed.
# -----------------------------------------------------------------------------
def charge_order(order, times_job_runs)
  charge_count = 0
  times_job_runs.times do
    # Idempotency check: if already charged, skip
    next if order[:charged]

    # Process the charge
    charge_count += 1
    order[:charged] = true
    order[:charge_id] = "ch_#{rand(10000)}"
  end
  charge_count
end

order_a = { id: 1, total: 100, charged: false }
test("charge runs once even if job runs 3 times",
  charge_order(order_a, 3), 1)

order_b = { id: 2, total: 200, charged: true }  # already charged
test("already-charged order: charge runs 0 times",
  charge_order(order_b, 5), 0)

order_c = { id: 3, total: 50, charged: false }
test("uncharged order runs once job once",
  charge_order(order_c, 1), 1)

# -----------------------------------------------------------------------------
# Exercise 3
# Identify whether each job implementation is idempotent.
# Return :idempotent or :not_idempotent
#
# An implementation is idempotent if calling it N times produces the same
# end state as calling it once.
# -----------------------------------------------------------------------------
def is_idempotent?(implementation)
  case implementation
  when :create_record_without_check
    # User.create!(email: email)
    # On retry: creates a duplicate user -> NOT idempotent
    :not_idempotent

  when :find_or_create_by
    # User.find_or_create_by(email: email)
    # On retry: finds the existing user, doesn't create again -> idempotent
    :idempotent

  when :send_email_every_time
    # UserMailer.welcome(user).deliver_now
    # No check — sends on every run -> NOT idempotent
    :not_idempotent

  when :send_email_with_sent_at_check
    # return if user.welcome_email_sent_at.present?
    # UserMailer.welcome(user).deliver_now
    # user.update_columns(welcome_email_sent_at: Time.current)
    # Idempotent — checks before sending
    :idempotent

  when :increment_counter
    # account.increment!(:login_count)
    # On retry: increments again -> NOT idempotent
    :not_idempotent

  when :set_status_to_value
    # account.update!(status: :active)
    # On retry: sets to same value again -> idempotent (same result)
    :idempotent
  end
end

test("create without check: not idempotent",  is_idempotent?(:create_record_without_check),  :not_idempotent)
test("find_or_create_by: idempotent",          is_idempotent?(:find_or_create_by),             :idempotent)
test("send email every time: not idempotent",  is_idempotent?(:send_email_every_time),         :not_idempotent)
test("send email with sent_at check: idempotent", is_idempotent?(:send_email_with_sent_at_check), :idempotent)
test("increment counter: not idempotent",      is_idempotent?(:increment_counter),             :not_idempotent)
test("set status to value: idempotent",        is_idempotent?(:set_status_to_value),           :idempotent)

# -----------------------------------------------------------------------------
# Exercise 4
# The after_create vs after_commit timing trap.
# Return which callback is safe for each use case.
# :after_create or :after_commit
# -----------------------------------------------------------------------------
def safe_callback_for(use_case)
  case use_case
  when :enqueue_background_job
    # Jobs may run before transaction commits -> after_commit
    :after_commit

  when :send_email_via_job
    # Same issue as enqueueing a job
    :after_commit

  when :update_in_memory_cache
    # In-memory, no external process involved, after_create is fine
    :after_create

  when :trigger_webhook_to_external_service
    # External call — must happen after commit or external service has data we haven't saved
    :after_commit

  when :log_to_local_logger
    # Local, fast, no external dependency
    :after_create
  end
end

test("enqueue job: use after_commit",         safe_callback_for(:enqueue_background_job),        :after_commit)
test("send email via job: use after_commit",  safe_callback_for(:send_email_via_job),            :after_commit)
test("update memory cache: after_create ok",  safe_callback_for(:update_in_memory_cache),        :after_create)
test("webhook: use after_commit",             safe_callback_for(:trigger_webhook_to_external_service), :after_commit)
test("local log: after_create ok",            safe_callback_for(:log_to_local_logger),           :after_create)

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
