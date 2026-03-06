# Caching Concepts: Patterns, TTL, Invalidation, and Failure Modes

> **Goal**: Choose the right cache pattern for each use case, set defensible TTLs, design invalidation strategies, and handle the hard cases — stampede and eviction — without the system falling over.
>
> **Companion exercises**: `level-1-cache-patterns.rb`, `level-2-ttl-and-invalidation.rb`, `level-3-stampede-prevention.rb`

---

## 1. Overview

Caching is the highest-leverage performance tool in distributed systems. A Redis node handles ~100,000 requests/second. A PostgreSQL primary with complex queries handles ~1,000/second. If your system needs 10,000 reads/second, the math is clear: cache or pay for a fleet of database replicas.

But caching introduces its own complexity. Stale data. Cache invalidation. The thundering herd. Eviction under memory pressure. These are not edge cases — they're the normal operating conditions of any high-traffic system. This module builds the vocabulary and decision framework to handle all of them.

---

## 2. Core Concept & Mental Model

### The Library Desk Analogy

Imagine a librarian (your app) who fetches books (data) from a warehouse (your database) far away. Trips to the warehouse are slow and expensive.

**Cache-aside**: The librarian keeps a local shelf. When asked for a book, they check the shelf first. If it's there, they hand it over immediately. If not, they go to the warehouse, bring it back, put it on the shelf, and hand it over. Next time: instant.

**Write-through**: Whenever the librarian updates a book, they update *both* the shelf copy AND the warehouse simultaneously before confirming the update is done. The shelf is always in sync. Every write is slower, but reads are always fast.

**Write-behind**: The librarian updates the shelf immediately and tells you it's done. The warehouse update happens later, in the background. Very fast updates. But if the shelf burns down before the warehouse is updated — that information is gone.

---

## 3. Building Blocks — Progressive Learning

### Level 1: The Three Cache Patterns

**Why this level matters**

Naming a cache pattern is table stakes. Explaining *why* it's the right pattern for a given scenario — and what breaks if you pick the wrong one — is what interviewers are testing.

**Cache-aside (lazy loading)**

```
Flow:
  1. Request comes in.
  2. App checks cache (Redis key "user:42").
  3. Cache HIT  -> return immediately. No DB call.
  4. Cache MISS -> fetch from DB, write to cache with TTL, return to user.

Pseudocode:
  def get_user(id)
    cached = redis.get("user:#{id}")
    return JSON.parse(cached) if cached

    user = User.find(id)        # DB call only on miss
    redis.setex("user:#{id}", 300, user.to_json)  # cache for 5 min
    user
  end

Pros:
  - Cache only holds data that's actually been requested (no wasted memory)
  - Database failures don't corrupt the cache
  - Simple to implement

Cons:
  - First request after expiry is slow (cache miss + DB call)
  - Cache can serve stale data if DB is updated externally (not through this app)

Use when: general-purpose read caching. User profiles, posts, product data.
          Any data with a clear, acceptable staleness window.
```

**Write-through**

```
Flow:
  1. App writes new data.
  2. Write to CACHE and DB simultaneously (or cache first, then DB).
  3. Both are updated before confirming success.

Pseudocode:
  def update_user(id, attributes)
    user = User.find(id)
    user.update!(attributes)             # DB write
    redis.setex("user:#{id}", 300, user.to_json)  # cache write
    user
  end

Pros:
  - Cache is always warm. Reads never miss after first write.
  - No stale data from application writes.

Cons:
  - Write latency doubles (must wait for both cache and DB).
  - Cache fills with data that may never be read (write-heavy, low-read paths waste memory).

Use when: data that is written and then immediately re-read.
          Financial dashboards, settings that must reflect immediately after save.
```

**Write-behind (write-back)**

```
Flow:
  1. App writes to CACHE only.
  2. Confirms success to the user immediately.
  3. Background process asynchronously flushes to DB.

Pros:
  - Writes are extremely fast (only cache write in the hot path).
  - Batching: DB gets bulk writes instead of one-at-a-time.

Cons:
  - DATA LOSS RISK: if cache crashes before flush, writes are gone.
  - Complexity: requires a reliable flush mechanism and crash recovery.
  - DB may be significantly stale.

Use when: high-write workloads with acceptable data loss window.
          View counters, like counts, leaderboard scores, analytics event counts.
          NEVER use for financial transactions or inventory.
```

