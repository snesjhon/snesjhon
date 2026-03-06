# Back-of-Envelope Calculations: Making Scale Concrete

> **Goal**: Convert vague scale requirements ("millions of users") into specific numbers that justify every infrastructure decision. Get the order of magnitude right — precision doesn't matter, correctness of the architectural decision does.
>
> **Companion exercises**: `level-1-qps-and-storage.rb`, `level-2-capacity-planning.rb`, `level-3-full-estimation.rb`

---

## 1. Overview

Back-of-envelope estimation is not arithmetic for its own sake. It is the step between "this sounds big" and "I know what this requires." Without estimation, you're guessing at whether you need one database or ten, whether you need a cache or not, whether you need a CDN or whether the existing setup handles it.

The goal is never an exact answer. The goal is to determine the correct *order of magnitude* — the difference between 100 req/sec (one server) and 100,000 req/sec (cache layer required, many servers).

---

## 2. Core Concept & Mental Model

### The GPS Analogy

A GPS that gives you an address within 10 meters is useful. A GPS that gives you an address within 1 kilometer is still useful — it gets you to the right neighborhood. A GPS that can only tell you "somewhere in North America" is useless.

Back-of-envelope is your 1-kilometer GPS. You don't need to know you'll have 3,847 req/sec. You need to know it's "a few thousand" — which tells you one database can handle it without a cache. Or "a few hundred thousand" — which tells you you need significant caching or sharding.

---

## 3. Building Blocks — Progressive Learning

### Level 1: The Reference Numbers — What to Memorize

**Why this level matters**

You cannot do back-of-envelope without a mental reference table. If you don't know that Redis handles ~100,000 req/sec and Postgres handles ~1,000 complex queries/sec, you can't say whether a cache is needed. Memorize these. They recur in every interview.

**Latency reference table**

```
Operation                                    Latency
--------------------------------------------  ---------
In-memory (variable access, cache hit)        < 1 ns
Redis GET (network round trip)                ~1 ms
SSD read, simple DB query (indexed)           ~10 ms
Complex DB query (joins, aggregation)         ~50-100 ms
Cross-datacenter round trip (same continent)  ~50-100 ms
Cross-region round trip                       ~150 ms
```

**Throughput reference table**

```
System                                         Throughput
----------------------------------------------  ----------------
Redis (single node, simple ops)                 ~100,000 req/sec
Single Rails app server (simple requests)       ~1,000 req/sec
Single Rails app server (DB-heavy requests)     ~100-300 req/sec
PostgreSQL (simple indexed queries)             ~10,000 qry/sec
PostgreSQL (complex joins, aggregations)        ~500-1,000 qry/sec
Kafka (single partition)                        ~100,000 msg/sec
SQS (per queue)                                 ~3,000 msg/sec
```

**Storage reference table**

```
Item                                    Size
--------------------------------------  ----------
Short text (tweet, comment)             ~500 bytes
Long text (blog post, description)      ~5 KB
Small image (thumbnail, avatar)         ~50 KB
Photo (compressed, mobile)              ~300 KB
1 minute of audio (128kbps MP3)         ~1 MB
1 minute of video (720p)                ~60 MB
1 minute of video (1080p)               ~130 MB
```

**Time reference table**

```
Period          Seconds         Easy approximation
--------------  --------------  --------------------
1 minute        60 seconds      60
1 hour          3,600 seconds   3,600
1 day           86,400 seconds  100,000  <- use this for QPS math
1 month         ~2.6M seconds   3M
1 year          ~31.5M seconds  30M
```

> **Mental anchor**: "Redis = 100K/sec. DB heavy = 300/sec. 1 day = 100K seconds. Tweet = 500 bytes. Photo = 300KB. Video/min = 60MB."

---

**-> Bridge to Level 2**: With reference numbers in hand, convert daily active users and event rates into requests per second — the unit that drives infrastructure decisions.

### Level 2: QPS and Storage Calculations

**Why this level matters**

"100 million daily active users" is meaningless until you convert it to requests per second. That conversion is what tells you whether you need 1 server or 1,000, whether caching is optional or mandatory.

**The QPS formula**

