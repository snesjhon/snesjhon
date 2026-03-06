# =============================================================================
# Level 1: Cache Patterns — Choosing the Right Pattern for Each Scenario
# =============================================================================
# Before running: ruby level-1-cache-patterns.rb
# Goal: for a given use case, identify the correct cache pattern and
#       understand why the alternatives would fail.
#
# Three patterns:
#   :cache_aside    -> check cache first; on miss, load from DB and populate cache
#   :write_through  -> on write, update BOTH cache and DB synchronously
#   :write_behind   -> on write, update cache only; async DB flush later

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
# Choose the cache pattern for each scenario.
# Return :cache_aside, :write_through, or :write_behind
#
# Key questions:
#   Can writes accept double latency (cache + DB)?    -> write_through is viable
#   Can data loss on a few writes be tolerated?       -> write_behind is viable
#   Otherwise                                         -> cache_aside (default)
# -----------------------------------------------------------------------------
def cache_pattern_for(scenario)
  raise NotImplementedError, "TODO"
end

test("user profile reads, updated infrequently -> cache_aside",
  cache_pattern_for(:user_profile_read_heavy),                   :cache_aside)

test("real-time view counter, 10k increments/sec -> write_behind",
  cache_pattern_for(:realtime_view_counter_high_write),          :write_behind)

test("user settings page: updated, must appear immediately on reload -> write_through",
  cache_pattern_for(:user_settings_must_appear_on_reload),       :write_through)

test("product catalog, read 100x more than written -> cache_aside",
  cache_pattern_for(:product_catalog_read_heavy),                :cache_aside)

test("social post like count, high volume, small loss ok -> write_behind",
  cache_pattern_for(:post_like_count_high_volume),               :write_behind)

test("user dashboard after save must reflect changes -> write_through",
  cache_pattern_for(:dashboard_reflects_changes_after_save),     :write_through)

test("blog post content, rarely updated -> cache_aside",
  cache_pattern_for(:blog_post_content_rarely_updated),          :cache_aside)

test("leaderboard score updates, 50k/sec -> write_behind",
  cache_pattern_for(:leaderboard_high_frequency_update),         :write_behind)

# -----------------------------------------------------------------------------
# Exercise 2
# Identify what BREAKS if you use the wrong pattern.
# Return :stale_data, :slow_writes, :data_loss, or :unnecessary_complexity
#
# Stale data:             cache-aside without TTL/invalidation on writes
# Slow writes:            write-through when writes are far more frequent than reads
# Data loss:              write-behind for financial/critical data
# Unnecessary complexity: write-through or write-behind for rarely-read data
# -----------------------------------------------------------------------------
def wrong_pattern_consequence(scenario, wrong_pattern)
  raise NotImplementedError, "TODO"
end

test("financial ledger with write_behind -> data_loss",
  wrong_pattern_consequence(:financial_ledger, :write_behind),           :data_loss)

test("click counter with write_through -> slow_writes",
  wrong_pattern_consequence(:click_counter_10k_per_sec, :write_through), :slow_writes)

test("user profile with cache_aside and no invalidation -> stale_data",
  wrong_pattern_consequence(:user_profile_no_invalidation, :cache_aside),:stale_data)

test("one-time report generation with write_through -> unnecessary_complexity",
  wrong_pattern_consequence(:one_time_report, :write_through),           :unnecessary_complexity)

test("inventory count with write_behind -> data_loss",
  wrong_pattern_consequence(:inventory_count, :write_behind),            :data_loss)

# -----------------------------------------------------------------------------
# Exercise 3
# Cache hit rate and throughput.
# Given a hit rate and total QPS, calculate how many requests reach the DB.
# Return an Integer.
#
# Formula: db_requests = total_qps * (1 - hit_rate)
# -----------------------------------------------------------------------------
def db_requests_per_second(total_qps, hit_rate)
  raise NotImplementedError, "TODO"
end

test("10000 QPS, 90% hit rate -> 1000 to DB",
  db_requests_per_second(10_000, 0.90), 1000)

test("5000 QPS, 95% hit rate -> 250 to DB",
  db_requests_per_second(5_000, 0.95), 250)

test("1000 QPS, 80% hit rate -> 200 to DB",
  db_requests_per_second(1_000, 0.80), 200)

test("50000 QPS, 99% hit rate -> 500 to DB",
  db_requests_per_second(50_000, 0.99), 500)

# -----------------------------------------------------------------------------
# Exercise 4
# Is caching justified?
# A single DB server handles 1000 complex reads/second.
# Return :justified or :not_justified
#
# Caching is justified when DB requests WITHOUT cache would exceed DB capacity.
# Not justified when DB can handle the load alone.
# -----------------------------------------------------------------------------
DB_CAPACITY = 1000  # reads/sec

def caching_justified?(total_qps, expected_hit_rate)
  raise NotImplementedError, "TODO"
end

test("2000 QPS, 90% cache hit -> 200 DB req -> not justified (under capacity)",
  caching_justified?(2_000, 0.90), :not_justified)

test("2000 QPS, 0% cache hit -> 2000 DB req -> justified (over capacity)",
  caching_justified?(2_000, 0.0), :justified)

test("10000 QPS, 95% cache hit -> 500 DB req -> not justified",
  caching_justified?(10_000, 0.95), :not_justified)

test("10000 QPS, 80% cache hit -> 2000 DB req -> justified",
  caching_justified?(10_000, 0.80), :justified)

test("500 QPS, 0% cache hit -> 500 DB req -> not justified (under capacity)",
  caching_justified?(500, 0.0), :not_justified)