> **Mental anchor**: "Cache-aside for general reads. Write-through when you can't afford a cache miss after a write. Write-behind when you can afford to lose a few writes (counters, analytics). Match the pattern to the acceptable failure mode."

---

**-> Bridge to Level 2**: You know which pattern to use. The next question is: how long should the cache entry live, and what happens when the underlying data changes before it expires?

### Level 2: TTL and Cache Invalidation

**Why this level matters**

TTL is not a magic number you guess. It's a decision with direct trade-offs: too short and you're hitting the database constantly; too long and users see stale data for an unacceptable window. "How do you choose TTL?" is a real interview question.

**Choosing TTL: the two-variable formula**

```
TTL = f(how_stale_is_acceptable, how_expensive_is_a_miss)

Case 1: Stale is bad AND miss is cheap -> Short TTL
  Example: product price. Stale price = lost revenue.
  TTL: 30-60 seconds.

Case 2: Stale is fine AND miss is expensive -> Long TTL
  Example: a complex aggregated report. Stale by 1 hour is OK.
  TTL: 1-24 hours.

Case 3: Stale is fine AND miss is cheap -> Medium TTL
  Example: user profile photo. Stale by 5 minutes is harmless.
  TTL: 5-15 minutes.

Case 4: Stale is never OK -> No TTL, event-based invalidation only
  Example: auth token. Must always reflect current state.
  TTL: none (or very short). Invalidate immediately on logout/revoke.
```

**Reference TTLs — say these in interviews**

```
Static assets (CSS, images):  24 hours to 1 year  (invalidate on deploy via content hash)
Public page HTML:              5-60 minutes        (invalidate on content change)
User profile data:             5 minutes
Product prices:                30-60 seconds
Session tokens:                15-30 minutes (match auth timeout)
Rate limit counters:           60 seconds (sliding or fixed window)
Search autocomplete results:   10-15 minutes
Homepage feed:                 30 seconds to 2 minutes
```

**Cache invalidation strategies**

```
TTL expiry (passive invalidation):
  Cache entry expires on schedule. No code needed.
  Pro: simple. Con: data is stale for the full TTL window.
  Use: any data where the TTL window matches acceptable staleness.

Event-based invalidation (active invalidation):
  When data changes, explicitly delete the cache key.
  cache.del("user:#{user.id}") after user.update(...)
  Pro: freshness is guaranteed. Con: requires coupling write and cache operations.
  Use: anything where you control the write path (your own app).

Cache-busting on deploy:
  Add a version or hash to the key: "user:#{user.id}:v2"
  Old keys are simply never read again; they expire via TTL.
  Pro: zero-downtime cache version transitions. Con: old keys waste memory briefly.
  Use: schema changes, feature rollouts that change cache shape.

Write-through invalidation:
  On write, update cache immediately rather than deleting.
  Pro: no cold miss after invalidation. Con: cache update must be atomic with DB write.
  Use: high-read data where you can't afford even a brief miss window.
```

> **Mental anchor**: "TTL = how stale is OK * how expensive is a miss. Explicit delete on write for data you control. No TTL + event invalidation for auth/security data. Version the key for deploy-time changes."

---

**-> Bridge to Level 3**: TTL creates a ticking clock. When it expires on a high-traffic key, every concurrent request sees a cache miss simultaneously. That's the stampede.

### Level 3: Cache Stampede, Eviction, and Where to Cache

**Why this level matters**

The stampede is one of the most dangerous failure modes in distributed systems. It is especially dangerous on popular or viral content — exactly the data with the highest traffic. If you design a caching layer without addressing stampede, you've built a system that fails when you need it most.

**The cache stampede (thundering herd)**