```
Average QPS = daily_events / 100_000

Why 100,000 not 86,400?
  86,400 seconds/day is accurate. But in an interview, you're doing mental math.
  100,000 is close enough and far easier to divide. Use it.

Peak QPS = average_QPS * 3
  Traffic is not flat. Lunch hour, viral events, marketing campaigns
  create spikes ~3x the average. Always size for peak, not average.

Example: Twitter
  100M tweets/day
  Average write QPS:  100M / 100K = 1,000 writes/sec
  Peak write QPS:     1,000 * 3   = 3,000 writes/sec
  Read QPS (10:1):    10,000 avg, 30,000 peak
```

**Read:write ratios**

```
Use these when the problem doesn't specify:
  Social media feed:      ~10:1  (10 reads per write)
  E-commerce catalog:     ~100:1 (read-heavy; products rarely change)
  Messaging app:          ~2:1   (writes are relatively high)
  Analytics dashboard:    ~1000:1 (writes are background events, reads are rare)
  Event logging:          ~1:100 (almost all writes, reads are rare queries)
```

**The storage formula**

```
Daily storage = event_count * bytes_per_event

Units (1000-based, not 1024):
  1 KB = 1,000 bytes
  1 MB = 1,000,000 bytes
  1 GB = 1,000,000,000 bytes
  1 TB = 1,000,000,000,000 bytes
  1 PB = 1,000,000,000,000,000 bytes

Example: Twitter text storage
  100M tweets/day * 500 bytes/tweet = 50,000,000,000 bytes/day = 50 GB/day
  Annual: 50 GB * 365 = 18,250 GB = ~18 TB/year

Example: photo storage
  10M uploads/day * 300 KB/photo = 3,000,000,000,000 bytes/day = 3 TB/day
  Annual: 3 TB * 365 = ~1 PB/year
```

**Saying it in an interview**

```
"Let me do a quick back-of-envelope.

 Assuming 100 million tweets per day, that's about 1,000 writes per second
 on average, and maybe 3,000 at peak using the 3x rule.

 Read QPS is 10x that for a feed — 10,000 average, 30,000 peak.

 For storage: 500 bytes per tweet puts us at 50 GB of text per day —
 manageable. But images are ~300 KB each, and if 10% of tweets have images,
 that's 3 TB per day. We're talking petabytes over time.

 This tells me: for reads at 30,000/sec, a single Postgres node (1,000 complex
 reads/sec) can't keep up. We need aggressive caching or a read replica fleet.
 For storage at petabyte scale, S3 not local disk.

 Let me design around these numbers..."
```

> **Mental anchor**: "QPS = events / 100K. Peak = 3x. Storage = count * size. Get order of magnitude right, then say 'let me design around these numbers.'"

---

**-> Bridge to Level 3**: You have the numbers. Now use them to make infrastructure decisions: how many servers, do I need caching, do I need sharding, do I need a CDN?

### Level 3: Capacity Planning — From Numbers to Infrastructure

**Why this level matters**

The calculation is not the point. The decision is the point. "We need 30,000 reads/sec" is only useful if it leads to: "That's 30x the capacity of one Postgres server, so I need either 30 read replicas or aggressive caching — and caching is far more cost-effective here."

**Server count estimation**

```
Formula:
  servers_needed = ceil(peak_qps / server_capacity)

Rails server capacity (DB-heavy requests):
  Single server: ~300 req/sec

Example: 3,000 peak QPS, Rails app, DB-heavy
  servers_needed = ceil(3,000 / 300) = 10 app servers minimum

Add ~30% headroom for safe operation:
  servers_needed_with_headroom = ceil(peak_qps / (server_capacity * 0.7))
  = ceil(3,000 / 210) = 15 servers
```

**Cache-or-scale decision**

```
Read QPS = 30,000/sec. Postgres handles 1,000 complex reads/sec.
Options:
  A) 30 read replicas
  B) Redis cache, 95% hit rate -> 1,500 reads/sec reach DB -> 2 replicas

Option A: expensive, complex replication lag, harder to maintain.
Option B: 1 Redis node (handles 100K/sec), 2 DB replicas. Simpler and cheaper.

The math makes the decision obvious. Do the math.

Cache effectiveness formula:
  cache_hit_rate_needed = 1 - (db_capacity / read_qps)

For db_capacity=1000, read_qps=30000:
  hit_rate_needed = 1 - (1000/30000) = 1 - 0.033 = 96.7%
  "We need a ~97% cache hit rate. For a feed of popular content, this is achievable."
```

**Storage tiering**

