# 12 · Tinder

> **Difficulty**: Medium
> **Introduces**: GeoHash, precomputed recommendation queue, match mechanics
> **Builds on**: [06 · Local Delivery](../easy/06-local-delivery.md) — geo basics; [10 · FB News Feed](10-fb-news-feed.md) — precomputed feed

---

## How I Should Think About This

Tinder is fundamentally a **geo-filtered recommendation system with a real-time match notification**. When you open the app, you see a stack of potential matches nearby. That stack isn't computed live — it's **precomputed**. Computing "show me all users within 50km, filtered by age and gender, ranked by compatibility" on every swipe is too slow. Instead, a background job continuously pre-generates a "swipe queue" for each user, fills it with candidates, and you swipe from that precomputed list. This is the same fan-out-on-write insight from the News Feed (Q10): compute at write time, serve instantly at read time.

The interesting new concept is **GeoHash** — a way to encode lat/lng coordinates into a short string (`dr5ru` = midtown Manhattan). Locations that are geographically close share a common GeoHash prefix. This means you can find "all users in the same area" with a simple string prefix query (`WHERE geohash LIKE 'dr5ru%'`) instead of expensive trigonometric distance calculations. When a user updates their location, you update their GeoHash string. To find nearby users, you check their GeoHash cell and the 8 surrounding cells (to handle users near a cell border). This is the foundational geo-indexing pattern that Yelp, Uber, and Google Maps all build upon.

---

## Whiteboard Diagram

```mermaid
graph TB
    User["User opens app"]
    SwipeQ["Swipe Queue Service\nRedis: user:{id}:queue → [candidateId, ...]"]
    RecGen["Recommendation Generator\n(background job)\nruns periodically or on queue drain"]
    GeoDB["Location Index\nRedis GEOADD or GeoHash-indexed DB\nuserId → geohash"]
    ProfileDB[("Profile DB\nuserId, age, gender\npreferences, photos\ngeohash")]
    MatchSvc["Match Service\n(handles swipe right + mutual check)"]
    MatchDB[("Matches DB\nuser_a, user_b, matched_at)]
    Notif["Push Notification\n'You have a new match!'"]

    User -->|"GET /swipe-queue"| SwipeQ
    SwipeQ -->|"queue low → trigger"| RecGen
    RecGen -->|"GEORADIUS 50km"| GeoDB
    GeoDB -->|"candidate userIds"| RecGen
    RecGen -->|"filter by age/gender prefs"| ProfileDB
    RecGen -->|"fill queue"| SwipeQ

    User -->|"POST /swipe { targetId, direction }"| MatchSvc
    MatchSvc -->|"check if target liked user back"| MatchDB
    MatchSvc -->|"mutual like → create match"| MatchDB
    MatchSvc -->|"notify both users"| Notif

    style SwipeQ fill:#FFD700
    style RecGen fill:#90EE90
    style GeoDB fill:#e1f5ff
```

---

## Key Decisions

**1. GeoHash for proximity queries**

GeoHash encodes the world into a grid of cells. Adjacent cells share longer common prefixes.

```
Eiffel Tower:    u09tvw (precision 6 = ~1.2km² cell)
Nearby cafe:     u09tvw (same cell)
Across Paris:    u09tvy (different cell, nearby prefix)

Query: find all users near me
  → WHERE geohash LIKE 'u09tv%'   (search the cell + neighbors)

Add a GeoHash index to your users table:
  CREATE INDEX idx_geohash ON users(geohash);
  → B-tree prefix query is O(log N) — fast
```

Why not just use `lat/lng + Haversine formula`?
- Haversine requires scanning every row to compute distance → O(N)
- GeoHash prefix query uses an index → O(log N)

**2. Precomputed swipe queue vs live query**

```
Live query on every swipe:
  SELECT * FROM users
  WHERE geohash like 'u09tv%'
  AND age BETWEEN 25 AND 35
  AND gender = 'F'
  AND NOT already_swiped
  ORDER BY compatibility DESC
  LIMIT 1
  → Complex query with multiple filters, runs 100M times/day → too slow

Precomputed queue (correct approach):
  → Background job runs every few minutes per user
  → Fetches 50 candidates, filters, ranks
  → Stores [candidateId, ...] in Redis for instant serving
  → Refill when queue drops below 10 cards
```

**3. Match detection**

When Alice swipes right on Bob:
1. Store `likes:{aliceId}:{bobId}` in Redis (fast check)
2. Check if `likes:{bobId}:{aliceId}` exists
3. If yes: create match record, notify both via push notification + WebSocket

```
Redis:
  SADD likes:{aliceId} bobId
  SISMEMBER likes:{bobId} aliceId  → True = match!
```

Store the full match in the DB for persistence; use Redis for the fast mutual-check.

---

## Capacity Estimation

```
Users:            50M DAU
Swipes/day:       50M × 50 swipes = 2.5B swipes/day → 29K/sec
Location updates: 50M × 1 update on open = 50M/day → 600/sec (trivial)

Swipe queue memory:
  50M users × 50 candidates × 8 bytes = 20 GB → Redis cluster

GeoHash queries (background job):
  50M queue refreshes/day → 600/sec → parallelized worker pool
```

---

## Concepts Introduced

- **GeoHash** — encoding lat/lng as a string prefix for O(log N) proximity queries. The geo-indexing primitive used in Yelp (Q13), Uber (Q23). Alternative: QuadTree (recursive spatial partitioning — same idea, tree form).
- **Precomputed recommendation queue** — generate candidates in the background, serve instantly at read time. The same principle as the news feed precomputation in Q10.
- **Redis SADD/SISMEMBER for mutual-like detection** — O(1) set membership check. Fast, ephemeral, perfect for "did both parties do X."
- **Background job triggering on queue drain** — refill when supply drops below threshold. Pattern reappears in: any precomputed suggestion/recommendation system.

---

## What to Study Next

➜ **[13 · Yelp](13-yelp.md)** — extends geo search with full-text search for business names and review aggregation. The first question combining two different types of search (geo + text) in one system.