```
Scenario:
  - A highly-trafficked cache key (homepage feed) has TTL of 60 seconds.
  - 50,000 requests/second hit this key.
  - At second 60, the key expires.
  - All 50,000 in-flight requests simultaneously see a cache miss.
  - All 50,000 fire a database query.
  - Database handles ~1,000 complex queries/second.
  - Database is overwhelmed by 50,000 identical queries.
  - Database falls over. Site is down.

This is NOT a theoretical edge case. It happens on:
  - Traffic spikes to viral content (all cached at similar times)
  - Deployment cache flushes (all keys deleted at once)
  - Marketing campaigns that drive synchronized traffic
```

**Fix 1: Mutex lock (correct, simple)**

```ruby
def get_homepage_feed(user_id)
  key = "feed:#{user_id}"
  cached = redis.get(key)
  return JSON.parse(cached) if cached

  # Only one request should regenerate. Others wait.
  lock_key = "lock:#{key}"
  if redis.set(lock_key, "1", nx: true, ex: 5)  # nx: only if not exists
    begin
      feed = compute_feed(user_id)  # expensive DB computation
      redis.setex(key, 60, feed.to_json)
      feed
    ensure
      redis.del(lock_key)
    end
  else
    # Another process is computing. Wait briefly, then retry.
    sleep(0.05)
    get_homepage_feed(user_id)  # recursive retry
  end
end

Pro:  prevents the thundering herd. Simple logic.
Con:  waiting requests are blocked. Under very high load, backpressure builds.
Use:  moderately-trafficked keys where a brief wait is acceptable.
```

**Fix 2: Stale-while-revalidate (best for high traffic)**

```ruby
def get_with_stale_revalidate(key, ttl, stale_window)
  cached = redis.get(key)
  if cached
    data = JSON.parse(cached)
    remaining_ttl = redis.ttl(key)

    # If entering the stale window, trigger background refresh
    if remaining_ttl < stale_window
      # Kick off async recompute WITHOUT blocking this request
      BackgroundRefreshJob.perform_later(key, ttl)
    end

    return data  # serve the (possibly slightly stale) cached value
  end

  # True cold miss: compute synchronously
  data = expensive_compute(key)
  redis.setex(key, ttl, data.to_json)
  data
end

# Usage: TTL of 60s, start background refresh when 10s remain
get_with_stale_revalidate("homepage", 60, 10)

Pro:  users never wait. Cache is always warm. DB gets one refresh query at a time.
Con:  data is served slightly stale during the refresh window.
Use:  very high traffic keys where any blocking is unacceptable (homepages, feeds).
```

**Fix 3: Probabilistic early expiry**

```ruby
def get_with_early_expiry(key, ttl, beta = 1.0)
  cached = redis.get(key)
  if cached
    data, expiry = JSON.parse(cached)
    # Probabilistically decide to recompute before actual expiry
    # Higher beta = more aggressive early refresh
    if Time.now.to_f - beta * Math.log(rand) > expiry
      data = recompute_and_cache(key, ttl)
    end
    return data
  end
  recompute_and_cache(key, ttl)
end

Pro:  no thundering herd. No locks. Smooth refresh distribution.
Con:  complex math, harder to reason about in production.
Use:  academic/theoretical interest; stale-while-revalidate is usually preferred.
```

**Eviction policies**

```
When the cache is full, what gets removed?

LRU (Least Recently Used):
  Evict the key that was accessed least recently.
  Good for: caches where recently-accessed data is likely to be re-accessed.
  Redis config: maxmemory-policy allkeys-lru
  Use: general-purpose caches, user sessions, object caches.

LFU (Least Frequently Used):
  Evict the key accessed fewest times over a period.
  Good for: caches where popular data should persist regardless of recency.
  Redis config: maxmemory-policy allkeys-lfu
  Use: content caches where viral/popular items should stay in cache.

TTL-based eviction (volatile-ttl):
  Evict the key with the shortest remaining TTL first.
  Good for: mixed TTL caches where short-lived keys should be prioritized for eviction.
  Redis config: maxmemory-policy volatile-ttl

No eviction (maxmemory-policy noeviction):
  Return errors when memory is full instead of evicting.
  Use: when all cached data is critical and eviction would be worse than an error.
       Rarely the right choice for application caches.
```