```
Hot storage (SSD, fast, expensive):
  Recently active data, frequently queried last 30-90 days.
  Keep in primary database. Size for 90-day retention.

Warm storage (S3, object store):
  Data accessed occasionally. Months to years old.
  Move here after 90 days. Cheap, still accessible.

Cold storage (S3 Glacier, tape equivalent):
  Compliance archival. Accessed maybe once.
  Move here after 1-2 years. Very cheap. Hours to retrieve.

Example: 50 GB/day text data
  Hot (90 days in DB):  50 GB * 90 = 4.5 TB  (provision this in RDS/Aurora)
  Warm (S3):            50 GB * 275 = ~14 TB  (rest of first year, cheap in S3)
  Cold (Glacier):       50 GB * 365 = 18 TB/year (after 1 year, archive)
```

**The capacity planning one-liner for interviews**

```
Pattern:
  "At [peak QPS], a single [component] handles [capacity].
   That's [ratio]x over capacity, so I need either [option A] or [option B].
   [Option B] is better because [cost/complexity/latency reason]."

Example:
  "At 30,000 reads/sec, a single Postgres instance handles 1,000 complex reads.
   That's 30x over capacity. I need either 30 read replicas or Redis caching.
   Redis is better here: one cache node handles 100K req/sec, costs a fraction
   of 30 replicas, and lets us achieve a 97% hit rate for this access pattern."
```

> **Mental anchor**: "servers = peak_qps / server_capacity. Cache hit rate needed = 1 - (db_capacity / read_qps). Storage: hot in DB (90 days), warm in S3, cold in Glacier."

---

## 4. Decision Framework

```
Peak QPS exceeds single DB?
  Yes -> cache (preferred) or read replicas
  cache_hit_rate_needed = 1 - (db_capacity / peak_qps)
  If achievable (> 90% for typical content) -> Redis cache
  If not achievable (real-time, non-cacheable) -> read replicas

Storage per year > 1 TB?
  Yes -> consider tiered storage. Don't put multi-year history in primary DB.
  Hot in DB. Warm in S3. Cold in Glacier.

App servers needed?
  peak_qps / 300 (DB-heavy) or peak_qps / 1000 (simple requests)
  Add 30% headroom. That's your fleet size.

Single node or distributed?
  < 10,000 QPS: single node + cache can handle it.
  > 10,000 QPS: need cache layer or horizontal scaling.
  > 100,000 QPS: need distributed architecture (sharding, partitioning).
```

---

## 5. Common Gotchas

**1. Designing for average QPS, not peak**

Average QPS is easy to serve. Your system falls over at peak. Always size for 3x average at minimum, and think about whether your system has known super-peaks (product launches, holidays, viral moments) that require even more headroom.

**2. Forgetting write QPS matters too**

Most candidates calculate read QPS and stop. Write QPS matters for: database write throughput, queue depth, cache invalidation storms, and synchronous writes holding up the request.

**3. Not converting storage to a concrete decision**

"We'll have 18 TB per year" is incomplete. The decision is: where does it live? 18 TB in PostgreSQL means expensive SSD storage. 18 TB in S3 costs pennies per GB per month. The number triggers the decision.

**4. Using 86,400 for QPS math**

86,400 is exact but annoying for mental math. Use 100,000. The difference is 15% — irrelevant for order-of-magnitude estimates.

---

## 6. Practice Scenarios

- [ ] "Design Instagram. 500M daily active users, each views 20 photos/day, uploads 0.1 photos/day." Calculate read QPS, write QPS, daily photo storage, annual storage. What does each number tell you?
- [ ] "A chat app has 10M daily messages. Each message is 200 bytes." What's the average write QPS? Peak? Daily storage? How many app servers for the write path?
- [ ] "Your API gets 5,000 peak requests/second, mostly DB-heavy. You have 10 app servers. Is this sufficient?" (10 * 300 = 3,000 capacity. No. Need ~17 servers or caching.)
- [ ] "You need 95% cache hit rate. Your DB handles 2,000 reads/sec. What read QPS can you support?" (Reverse the formula: read_qps = db_capacity / (1 - hit_rate) = 2000 / 0.05 = 40,000 req/sec)
- [ ] "Your system stores 100 GB/day. After 1 year, how much storage is that? What's the cost strategy?" (36.5 TB. Hot/warm/cold tiering discussion.)

**Run the exercises**:
```
ruby level-1-qps-and-storage.rb
ruby level-2-capacity-planning.rb
ruby level-3-full-estimation.rb
```
