# =============================================================================
# Level 2: TTL and Cache Invalidation
# =============================================================================
# Before running: ruby level-2-ttl-and-invalidation.rb
# Goal: choose appropriate TTLs and invalidation strategies.
#       Understand the trade-off between staleness and DB load.
#
# TTL formula: balance how_stale_is_acceptable vs how_expensive_is_a_miss
# Invalidation strategies:
#   :ttl_expiry       -> passive; cache expires on schedule
#   :event_invalidate -> active; delete key on write
#   :write_through    -> update cache synchronously on write (no stale window)
#   :version_key      -> embed version in key; old keys ignored, expire via TTL

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
# Choose the appropriate TTL bucket for each data type.
# Return :very_short (< 60s), :short (1-5 min), :medium (5-30 min), or :long (> 30 min)
#
# Rules:
#   Data that changes every few seconds, stale = real harm -> :very_short
#   User-facing data that changes occasionally              -> :short
#   Expensive-to-compute, occasional updates               -> :medium
#   Rarely-changes, high compute cost                      -> :long
# -----------------------------------------------------------------------------
def ttl_bucket_for(data_type)
  raise NotImplementedError, "TODO"
end

test("live stock price (updates per second) -> very_short",
  ttl_bucket_for(:live_stock_price),             :very_short)

test("product price (changes infrequently but stale = lost revenue) -> very_short",
  ttl_bucket_for(:product_price_ecommerce),      :very_short)

test("user profile bio and avatar -> short",
  ttl_bucket_for(:user_profile_bio),             :short)

test("homepage featured posts -> short",
  ttl_bucket_for(:homepage_featured_posts),      :short)

test("user's generated report -> medium",
  ttl_bucket_for(:user_generated_report),        :medium)

test("search autocomplete suggestions -> medium",
  ttl_bucket_for(:search_autocomplete),          :medium)

test("country list for dropdown -> long",
  ttl_bucket_for(:country_dropdown_list),        :long)

test("terms of service text -> long",
  ttl_bucket_for(:terms_of_service_text),        :long)

# -----------------------------------------------------------------------------
# Exercise 2
# Choose the right invalidation strategy for each scenario.
# Return :ttl_expiry, :event_invalidate, :write_through, or :version_key
#
# :ttl_expiry       -> you don't control the write, or stale within TTL is fine
# :event_invalidate -> you control the write; delete cache key after DB update
# :write_through    -> you need zero stale window; update cache and DB together
# :version_key      -> schema change or deploy-time cache shape change
# -----------------------------------------------------------------------------
def invalidation_strategy_for(scenario)
  raise NotImplementedError, "TODO"
end

test("product description updated by admin, stale for 5 min ok -> ttl_expiry",
  invalidation_strategy_for(:product_description_admin_update_stale_ok), :ttl_expiry)

test("user changes their email, must see new email immediately -> event_invalidate",
  invalidation_strategy_for(:user_email_change_see_immediately),         :event_invalidate)

test("account balance, must never be stale after a write -> write_through",
  invalidation_strategy_for(:account_balance_never_stale),               :write_through)

test("deploy adds new field to cached user object -> version_key",
  invalidation_strategy_for(:deploy_adds_field_to_cached_object),        :version_key)

test("external third-party pushes data you cache -> ttl_expiry",
  invalidation_strategy_for(:third_party_data_you_dont_control),         :ttl_expiry)

test("user updates their post, wants to see change immediately -> event_invalidate",
  invalidation_strategy_for(:user_updates_post_immediate_feedback),      :event_invalidate)

# -----------------------------------------------------------------------------
# Exercise 3
# Calculate DB request rate given TTL and request volume.
# With a fixed TTL, the cache refills once per TTL window per key.
# For a single popular key: DB gets 1 query per TTL seconds (plus 1 at cold start).
# For a pool of N unique keys, each accessed R times per TTL:
#   DB requests = N (one per key per TTL window, assuming all keys are active)
#
# Simplified: given requests_per_second and hit_rate, return DB requests per second.
# Same formula as level 1: db_req = total_qps * (1 - hit_rate)
# But here we also validate: would a shorter TTL raise the hit rate or lower it?
#
# Return the DB requests/second as a Float.
# -----------------------------------------------------------------------------
def db_req_per_sec(total_qps, hit_rate)
  raise NotImplementedError, "TODO"
end

test("8000 QPS, 92% hit rate -> 640.0 DB req/sec",
  db_req_per_sec(8_000, 0.92), 640.0)

test("20000 QPS, 98% hit rate -> 400.0 DB req/sec",
  db_req_per_sec(20_000, 0.98), 400.0)

test("1000 QPS, 70% hit rate -> 300.0 DB req/sec",
  db_req_per_sec(1_000, 0.70), 300.0)

# -----------------------------------------------------------------------------
# Exercise 4
# TTL impact on consistency window.
# Given a TTL, what is the maximum time (in seconds) a user could see stale data
# after an update?
# Return an Integer (seconds).
#
# Answer: the maximum stale window equals the TTL.
# If a key is cached 1 second after the TTL starts, and then updated in the DB,
# the cached value can live for up to (TTL - 1) more seconds — so the worst case
# is the full TTL (if the key was just populated when the update happened).
# -----------------------------------------------------------------------------
def max_stale_window_seconds(ttl_seconds)
  raise NotImplementedError, "TODO"
end

test("60 second TTL -> max 60 seconds stale",   max_stale_window_seconds(60),   60)
test("300 second TTL -> max 300 seconds stale", max_stale_window_seconds(300),  300)
test("30 second TTL -> max 30 seconds stale",   max_stale_window_seconds(30),   30)
test("3600 second TTL -> max 3600 seconds stale", max_stale_window_seconds(3600), 3600)