**Where to cache**

```
Layer              Technology              What to cache                       TTL
-----------------  ----------------------  ----------------------------------  ----------
CDN edge           Cloudfront, Fastly      Static assets, public HTML          Hours-days
Application cache  Redis, Memcached        User data, computed results         Seconds-min
Browser cache      Cache-Control headers   JS, CSS, images                     Days-months
DB query cache     Built into PG/MySQL     Repeated identical queries          Automatic

Decision rule:
  Is this data public and static?          -> CDN
  Is this user-specific or computed?       -> Application cache (Redis)
  Is this an asset with a content hash?    -> Browser cache with long TTL
  Is this a repeated identical SQL query?  -> DB cache handles it; don't duplicate
```

> **Mental anchor**: "Stampede = mutex or stale-while-revalidate. LRU for general caches, LFU for popularity-based. CDN for static/public. Redis for per-user/computed. Match the layer to the data's access pattern."

---

## 4. Decision Framework

```
Which cache pattern?
  Write-behind -> only if writes are high volume AND data loss is acceptable (counters)
  Write-through -> only if you cannot afford any miss after a write
  Cache-aside  -> default for everything else

What TTL?
  Financial / auth data  -> no TTL or < 30 seconds, invalidate on change
  User-facing content    -> 1-5 minutes
  Computed/aggregated    -> 5-60 minutes depending on compute cost
  Static/rarely-changed  -> hours to days

Stampede risk?
  Traffic > 1000 req/sec on any single key AND TTL expiry is possible -> YES, address it
  Fix: stale-while-revalidate for high-traffic keys; mutex for moderate traffic

Eviction policy?
  General app cache              -> LRU (allkeys-lru)
  Content popularity matters     -> LFU (allkeys-lfu)
  Mixed TTL, need predictability -> volatile-ttl
```

---

## 5. Common Gotchas

**1. Caching mutable joins**

Caching `Post.includes(:user)` results means updating the user's name requires invalidating every post they've ever written. Cache leaf objects (user, post individually), not joins.

**2. Cache key collisions**

If you use `redis.set("user", data)` for two different user shapes, the second overwrites the first. Always include the ID and a schema version: `user:#{id}:v2`.

**3. Not accounting for cache-warm time after deploy**

If you flush all caches on deploy, the first minutes of traffic after deploy hit the database cold. Use a gradual rollout or pre-warm critical keys during the deploy process.

**4. Using cache to hide database performance problems**

"Our page is slow, add caching" is not a solution — it's concealment. Understand *why* the query is slow. Caching buys time; it doesn't fix the root cause.

**5. Write-behind without a recovery mechanism**

If you use write-behind and your cache node crashes, data is lost. There must be a write-ahead log, a durable queue, or another recovery path for any write-behind architecture.

---

## 6. Practice Scenarios

- [ ] "Your product detail page is making 12 DB queries per request and the page is slow at 5,000 req/sec. Design a caching strategy." (Cache-aside, which queries to cache, TTL per type, stampede risk on product pages)
- [ ] "A user updates their display name. Fifteen minutes later they still see the old name in the header." (Cache invalidation bug — write-through wasn't used, TTL is too long, explicit delete was missing)
- [ ] "Design caching for a real-time stock price widget. The price changes every second." (Short TTL ~1s, stale-while-revalidate, or no cache at all — justify your choice)
- [ ] "Your Redis server is at 95% memory. LRU eviction is dropping session keys. Users are getting logged out." (Wrong eviction policy — volatile-lru should protect session keys, or separate Redis instance for sessions)
- [ ] "Design a caching layer for a news homepage that gets 200,000 requests/second during breaking news." (Stale-while-revalidate, CDN edge caching for anonymous users, short TTL, stampede prevention plan)

**Run the exercises**:
```
ruby level-1-cache-patterns.rb
ruby level-2-ttl-and-invalidation.rb
ruby level-3-stampede-prevention.rb
```
