# =============================================================================
# Level 2: Idempotency — Making Jobs Safe to Run Multiple Times
# =============================================================================
# Before running: ruby level-2-idempotency.rb
# Goal: identify whether a job is naturally idempotent, choose the right
#       idempotency strategy, and detect double-execution risks.
#
# Idempotent: calling the operation N times produces the same result as calling it once.
#
# Strategies:
#   :naturally_idempotent    -> operation is idempotent by design (SET, not INCREMENT)
#   :redis_nx_key            -> check Redis key before acting; SET NX for atomicity
#   :db_upsert               -> INSERT ... ON CONFLICT DO NOTHING; unique constraint
#   :not_idempotent          -> operation is not idempotent and has no protection
#
# Double-execution risks:
#   :duplicate_send          -> user receives the same email/SMS twice
#   :double_charge           -> user is charged twice for the same order
#   :double_increment        -> counter incremented twice (count is wrong)
#   :harmless                -> running twice produces the same result

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
# Is this job naturally idempotent?
# Return :idempotent or :not_idempotent
#
# Naturally idempotent: SET a value, mark a flag, create-or-find-by unique key.
# Not idempotent: INCREMENT, SEND (email/SMS/push), CHARGE, APPEND to a list.
# -----------------------------------------------------------------------------
def natural_idempotency(operation)
  raise NotImplementedError, "TODO"
end

test("set user.email_verified = true -> idempotent",
  natural_idempotency(:set_email_verified_flag),          :idempotent)

test("increment user login count -> not_idempotent",
  natural_idempotency(:increment_login_count),            :not_idempotent)

test("send welcome email -> not_idempotent",
  natural_idempotency(:send_welcome_email),               :not_idempotent)

test("update user.last_seen_at = now -> idempotent (SET, not append)",
  natural_idempotency(:update_last_seen_at),              :idempotent)

test("charge payment method -> not_idempotent",
  natural_idempotency(:charge_payment_method),            :not_idempotent)

test("mark post as published -> idempotent (setting a boolean)",
  natural_idempotency(:mark_post_as_published),           :idempotent)

test("send push notification -> not_idempotent",
  natural_idempotency(:send_push_notification),           :not_idempotent)

test("upsert record by unique key -> idempotent",
  natural_idempotency(:upsert_by_unique_key),             :idempotent)

# -----------------------------------------------------------------------------
# Exercise 2
# What idempotency strategy should this job use?
# Return :naturally_idempotent, :redis_nx_key, or :db_upsert
#
# :naturally_idempotent -> no extra work needed; operation is safe by design
# :redis_nx_key         -> short-lived guard; fast; acceptable if some window of
#                          re-execution is ok after key TTL expires
# :db_upsert            -> durable, permanent guard; use for financial ops or
#                          when you need an audit trail of execution
# -----------------------------------------------------------------------------
def idempotency_strategy_for(job_description)
  raise NotImplementedError, "TODO"
end

test("set email_verified flag (naturally idempotent) -> naturally_idempotent",
  idempotency_strategy_for(:set_email_verified_flag),            :naturally_idempotent)

test("send welcome email (must not send twice) -> redis_nx_key",
  idempotency_strategy_for(:send_welcome_email_once),            :redis_nx_key)

test("charge a payment (must not double-charge, need audit trail) -> db_upsert",
  idempotency_strategy_for(:charge_payment_with_audit),          :db_upsert)

test("update Elasticsearch index -> naturally_idempotent (reindex = same result)",
  idempotency_strategy_for(:reindex_post_in_elasticsearch),      :naturally_idempotent)

test("send Slack notification once per event -> redis_nx_key",
  idempotency_strategy_for(:slack_notify_once_per_event),        :redis_nx_key)

test("record a payment refund (must not refund twice, need ledger) -> db_upsert",
  idempotency_strategy_for(:record_payment_refund),              :db_upsert)

test("mark post as deleted -> naturally_idempotent",
  idempotency_strategy_for(:soft_delete_post),                   :naturally_idempotent)

# -----------------------------------------------------------------------------
# Exercise 3
# What is the risk of double execution for this job?
# Return :duplicate_send, :double_charge, :double_increment, or :harmless
# -----------------------------------------------------------------------------
def double_execution_risk(job_type)
  raise NotImplementedError, "TODO"
end

test("send order confirmation email -> duplicate_send",
  double_execution_risk(:send_order_confirmation_email),     :duplicate_send)

test("charge credit card for subscription -> double_charge",
  double_execution_risk(:charge_subscription_renewal),       :double_charge)

test("increment daily active user count -> double_increment",
  double_execution_risk(:increment_dau_counter),             :double_increment)

test("update user's last_active_at timestamp -> harmless (SET, not increment)",
  double_execution_risk(:update_last_active_at),             :harmless)

test("send password reset SMS -> duplicate_send",
  double_execution_risk(:send_password_reset_sms),           :duplicate_send)

test("re-generate search index for post -> harmless (idempotent by nature)",
  double_execution_risk(:regenerate_search_index),           :harmless)
