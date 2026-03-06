# =============================================================================
# Level 3: Cache Stampede Prevention and Eviction Policies
# =============================================================================
# Before running: ruby level-3-stampede-prevention.rb
# Goal: identify stampede risk, select the correct prevention technique,
#       and choose the right eviction policy for each cache usage pattern.
#
# Stampede (thundering herd): many concurrent requests see a cache miss
#   simultaneously and all hit the database with the same query.
#
# Prevention strategies:
#   :mutex_lock              -> one request recomputes; others wait
#   :stale_while_revalidate  -> serve stale; background refresh; no waiting
#   :probabilistic_expiry    -> random early refresh; distributed recompute
#   :no_action               -> stampede risk is not present
#
# Eviction policies:
#   :lru   -> least recently used evicted first
#   :lfu   -> least frequently used evicted first
#   :ttl   -> shortest remaining TTL evicted first (volatile-ttl)
#   :none  -> no eviction; return error when full (noeviction)

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
# Does this scenario have stampede risk?
# Return :at_risk or :not_at_risk
#
# Stampede risk is present when ALL of:
#   1. Traffic to the key is high (> 500 req/sec on the key)
#   2. The key has a TTL (it will expire)
#   3. Cache miss is expensive (DB query takes meaningful time)
# If ANY of those is false, stampede risk is low.
# -----------------------------------------------------------------------------
def stampede_risk?(qps_on_key, has_ttl, miss_cost_ms)
  raise NotImplementedError, "TODO"
end

test("1000 QPS, has TTL, 50ms miss -> at_risk",
  stampede_risk?(1000, true, 50),   :at_risk)

test("10 QPS, has TTL, 200ms miss -> not_at_risk (low traffic)",
  stampede_risk?(10, true, 200),    :not_at_risk)

test("5000 QPS, no TTL, 100ms miss -> not_at_risk (no expiry)",
  stampede_risk?(5000, false, 100), :not_at_risk)

test("2000 QPS, has TTL, 1ms miss -> not_at_risk (miss is cheap)",
  stampede_risk?(2000, true, 1),    :not_at_risk)

test("800 QPS, has TTL, 80ms miss -> at_risk",
  stampede_risk?(800, true, 80),    :at_risk)

test("0 QPS, has TTL, 500ms miss -> not_at_risk (no traffic)",
  stampede_risk?(0, true, 500),     :not_at_risk)

# -----------------------------------------------------------------------------
# Exercise 2
# Choose the stampede prevention strategy.
# Return :mutex_lock, :stale_while_revalidate, :probabilistic_expiry, or :no_action
#
# Rules:
#   No stampede risk present                          -> :no_action
#   High traffic, brief stale window acceptable       -> :stale_while_revalidate
#   Moderate traffic, can block briefly               -> :mutex_lock
#   Cannot afford any stale data, but must be fast    -> :mutex_lock (with short lock timeout)
# -----------------------------------------------------------------------------
def stampede_prevention_for(scenario)
  raise NotImplementedError, "TODO"
end

test("homepage at 50k req/sec, 1 second stale ok -> stale_while_revalidate",
  stampede_prevention_for(:homepage_50k_rps_stale_ok),                  :stale_while_revalidate)

test("user dashboard at 200 req/sec, brief wait acceptable -> mutex_lock",
  stampede_prevention_for(:user_dashboard_200_rps),                     :mutex_lock)

test("country dropdown, 5 req/sec, long TTL -> no_action",
  stampede_prevention_for(:country_dropdown_5_rps),                     :no_action)

test("trending feed at 100k req/sec, must scale -> stale_while_revalidate",
  stampede_prevention_for(:trending_feed_100k_rps),                     :stale_while_revalidate)

test("search result page, 500 req/sec, users expect near-fresh data -> mutex_lock",
  stampede_prevention_for(:search_results_500_rps_near_fresh),          :mutex_lock)

test("per-user notification count, 10 req/sec -> no_action",
  stampede_prevention_for(:per_user_notification_count),                :no_action)

# -----------------------------------------------------------------------------
# Exercise 3
# Thundering herd impact: how many DB queries does a stampede generate?
# Given concurrent_requests at the moment of expiry and db_query_time_ms,
# all requests that arrive within db_query_time_ms of expiry hit the DB.
#
# Simplified model:
#   Queries per second on this key = qps
#   DB takes db_query_time_ms to respond
#   During that window, (qps * db_query_time_ms / 1000) requests arrive and all miss
#   Each fires a DB query.
#   Return the number of duplicate DB queries as an Integer (minimum 1).
# -----------------------------------------------------------------------------
def stampede_db_queries(qps, db_query_time_ms)
  raise NotImplementedError, "TODO"
end

test("1000 QPS, 100ms query time -> 100 duplicate DB queries",
  stampede_db_queries(1000, 100), 100)

test("50000 QPS, 50ms query time -> 2500 duplicate DB queries",
  stampede_db_queries(50_000, 50), 2500)

test("100 QPS, 200ms query time -> 20 duplicate DB queries",
  stampede_db_queries(100, 200), 20)

test("1 QPS, 500ms query time -> 1 (minimum 1, no stampede at this rate)",
  stampede_db_queries(1, 500), 1)

# -----------------------------------------------------------------------------
# Exercise 4
# Eviction policy selection.
# Return :lru, :lfu, :ttl, or :none
#
# :lru  -> good for temporal locality (recently accessed = likely to be accessed again)
# :lfu  -> good for popularity-based retention (viral/popular content stays in cache)
# :ttl  -> good when you want shortest-lived keys to leave first (mixed TTL pools)
# :none -> good when eviction is worse than an error (critical data, small dataset)
# -----------------------------------------------------------------------------
def eviction_policy_for(cache_usage)
  raise NotImplementedError, "TODO"
end

test("general user session cache -> lru",
  eviction_policy_for(:user_session_cache),                    :lru)

test("news article cache (viral articles should stay) -> lfu",
  eviction_policy_for(:news_article_popularity_cache),         :lfu)

test("mixed cache: some keys expire in 30s, some in 1hr -> ttl",
  eviction_policy_for(:mixed_ttl_pool),                        :ttl)

test("distributed lock store, eviction = data corruption -> none",
  eviction_policy_for(:distributed_lock_store),                :none)

test("API response cache for different endpoints -> lru",
  eviction_policy_for(:api_response_cache),                    :lru)

test("product page cache, popular products should stay warm -> lfu",
  eviction_policy_for(:product_page_popularity),               :lfu)
