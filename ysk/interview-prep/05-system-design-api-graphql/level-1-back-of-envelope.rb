# =============================================================================
# Level 1: Back-of-Envelope Calculations
# =============================================================================
# Before running: ruby level-1-back-of-envelope.rb
# Goal: practice converting "X million users" into concrete numbers
#       that drive architectural decisions.
#
# Key formula: QPS = daily_events / 100_000  (approximation for average)
# Peak = 3x average  (rule of thumb for traffic spikes)
# Storage = count * size_per_item

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
# Calculate average QPS given daily event count.
# Use 100,000 seconds/day as an approximation (actual: 86,400).
# This is a standard interviewing approximation — easier mental math.
#
# Example:
#   10M events/day -> 10_000_000 / 100_000 = 100 QPS average
# -----------------------------------------------------------------------------
def avg_qps(daily_events)
  raise NotImplementedError, "TODO"
end

test("10M events/day = 100 QPS",   avg_qps(10_000_000),  100.0)
test("100M events/day = 1000 QPS", avg_qps(100_000_000), 1000.0)
test("1M events/day = 10 QPS",     avg_qps(1_000_000),   10.0)
test("500M events/day = 5000 QPS", avg_qps(500_000_000), 5000.0)

# -----------------------------------------------------------------------------
# Exercise 2
# Calculate peak QPS using the 3x multiplier rule.
# Peak traffic (lunch hour, viral moment) is typically ~3x average.
# -----------------------------------------------------------------------------
def peak_qps(daily_events)
  raise NotImplementedError, "TODO"
end

test("10M events/day peak = 300 QPS",   peak_qps(10_000_000),  300.0)
test("100M events/day peak = 3000 QPS", peak_qps(100_000_000), 3000.0)

# -----------------------------------------------------------------------------
# Exercise 3
# Calculate daily storage requirement in the most readable unit.
# Return a hash: { value: Float, unit: :kb/:mb/:gb/:tb }
#
# 1KB = 1_000 bytes  (use 1000-based for rough estimates, not 1024)
# 1MB = 1_000_000 bytes
# 1GB = 1_000_000_000 bytes
# 1TB = 1_000_000_000_000 bytes
# -----------------------------------------------------------------------------
def daily_storage(count, bytes_per_item)
  raise NotImplementedError, "TODO"
end

# 100M tweets/day, 500 bytes each
test("100M tweets @ 500B = 50GB/day",
  daily_storage(100_000_000, 500), { value: 50.0, unit: :gb })

# 10M photo uploads/day, 300KB each
test("10M photos @ 300KB = 3TB/day",
  daily_storage(10_000_000, 300_000), { value: 3.0, unit: :tb })

# 1M messages/day, 200 bytes each
test("1M messages @ 200B = 200MB/day",
  daily_storage(1_000_000, 200), { value: 200.0, unit: :mb })

# -----------------------------------------------------------------------------
# Exercise 4
# Decide if caching is necessary based on QPS vs server capacity.
# A single Rails server handles ~300 DB-heavy requests/second.
# If peak QPS > servers * 300, you need caching or more servers.
#
# Return :needs_cache, :needs_more_servers, or :sufficient
# Simplify: if peak_qps > server_capacity * num_servers AND cacheable -> :needs_cache
#           if peak_qps > server_capacity * num_servers AND NOT cacheable -> :needs_more_servers
#           if peak_qps <= server_capacity * num_servers -> :sufficient
# -----------------------------------------------------------------------------
SERVER_CAPACITY = 300  # requests/sec for DB-heavy Rails app

def capacity_decision(peak_qps, num_servers, cacheable)
  raise NotImplementedError, "TODO"
end

test("300 QPS, 2 servers (600 capacity) -> sufficient",
  capacity_decision(300, 2, true), :sufficient)

test("1000 QPS, 2 servers (600 capacity), cacheable -> needs_cache",
  capacity_decision(1000, 2, true), :needs_cache)

test("1000 QPS, 2 servers, not cacheable -> needs_more_servers",
  capacity_decision(1000, 2, false), :needs_more_servers)

test("3000 QPS, 5 servers (1500 capacity), cacheable -> needs_cache",
  capacity_decision(3000, 5, true), :needs_cache)

# -----------------------------------------------------------------------------
# Exercise 5
# Full estimation: given a scenario, walk through the full calculation.
# Returns { avg_write_qps:, peak_write_qps:, avg_read_qps:, peak_read_qps:,
#           daily_storage_gb:, annual_storage_tb: }
# -----------------------------------------------------------------------------
def full_estimate(daily_writes:, bytes_per_write:, read_write_ratio:)
  raise NotImplementedError, "TODO"
end

# Twitter-like: 100M tweets/day, 500B each, 10:1 read:write
result = full_estimate(
  daily_writes: 100_000_000,
  bytes_per_write: 500,
  read_write_ratio: 10
)

test("twitter: avg write QPS",       result[:avg_write_qps],   1000.0)
test("twitter: peak write QPS",      result[:peak_write_qps],  3000.0)
test("twitter: avg read QPS",        result[:avg_read_qps],    10000.0)
test("twitter: peak read QPS",       result[:peak_read_qps],   30000.0)
test("twitter: daily storage 50GB",  result[:daily_storage_gb], 50.0)
test("twitter: annual storage",      result[:annual_storage_tb], 18.25)
