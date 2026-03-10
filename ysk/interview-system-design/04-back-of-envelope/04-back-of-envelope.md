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

Every infrastructure decision reduces to one question: *can this component handle the load?* To answer that, you need a mental map of what each system can handle. Without it, "we need a cache" is a guess. With it, it's a calculation. The numbers below recur in every interview — but a number without context is just noise. Understand what each system *is* first, then the numbers stick.

**The four building blocks of almost every system design**

Every system design is some combination of these: an app server handling requests, a database storing data, a cache making reads fast, and an async layer decoupling work. Know the role of each, and you know when your back-of-envelope numbers are telling you to add one.

---

**App server (Rails) — ~1,000 req/sec (simple) / ~100–300 req/sec (DB-heavy)**

**What it is:** The layer that runs your application code. It receives an HTTP request, executes business logic, calls the database, and returns a response. Nothing is stored here — it is stateless by design.

**What it's used for:**
- Handling every user-facing HTTP request — API calls, page loads, form submissions
- Orchestrating work: calling the DB, calling Redis, calling downstream services, assembling the response

**Why the range:** "Simple requests" return quickly because they hit a cache or do minimal work. "DB-heavy requests" block while waiting on Postgres — the server sits idle during that wait. That idle time is why throughput collapses from 1,000 to 100–300: it is not doing ten things at once, it is doing one thing and waiting.

**Mental model:** One app server is one worker. When load exceeds its capacity, you add more servers horizontally behind a load balancer. The DB-heavy number is usually your real ceiling — most production requests touch the database.

---

**Database (PostgreSQL) — ~10,000 qry/sec (simple) / ~500–1,000 qry/sec (complex)**

**What it is:** The source of truth. Persists data to disk, manages transactions, enforces constraints, and answers queries using indexes or full table scans.

**What it's used for:**
- Storing and retrieving anything that must survive a server restart
- Enforcing data integrity — foreign keys, uniqueness, transactions
- Answering structured queries with filters, joins, and aggregations

**Why the range:** A simple indexed query (`SELECT * FROM users WHERE id = 123`) hits a B-tree index and returns in microseconds — Postgres handles ~10K of these per second. A complex query (joins across multiple tables, aggregations over millions of rows) scans and sorts large amounts of data, taking 50–100ms each — so you only get 500–1,000 per second.

Simple lookups are also easy to cache: the cache key is predictable (`user:123`), the result is stable until that row changes, and hit rates are high. Complex analytical queries are hard to cache for the opposite reason — the inputs vary so much (different date ranges, filters, groupings) that almost every query produces a unique cache key, hit rates are near zero, and the underlying data changes constantly. The slowness makes you *want* to cache them; the variability makes it impractical.

**Mental model:** Postgres is your workhorse but it has a ceiling. Once read QPS approaches that ceiling, you add a cache layer before you add read replicas — caching is cheaper and faster to implement.

---

**Cache (Redis) — ~100,000 req/sec**

**What it is:** An in-memory key-value store. A giant dictionary that lives entirely in RAM — no disk, no joins, no query planning.

**What it's used for:**
- **Caching** — store a DB query result so you don't re-run it on every request
- **Sessions** — "is this user logged in?" needs an answer in under 1ms on every request
- **Rate limiting** — increment a counter per user per minute; check if they've hit their limit
- **Leaderboards** — sorted sets by score, O(log n) updates and reads

**Why it's fast:** No disk I/O at all. Every operation is a direct memory lookup. Redis runs a single-threaded event loop — no lock contention. `GET`/`SET` are O(1). The ~1ms latency you see is almost entirely network round-trip, not computation. The CPU is barely involved.

**Mental model:** Redis is the fast lane *in front of* your database. It is never your source of truth — if the server restarts, the data may be gone, and that's fine. Use Redis when the question is "what is X right now?" and waiting 10ms for a DB round-trip is too slow.

---

**Async layer: Kafka vs. SQS**

Both Kafka and SQS sit between services and let them communicate without being directly coupled. A producer puts a message in; a consumer processes it later. That is where the similarity ends — they solve different problems, which is why their throughput numbers look so different.

