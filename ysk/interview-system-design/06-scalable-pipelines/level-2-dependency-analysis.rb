# =============================================================================
# Level 2: Dependency Analysis — Fan-out Safety and Sequential Dependencies
# =============================================================================
# Before running: ruby level-2-dependency-analysis.rb
# Goal: determine whether a set of jobs can safely run in parallel (fan-out)
#       or must run sequentially (pipeline), and identify the correct order
#       for dependent operations.
#
# Fan-out is safe when:
#   - No job reads data that another job in the set writes
#   - No job depends on another completing successfully first
#   - Jobs failing independently don't invalidate other jobs' work
#
# Pipeline is required when:
#   - Job B uses the output or side effect of Job A
#   - Job B must not run if Job A failed

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
# Are these jobs safe to run in parallel (fan-out)?
# Return :independent (fan-out ok) or :dependent (pipeline required)
# -----------------------------------------------------------------------------
def fan_out_safe?(jobs)
  raise NotImplementedError, "TODO"
end

test("email + slack + analytics: all read original event, none depend on each other -> independent",
  fan_out_safe?(:email_and_slack_and_analytics),                              :independent)

test("charge THEN send receipt: receipt requires successful charge first -> dependent",
  fan_out_safe?(:charge_then_send_receipt),                                   :dependent)

test("update search index + increment view count: neither reads the other's output -> independent",
  fan_out_safe?(:update_search_index_and_view_count),                         :independent)

test("create order -> decrement inventory -> notify warehouse: chain of dependencies -> dependent",
  fan_out_safe?(:create_order_decrement_inventory_notify_warehouse),          :dependent)

test("send email + post slack: independent of each other -> independent",
  fan_out_safe?(:send_email_and_post_slack),                                  :independent)

test("verify token -> send password reset email: email needs valid token first -> dependent",
  fan_out_safe?(:verify_token_then_send_reset_email),                        :dependent)

test("log to analytics + send notification: neither depends on the other -> independent",
  fan_out_safe?(:log_analytics_and_send_notification),                        :independent)

test("transcode video -> generate thumbnail: thumbnail requires transcoded video -> dependent",
  fan_out_safe?(:transcode_video_then_generate_thumbnail),                    :dependent)

# -----------------------------------------------------------------------------
# Exercise 2
# Pipeline ordering.
# Given a set of jobs with dependencies, return the correct execution order
# as an array of symbols.
#
# Rule: if B depends on A, A must come before B.
# Return the jobs in the correct order from first to last.
# -----------------------------------------------------------------------------
def pipeline_order(jobs_with_deps)
  raise NotImplementedError, "TODO"
end

test("validate -> transcode -> thumbnail -> notify",
  pipeline_order({
    validate:  [],
    transcode: [:validate],
    thumbnail: [:transcode],
    notify:    [:thumbnail]
  }),
  [:validate, :transcode, :thumbnail, :notify])

test("charge -> fulfill + send_receipt (both depend on charge, independent of each other)",
  pipeline_order({
    charge:       [],
    fulfill:      [:charge],
    send_receipt: [:charge]
  }),
  [:charge, :fulfill, :send_receipt])

test("create_token -> send_email (email depends on token)",
  pipeline_order({
    create_token: [],
    send_email:   [:create_token]
  }),
  [:create_token, :send_email])

# -----------------------------------------------------------------------------
# Exercise 3
# Fan-out scale: is tiered fan-out needed?
# Given the number of recipients, return :direct_fanout or :tiered_fanout
#
# Direct fan-out: safe when recipients < 100,000
#   Enqueue one job per recipient immediately.
#
# Tiered fan-out: required when recipients >= 100,000
#   Enqueue batches (e.g., 10,000 recipients per batch job).
#   Each batch job enqueues its own individual jobs.
#   Prevents a single event from creating 1M+ queue entries instantly.
# -----------------------------------------------------------------------------
def fanout_strategy(recipient_count)
  raise NotImplementedError, "TODO"
end

test("100 recipients -> direct_fanout",
  fanout_strategy(100),         :direct_fanout)

test("50000 recipients -> direct_fanout",
  fanout_strategy(50_000),      :direct_fanout)

test("99999 recipients -> direct_fanout",
  fanout_strategy(99_999),      :direct_fanout)

test("100000 recipients -> tiered_fanout",
  fanout_strategy(100_000),     :tiered_fanout)

test("10M followers (celebrity post) -> tiered_fanout",
  fanout_strategy(10_000_000),  :tiered_fanout)

# -----------------------------------------------------------------------------
# Exercise 4
# Batch size for tiered fan-out.
# Given total recipient count and desired batch size (recipients per batch job),
# how many batch jobs need to be enqueued?
# Return an Integer (round up).
# -----------------------------------------------------------------------------
def batch_job_count(total_recipients, batch_size)
  raise NotImplementedError, "TODO"
end

test("1M recipients, 10k batch size -> 100 batch jobs",
  batch_job_count(1_000_000, 10_000),    100)

test("10M recipients, 10k batch size -> 1000 batch jobs",
  batch_job_count(10_000_000, 10_000),   1_000)

test("150k recipients, 10k batch size -> 15 batch jobs",
  batch_job_count(150_000, 10_000),      15)

test("105k recipients, 10k batch size -> 11 batch jobs (round up)",
  batch_job_count(105_000, 10_000),      11)
