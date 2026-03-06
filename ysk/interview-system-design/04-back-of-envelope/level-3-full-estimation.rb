# =============================================================================
# Level 3: Full System Estimation
# =============================================================================
# Before running: ruby level-3-full-estimation.rb
# Goal: given a system prompt, produce a complete estimation that drives
#       multiple architecture decisions simultaneously.
#
# A full estimation covers:
#   1. Write QPS (avg + peak)
#   2. Read QPS (avg + peak)
#   3. Daily storage
#   4. Annual storage
#   5. App server count (for write path)
#   6. Whether caching is required
#   7. Cache hit rate needed (if caching required)
#
# This is the complete back-of-envelope exercise for a real interview prompt.

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
# Full estimation from a scenario.
# Returns a hash with all the numbers an interviewer expects to see.
#
# Parameters:
#   daily_writes:      number of write events per day
#   bytes_per_write:   storage per write event in bytes
#   read_write_ratio:  how many reads per write (e.g., 10 = 10:1)
#
# Returns:
#   {
#     avg_write_qps:     Float,
#     peak_write_qps:    Float,
#     avg_read_qps:      Float,
#     peak_read_qps:     Float,
#     daily_storage_gb:  Float,
#     annual_storage_tb: Float,
#   }
# -----------------------------------------------------------------------------
def full_estimate(daily_writes:, bytes_per_write:, read_write_ratio:)
  raise NotImplementedError, "TODO"
end

# Twitter-like: 100M tweets/day, 500 bytes each, 10:1 read:write
result = full_estimate(
  daily_writes:     100_000_000,
  bytes_per_write:  500,
  read_write_ratio: 10
)
test("twitter: avg write QPS",       result[:avg_write_qps],    1_000.0)
test("twitter: peak write QPS",      result[:peak_write_qps],   3_000.0)
test("twitter: avg read QPS",        result[:avg_read_qps],    10_000.0)
test("twitter: peak read QPS",       result[:peak_read_qps],   30_000.0)
test("twitter: daily storage GB",    result[:daily_storage_gb],    50.0)
test("twitter: annual storage TB",   result[:annual_storage_tb],  18.25)

# Chat app: 10M messages/day, 200 bytes each, 2:1 read:write
result2 = full_estimate(
  daily_writes:     10_000_000,
  bytes_per_write:  200,
  read_write_ratio: 2
)
test("chat: avg write QPS",      result2[:avg_write_qps],   100.0)
test("chat: peak write QPS",     result2[:peak_write_qps],  300.0)
test("chat: avg read QPS",       result2[:avg_read_qps],    200.0)
test("chat: peak read QPS",      result2[:peak_read_qps],   600.0)
test("chat: daily storage GB",   result2[:daily_storage_gb],  2.0)
test("chat: annual storage TB",  result2[:annual_storage_tb], 0.73)

# -----------------------------------------------------------------------------
# Exercise 2
# Infrastructure decision summary.
# Given an estimation result, return the infrastructure decisions as a hash:
#
#   {
#     app_servers_needed:     Integer,   # for write path, DB-heavy, with 30% headroom
#     cache_required:         Boolean,
#     cache_hit_rate_needed:  Float,     # 0.0 if cache not required
#     storage_tier_strategy:  Symbol,    # :single_tier if annual < 1TB, :multi_tier if >= 1TB
#   }
#
# Constants (same as level 2):
#   Rails DB-heavy capacity: 300 req/sec
#   Postgres complex reads:  1000 qry/sec
#   Headroom factor:         0.7
# -----------------------------------------------------------------------------
RAILS_CAPACITY  = 300
POSTGRES_READS  = 1_000
HEADROOM        = 0.7

def infrastructure_decisions(estimation)
  raise NotImplementedError, "TODO"
end

# Twitter scenario
twitter = full_estimate(
  daily_writes: 100_000_000, bytes_per_write: 500, read_write_ratio: 10
)
tw_infra = infrastructure_decisions(twitter)

test("twitter: app servers for write path",
  tw_infra[:app_servers_needed],    15)

test("twitter: cache required (30k peak read QPS far exceeds 1k DB capacity)",
  tw_infra[:cache_required],        true)

test("twitter: cache hit rate needed",
  tw_infra[:cache_hit_rate_needed], 0.9667)

test("twitter: multi-tier storage (18.25 TB/year >= 1 TB)",
  tw_infra[:storage_tier_strategy], :multi_tier)

# Chat scenario
chat = full_estimate(
  daily_writes: 10_000_000, bytes_per_write: 200, read_write_ratio: 2
)
chat_infra = infrastructure_decisions(chat)

test("chat: app servers for write path (300 peak QPS, 2 servers with headroom)",
  chat_infra[:app_servers_needed],    2)

test("chat: no cache required (600 peak read QPS < 1000 DB capacity)",
  chat_infra[:cache_required],        false)

test("chat: no cache needed, hit rate 0.0",
  chat_infra[:cache_hit_rate_needed], 0.0)

test("chat: single-tier storage (0.73 TB/year < 1 TB)",
  chat_infra[:storage_tier_strategy], :single_tier)