**Kafka — ~100,000 msg/sec (per partition)**

**What it is:** A durable, append-only event log. Think of it as a file on disk that only ever grows — every event your system produces gets appended to the end, in order, forever (or until you configure it to expire). Nothing is ever overwritten or deleted mid-stream.

Three terms you need to know:
- **Producer** — your application code that writes to Kafka. When a user places an order, your order service has a line of code that constructs a JSON blob and sends it to Kafka. That code is the producer.
- **Message** — the JSON blob itself. It's just structured data describing what happened: `{ "event": "order_placed", "order_id": "ord_123", "user_id": "usr_456", "total": 49.99, "timestamp": "..." }`. That's it — a record of a thing that occurred.
- **Consumer** — any service that reads from Kafka. Your billing service, inventory service, and email service are all consumers. Each one reads the same message independently, at its own pace, and tracks its own position in the log (called an **offset**). If one consumer crashes, it just picks back up from where it left off when it restarts.

**The problem it solves:** Without Kafka, your order service has to directly call every other service that cares about an order — billing, inventory, email, analytics, fraud detection. If email is down, the order fails. If you add a new service next month, you have to edit the order service to call it. Every service is tightly coupled to every other.

With Kafka, the order service does one thing: write a message and move on. It has no idea who reads it or when. Billing reads it. Inventory reads it. Email reads it. Each independently. If email crashes and comes back an hour later, it just reads the message it missed — it's still in the log.

**What it's used for:**
- **Fan-out to multiple consumers** — one event, many independent readers, each at their own pace
- **Event sourcing** — instead of storing only current state (balance = $150), store every event that led to it ("deposited $200", "spent $50"). You can replay the full history to rebuild state at any point in time, or feed it to a new service added months later
- **Data pipelines** — stream events from your app into a data warehouse, analytics system, or search index without touching your production database
- **Async decoupling** — services announce what happened without knowing or caring who acts on it

**Why it's fast:** Kafka writes to disk but only ever *appends* — no seeking, no overwriting, just adding to the end. This is the cheapest possible disk operation. The OS page cache means recent reads usually never even touch disk. And producers don't wait for consumers to process anything — they write and move on immediately. Throughput scales linearly by adding partitions: 10 partitions × 100K = 1M msg/sec cluster-wide.

**Mental model:** Kafka is a public announcement board. Your order service pins a note — "order placed, here are the details." Anyone who cares walks up and reads it on their own schedule. The note stays on the board whether one person reads it or ten. Use Kafka when something happens and multiple systems need to know about it, or when you need to go back and re-read history.

**Why not just use Postgres?**

At small scale, you can — and many companies do. Tools like Good Job (Postgres-backed) and Sidekiq (Redis-backed) use your existing database as a simple job queue, and that works fine up to a few hundred events per second. Kafka becomes the right answer when any of these are true:

- **Polling load adds up** — every consumer has to ask Postgres "any new rows?" every few hundred milliseconds. With 5 services polling at 100ms intervals, that's 50 queries/sec just for checking, competing directly with your application traffic.
- **You have to track "who has seen what" yourself** — Kafka tracks each consumer's position automatically (the offset). With Postgres, you'd need to build and maintain that tracking logic yourself: a `service_offsets` table, queries like "give me all events with id > 4521 that billing hasn't processed yet." That's complex state management you own.
- **The events table grows forever** — delete processed rows and you lose replay; keep them all and you have billions of rows slowing down queries and running up storage costs on expensive SSD.
- **Event traffic competes with app traffic** — a spike in events eats into the same DB connections and I/O budget your user-facing app depends on. Kafka is a completely separate system — your event pipeline can be overwhelmed without touching your application database at all.

The decision:
```
Need fan-out to multiple independent consumers?
  No  → Postgres job queue (Good Job) or Redis queue (Sidekiq) is fine
  Yes → What's the event volume?
          < ~1,000/sec, < 3–4 consumers → Postgres works, with effort
          > ~1,000/sec, or need replay  → Kafka is the right tool
```

