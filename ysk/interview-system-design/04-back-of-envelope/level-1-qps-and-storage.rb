# =============================================================================
# Level 1: QPS and Storage Calculations
# =============================================================================
# Before running: ruby level-1-qps-and-storage.rb
# Goal: convert daily event counts to QPS and compute storage requirements.
#       These are the raw calculations that drive every infrastructure decision.
#
# Formulas:
#   avg_qps  = daily_events / 100_000   (100K second approximation for 1 day)
#   peak_qps = avg_qps * 3              (3x spike multiplier)
#   storage  = count * bytes_per_item   (then normalize to KB/MB/GB/TB)
#
# Storage units (1000-based):
#   1 KB = 1_000 bytes
#   1 MB = 1_000_000 bytes
#   1 GB = 1_000_000_000 bytes
#   1 TB = 1_000_000_000_000 bytes

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
# Calculate average QPS from daily event count.
# Use 100,000 seconds as the approximation for 1 day.
# Return a Float.
# -----------------------------------------------------------------------------
def avg_qps(daily_events)
  raise NotImplementedError, "TODO"
end

test("10M events/day -> 100.0 QPS avg",   avg_qps(10_000_000),  100.0)
test("100M events/day -> 1000.0 QPS avg", avg_qps(100_000_000), 1000.0)
test("1M events/day -> 10.0 QPS avg",     avg_qps(1_000_000),   10.0)
test("500M events/day -> 5000.0 QPS avg", avg_qps(500_000_000), 5000.0)
test("50M events/day -> 500.0 QPS avg",   avg_qps(50_000_000),  500.0)

# -----------------------------------------------------------------------------
# Exercise 2
# Calculate peak QPS using the 3x multiplier.
# Return a Float.
# -----------------------------------------------------------------------------
def peak_qps(daily_events)
  raise NotImplementedError, "TODO"
end

test("10M events/day -> 300.0 peak QPS",    peak_qps(10_000_000),  300.0)
test("100M events/day -> 3000.0 peak QPS",  peak_qps(100_000_000), 3000.0)
test("1B events/day -> 30000.0 peak QPS",   peak_qps(1_000_000_000), 30_000.0)

# -----------------------------------------------------------------------------
# Exercise 3
# Calculate read QPS from write QPS given a read:write ratio.
# Return a Float.
# -----------------------------------------------------------------------------
def read_qps(write_qps, read_write_ratio)
  raise NotImplementedError, "TODO"
end

test("1000 writes/sec, 10:1 ratio -> 10000.0 reads/sec",
  read_qps(1_000, 10),  10_000.0)

test("500 writes/sec, 100:1 ratio -> 50000.0 reads/sec",
  read_qps(500, 100),   50_000.0)

test("3000 writes/sec, 2:1 ratio -> 6000.0 reads/sec",
  read_qps(3_000, 2),   6_000.0)

# -----------------------------------------------------------------------------
# Exercise 4
# Calculate daily storage and return in the most readable unit.
# Return a Hash: { value: Float, unit: :bytes/:kb/:mb/:gb/:tb/:pb }
#
# Choose the largest unit where value >= 1.
# Use exact 1000-based units.
# -----------------------------------------------------------------------------
def daily_storage(count, bytes_per_item)
  raise NotImplementedError, "TODO"
end

test("100M tweets @ 500B = 50.0 GB",
  daily_storage(100_000_000, 500),            { value: 50.0,  unit: :gb })

test("10M photos @ 300KB = 3.0 TB",
  daily_storage(10_000_000, 300_000),         { value: 3.0,   unit: :tb })

test("1M messages @ 200B = 200.0 MB",
  daily_storage(1_000_000, 200),              { value: 200.0, unit: :mb })

test("100K video minutes @ 60MB = 6.0 TB",
  daily_storage(100_000, 60_000_000),         { value: 6.0,   unit: :tb })

test("500 items @ 50KB = 25000.0 KB",
  daily_storage(500, 50_000),                 { value: 25.0,  unit: :mb })

# -----------------------------------------------------------------------------
# Exercise 5
# Calculate annual storage in TB given daily_storage_gb.
# Return a Float rounded to 2 decimal places.
# -----------------------------------------------------------------------------
def annual_storage_tb(daily_storage_gb)
  raise NotImplementedError, "TODO"
end

test("50 GB/day -> 18.25 TB/year",  annual_storage_tb(50.0),   18.25)
test("3000 GB/day -> 1095.0 TB/year", annual_storage_tb(3000.0), 1095.0)
test("100 GB/day -> 36.5 TB/year",  annual_storage_tb(100.0),  36.5)
