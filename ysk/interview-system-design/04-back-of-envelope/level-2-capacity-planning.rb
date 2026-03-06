# =============================================================================
# Level 2: Capacity Planning — From QPS to Infrastructure Decisions
# =============================================================================
# Before running: ruby level-2-capacity-planning.rb
# Goal: use QPS numbers to make concrete decisions about server count,
#       cache necessity, read replica count, and storage tiering.
#
# Reference capacities:
#   Rails server (DB-heavy): 300 req/sec
#   Rails server (simple):   1000 req/sec
#   PostgreSQL (complex):    1000 qry/sec
#   Redis (single node):     100_000 req/sec

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

RAILS_DB_HEAVY_CAPACITY    = 300      # req/sec per server
RAILS_SIMPLE_CAPACITY      = 1_000    # req/sec per server
POSTGRES_COMPLEX_CAPACITY  = 1_000    # queries/sec
REDIS_CAPACITY             = 100_000  # req/sec

# -----------------------------------------------------------------------------
# Exercise 1
# How many app servers are needed?
# Add 30% headroom: effective capacity per server = server_capacity * 0.7
# Return an Integer (always round up).
# -----------------------------------------------------------------------------
def app_servers_needed(peak_qps, server_capacity)
  raise NotImplementedError, "TODO"
end

test("300 QPS, DB-heavy (cap 300) with headroom -> 2 servers",
  app_servers_needed(300, RAILS_DB_HEAVY_CAPACITY),   2)

test("900 QPS, DB-heavy (cap 300) with headroom -> 5 servers",
  app_servers_needed(900, RAILS_DB_HEAVY_CAPACITY),   5)

test("3000 QPS, DB-heavy (cap 300) with headroom -> 15 servers",
  app_servers_needed(3_000, RAILS_DB_HEAVY_CAPACITY), 15)

test("700 QPS, simple (cap 1000) with headroom -> 1 server",
  app_servers_needed(700, RAILS_SIMPLE_CAPACITY),     1)

test("5000 QPS, simple (cap 1000) with headroom -> 8 servers",
  app_servers_needed(5_000, RAILS_SIMPLE_CAPACITY),   8)

# -----------------------------------------------------------------------------
# Exercise 2
# Is a cache layer required?
# A single Postgres instance handles POSTGRES_COMPLEX_CAPACITY complex reads/sec.
# If peak read QPS exceeds this, you need either a cache or read replicas.
# Return :cache_required or :db_sufficient
#
# Rule: if peak_read_qps > POSTGRES_COMPLEX_CAPACITY -> :cache_required
# -----------------------------------------------------------------------------
def cache_required?(peak_read_qps)
  raise NotImplementedError, "TODO"
end

test("500 read QPS -> db_sufficient",
  cache_required?(500),    :db_sufficient)

test("1000 read QPS (exactly at limit) -> db_sufficient",
  cache_required?(1_000),  :db_sufficient)

test("1001 read QPS -> cache_required",
  cache_required?(1_001),  :cache_required)

test("30000 read QPS -> cache_required",
  cache_required?(30_000), :cache_required)

# -----------------------------------------------------------------------------
# Exercise 3
# What cache hit rate is needed to bring DB read load within capacity?
# Return a Float between 0.0 and 1.0, rounded to 4 decimal places.
#
# Formula: hit_rate_needed = 1 - (db_capacity / read_qps)
# If read_qps <= db_capacity, return 0.0 (no caching needed).
# -----------------------------------------------------------------------------
def cache_hit_rate_needed(read_qps, db_capacity)
  raise NotImplementedError, "TODO"
end

test("1000 QPS, 1000 DB capacity -> 0.0 (no cache needed)",
  cache_hit_rate_needed(1_000, 1_000),   0.0)

test("10000 QPS, 1000 DB capacity -> 0.9 (90% hit rate needed)",
  cache_hit_rate_needed(10_000, 1_000),  0.9)

test("30000 QPS, 1000 DB capacity -> 0.9667",
  cache_hit_rate_needed(30_000, 1_000),  0.9667)

test("5000 QPS, 1000 DB capacity -> 0.8",
  cache_hit_rate_needed(5_000, 1_000),   0.8)

test("20000 QPS, 2000 DB capacity -> 0.9",
  cache_hit_rate_needed(20_000, 2_000),  0.9)

# -----------------------------------------------------------------------------
# Exercise 4
# How many read replicas are needed to handle read QPS without caching?
# Each replica handles POSTGRES_COMPLEX_CAPACITY reads/sec.
# Add 30% headroom. Return an Integer.
# -----------------------------------------------------------------------------
def read_replicas_needed(peak_read_qps)
  raise NotImplementedError, "TODO"
end

test("500 read QPS -> 1 replica (primary handles it with headroom)",
  read_replicas_needed(500),    1)

test("3000 read QPS -> 5 replicas",
  read_replicas_needed(3_000),  5)

test("10000 read QPS -> 15 replicas",
  read_replicas_needed(10_000), 15)

test("30000 read QPS -> 43 replicas (expensive; cache instead)",
  read_replicas_needed(30_000), 43)

# -----------------------------------------------------------------------------
# Exercise 5
# Storage tier decision.
# Given data age in days, which storage tier should it be in?
# Return :hot, :warm, or :cold
#
# Hot  (0-90 days):    in primary database (SSD, fast, expensive)
# Warm (91-365 days):  in object storage like S3 (cheap, still accessible)
# Cold (> 365 days):   in archive storage like Glacier (very cheap, slow retrieval)
# -----------------------------------------------------------------------------
def storage_tier(age_days)
  raise NotImplementedError, "TODO"
end

test("0 days old -> hot",    storage_tier(0),   :hot)
test("45 days old -> hot",   storage_tier(45),  :hot)
test("90 days old -> hot",   storage_tier(90),  :hot)
test("91 days old -> warm",  storage_tier(91),  :warm)
test("180 days old -> warm", storage_tier(180), :warm)
test("365 days old -> warm", storage_tier(365), :warm)
test("366 days old -> cold", storage_tier(366), :cold)
test("730 days old -> cold", storage_tier(730), :cold)