---

**SQS — ~3,000 msg/sec (per queue)**

**What it is:** A managed work queue. Think of it as a to-do list that lives in the cloud. One piece of code drops a task onto the list; a separate piece of code (a worker) picks it up, does the work, and checks it off. Once checked off, it's gone — deleted permanently.

Three terms you need to know:
- **Producer** — the code that adds a task to the queue. When a user uploads a photo, your app adds a message to SQS: `{ "job": "resize_image", "image_id": "img_789", "user_id": "usr_456" }`. The app doesn't resize the image itself — it just drops the task and moves on.
- **Message** — the task description. Same as Kafka — a JSON blob describing what needs to be done.
- **Worker** — a separate process (usually running on a background server) that polls SQS for new tasks. It picks one up, does the work (resizes the image, sends the email, charges the card), and tells SQS "done, delete it." Unlike Kafka consumers, only one worker processes each message — whoever claims it first.

**The problem it solves:** Some work takes too long to do inside a web request. Resizing an image might take 2 seconds — you can't make the user wait. So instead: accept the upload instantly, drop a task into SQS, return a response to the user. A worker picks it up in the background and does the slow work. The user experience is fast; the work still gets done.

SQS also absorbs traffic spikes. If 10,000 uploads arrive in one minute and your workers can only process 3,000/min, the extras sit in the queue and get processed over the next few minutes. Nothing is dropped, nothing crashes — the queue acts as a buffer.

**What it's used for:**
- **Background jobs** — "resize this image," "send this email," "charge this card" — any work that doesn't need to happen before your app responds to the user
- **Load leveling** — absorb traffic spikes so your workers process at a steady rate instead of getting overwhelmed
- **At-least-once delivery** — if a worker crashes mid-job, SQS automatically makes the message visible again so another worker retries it

**Why it's slower than Kafka:** SQS is built around reliability guarantees, not raw throughput. The moment a worker claims a message, SQS marks it "invisible" so no other worker double-processes it. If the worker crashes before finishing, SQS waits for a timeout and re-queues it. All that coordination — visibility timeouts, deduplication checks, polling overhead — adds cost per message. It trades throughput for operational simplicity: no servers to manage, no partitions to configure, just a queue that works.

**Mental model:** SQS is a ticket queue at a deli counter. You take a number (drop a task), a worker calls your number (claims the task), does the work, and the ticket is thrown away. No one else gets that ticket. No history. Use SQS when you need one worker to do one job reliably, and you'd rather not manage any infrastructure to make that happen.

---

**Kafka vs. SQS — side-by-side**

|                         | **Kafka**                   | **SQS**                                      |
| ----------------------- | --------------------------- | -------------------------------------------- |
| **Abstraction**         | Durable event log           | Work queue                                   |
| **Messages persist?**   | Yes (replayable)            | No (deleted after ack)                       |
| **Multiple consumers?** | Yes (all see all)           | No (one consumer per msg)                    |
| **Ordering?**           | Strict (per partition)      | Not guaranteed                               |
| **Throughput**          | ~100K/sec/partition         | ~3K/sec/queue                                |
| **When to pick**        | Fan-out, replay, durability | Managed, reliable background task processing |

---

**Reference tables** — now that you know what each system is, use these as a quick-recall cheat sheet.

**Latency**

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

**Throughput**

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

**Storage sizes**

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

**Time conversions**

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

**What is QPS?**

QPS stands for **Queries Per Second** (also called RPS — Requests Per Second). It is the single most important unit in system design estimation.

Think of QPS as the *heartbeat rate* of your system. A resting adult has ~60 beats per minute. A sprinting athlete hits 180. Your infrastructure is the heart — it has a maximum rate it can sustain. The moment requests per second exceed what your components can handle, you get failures, timeouts, and queuing.

```
QPS is the bridge between user behavior and infrastructure.

User behavior:       "100 million people use this every day"
                                    ↓  (back-of-envelope)
QPS:                 "~1,000 writes/sec, ~10,000 reads/sec at average"
                                    ↓  (reference table)
Infrastructure:      "One Postgres node handles 1,000 complex reads/sec.
                      We're 10x over — we need a cache layer."
```

Every number you calculate — servers needed, cache hit rate required, replica count — is derived from QPS. Get this number wrong and every downstream decision is wrong. Get it approximately right and everything else follows.

**Read QPS vs. Write QPS**: These are always separate.
- **Write QPS**: How fast new data arrives (inserts, updates). Drives DB write throughput and queue sizing.
- **Read QPS**: How fast data is fetched. Usually much higher than write QPS. Drives cache strategy and read replica count.

**The QPS formula**

```
Average QPS = daily_events / 100,000
Peak QPS    = average_QPS × 3
```

Those two lines are the whole formula. Everything below is the intuition for why they work, so you can apply them without second-guessing yourself.

**Step 1: Daily events → average QPS**

A day has 86,400 seconds. In an interview you round that to 100,000 — it's only 15% off, which is irrelevant for order-of-magnitude math, and it makes mental division dramatically easier.

```
100M events/day ÷ 100K seconds = 1,000 events/sec (average)
 10M events/day ÷ 100K seconds =   100 events/sec (average)
  1M events/day ÷ 100K seconds =    10 events/sec (average)
```

The pattern: drop 5 zeros. 100M → 1,000. 10M → 100. 1M → 10.

**Step 2: Average → peak (the 3x rule)**

Traffic is never flat across 24 hours. Think about your own behavior — you don't use apps equally at 3am and 7pm. A social app sees almost nothing at 3am and a surge during evening prime time. When you divide total daily events by 86,400 seconds, you're averaging that surge with those dead hours — which means the average seriously understates what your system faces during the busy period.

The 3x rule captures this: peak traffic is roughly 3x the 24-hour average. This is a widely observed pattern across consumer apps, not a magic number. Some systems spike harder — a viral tweet, a product launch, a holiday sale can hit 10x — but 3x is your baseline, and you size infrastructure for peak, not average. An average-sized system fails exactly when you need it most.

```
Average QPS = 1,000/sec
Peak QPS    = 1,000 × 3 = 3,000/sec   ← this is what your infrastructure must survive
```

**Step 3: Separate reads from writes**

Most systems handle far more reads than writes. A user posting a tweet (1 write) triggers dozens of feed refreshes (many reads). If the problem doesn't give you a ratio, use the read:write ratios below. Apply the ratio to your average write QPS to get read QPS, then multiply both by 3 for peak.

**Putting it together — worked example**

```
Problem: Twitter. 100M tweets posted per day.

1. Daily write events: 100M tweets/day
   Average write QPS: 100M / 100K = 1,000 writes/sec
   Peak write QPS:    1,000 × 3   = 3,000 writes/sec

2. Read:write ratio for social feed = 10:1
   Average read QPS:  1,000 × 10  = 10,000 reads/sec
   Peak read QPS:     10,000 × 3  = 30,000 reads/sec

3. What do these numbers tell you?
   Writes: 3,000/sec peak — a single Postgres node handles ~10K simple writes/sec.
           Writes alone won't overwhelm the DB.
   Reads:  30,000/sec peak — Postgres handles ~1,000 complex reads/sec.
           We're 30x over. We need aggressive caching or read replicas.
           → Redis cache with ~97% hit rate drops DB read load to ~900/sec. Feasible.
```

The numbers don't just describe the system — they force the infrastructure decision. 30,000 reads/sec is the reason you add Redis. Without the calculation, "we should add a cache" is a guess. With it, it's a requirement.

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
Daily storage = event_count × bytes_per_event
```

Two inputs. That's it. The first comes from the problem. The second you estimate from the size reference table. The output tells you *where the data lives* and *whether you need a CDN* — those are the decisions the number forces.

**How to intuit sizes before doing the math**

The size reference table gives you anchors, but you need to know *why* they're those sizes to apply them confidently to anything the interviewer throws at you:

- **~500 bytes** — pure text with metadata. A tweet is 280 characters (280 bytes) plus user_id, timestamp, id fields. ~500 bytes total. Any short user-generated text lives here.
- **~5 KB** — a longer document: a blog post, a product description, a JSON API response with nested data. Still text, just more of it.
- **~50 KB** — a thumbnail or avatar image. Small enough that your browser loads dozens of them on a page without you noticing.
- **~300 KB** — a compressed mobile photo. Your phone compresses a raw 12MP shot down to roughly this. The reference number for "user uploaded a photo."
- **~5 MB** — a PDF slide deck (text-heavy). Slides with mostly text and simple graphics. Image-heavy decks can be 20–50 MB, but 5 MB is a safe average for back-of-envelope.
- **~1 MB/min** — compressed audio (128kbps MP3). A 3-minute song ≈ 3 MB.
- **~60 MB/min** — 720p video. A 10-minute YouTube video ≈ 600 MB.

**The mental shortcut for unit conversion**

Use 1000-based units (not 1024 — close enough and far easier mentally):

```
bytes → KB:  ÷ 1,000     (drop 3 zeros)
KB → MB:     ÷ 1,000     (drop 3 zeros)
MB → GB:     ÷ 1,000     (drop 3 zeros)
GB → TB:     ÷ 1,000     (drop 3 zeros)
TB → PB:     ÷ 1,000     (drop 3 zeros)
```

When multiplying event counts by sizes, cancel zeros in your head:

```
100M events × 500 bytes
= 100,000,000 × 500
= 50,000,000,000 bytes
= 50 GB   (drop 9 zeros for GB, 50 remains)
```

**Worked example: Twitter — text-only**

```
100M tweets/day × 500 bytes/tweet
= 50,000,000,000 bytes/day
= 50 GB/day

Annual: 50 GB × 365 ≈ 18 TB/year
```

18 TB/year of text. What does this tell you?
- 18 TB in Postgres = expensive SSD storage. Feasible but you don't want years of history there.
- Decision: keep 90 days hot in Postgres (~4.5 TB), move older data to S3 (~$0.02/GB/month), archive after 2 years to S3 Glacier (~$0.004/GB/month).
- The files are tiny text blobs — no CDN needed. Postgres and S3 are enough.

**Worked example: Instagram — photos**

```
100M photo uploads/day × 300 KB/photo
= 30,000,000,000,000 bytes/day
= 30 TB/day

Annual: 30 TB × 365 ≈ 10 PB/year
```

10 petabytes/year. What does this tell you?
- Never touches Postgres. Photos go straight to S3 on upload — object storage is the only viable answer at this scale.
- 10 PB/year at $0.02/GB = ~$200M/year in raw S3 costs (this is why Instagram uses aggressive compression and tiered storage).
- Photos are large files served globally to users — CDN is mandatory. Without it you're streaming 300 KB files across continents for every view.

**Worked example: SlideShare — PDF decks**

```
1M deck uploads/day × 5 MB/deck
= 5,000,000,000,000 bytes/day
= 5 TB/day

Annual: 5 TB × 365 ≈ 1.8 PB/year
```

1.8 PB/year. What does this tell you?
- Same answer as photos: S3 from day one, never Postgres.
- But here the CDN case is even stronger — a 5 MB PDF is 17× larger than a photo. Serving it from a data center 150ms away is painful; serving from an edge node 5ms away is instant.
- Postgres only stores metadata: deck title, owner, view count, tags. The actual file is an S3 key.

**The storage decision tree**

```
Daily storage output     Where it lives
─────────────────────────────────────────────────────
< 1 GB/day               Postgres is fine for years
1–100 GB/day             Postgres for hot data (90 days),
                         S3 for the rest
> 100 GB/day             S3 from day one, Postgres for
                         metadata only
Any large files          CDN in front of S3
(photos, video, PDFs)    (file size matters, not just volume)
```

The number you calculate doesn't just tell you *how much* storage you need — it tells you *what kind* and *where it lives*. That's the decision the math is forcing.

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
