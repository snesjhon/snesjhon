# 15 · Strava

> **Difficulty**: Medium
> **Introduces**: time-series data, GPS activity storage, segment matching, per-segment leaderboards
> **Builds on**: [07 · Leaderboard](../easy/07-leaderboard.md) — Redis sorted sets; [06 · Local Delivery](../easy/06-local-delivery.md) — geo storage

---

## How I Should Think About This

Strava records your runs and rides as a sequence of GPS points over time — a **time-series**. Each activity is an ordered list of `(lat, lng, elevation, timestamp)` samples captured every second. This is different from static location data (like a restaurant in Yelp): the data is sequential, append-only, and the interesting queries are temporal ranges ("show me this run") rather than proximity queries ("what's near me"). Time-series data has its own storage patterns: you don't update records, you only append; queries are always by time range; and older data can be downsampled (you don't need per-second GPS detail for a run you did two years ago).

The uniquely interesting Strava feature is **segments**: user-defined stretches of road or trail (like "the climb up Alpe d'Huez") with a leaderboard of the fastest times. When you upload an activity, the backend must detect which segments your GPS track passes through and compute your time on each. This is a **GPS route matching** problem — comparing your polyline against thousands of known segment polylines. Doing this for every upload across millions of active users requires a spatial index to narrow down candidate segments by bounding box before doing the expensive geometric matching. The result feeds into per-segment Redis sorted sets — the leaderboard structure from Q07 applied at a much larger scale.

---

## Whiteboard Diagram

```mermaid
graph TB
    Athlete["Athlete\n(GPS device / app)"]
    UploadAPI["Activity Upload API"]
    ActivityDB[("Activity DB\nCassandra\nactivity_id, user_id\nstart_time, elapsed_sec\npolyline_encoded")]
    GPSStore[("GPS Point Store\nTimeseries DB or S3\n[{lat,lng,ele,ts}, ...]\ncompressed, append-only")]
    SegmentMatcher["Segment Matcher\n(async worker)\n1. Fetch user's GPS track\n2. Spatial lookup → candidate segments\n3. Check if track passes through segment\n4. Compute segment elapsed time"]
    SegmentDB[("Segment DB\nsegment_id, name\nbbox, polyline\ncreator_id)]
    SpatialIndex["Spatial Index\nQuadTree / GeoHash\nfor segment bounding boxes"]
    LeaderboardCache["Redis\nZSET: segment:{id}:leaderboard\nelapsed_ms → athleteId"]
    Feed["Activity Feed\n(social: who followed you just PR'd)"]

    Athlete -->|"POST /activities { gps_data }"| UploadAPI
    UploadAPI -->|"save metadata"| ActivityDB
    UploadAPI -->|"save GPS points"| GPSStore
    UploadAPI -->|"enqueue matching job"| SegmentMatcher

    SegmentMatcher -->|"spatial lookup"| SpatialIndex
    SpatialIndex -->|"candidate segment IDs"| SegmentMatcher
    SegmentMatcher --> SegmentDB
    SegmentMatcher -->|"ZADD elapsed_ms athleteId"| LeaderboardCache
    SegmentMatcher -->|"notify if PR"| Feed

    style LeaderboardCache fill:#FFD700
    style SegmentMatcher fill:#90EE90
    style GPSStore fill:#e1f5ff
```

---

## Key Decisions

**1. GPS point storage: time-series DB vs S3**

```
GPS stream for 1-hour ride: 3,600 points × 32 bytes = ~115 KB per activity

Options:
  ❌ Relational DB rows: millions of rows per activity, hard to query efficiently
  ✅ Blob in S3: compress GPS array as binary (Protocol Buffers / msgpack)
     → Store encoded_polyline in activity row; full GPS in S3
     → Retrieve when needed (map rendering, segment matching)
  ✅ Time-series DB (InfluxDB, TimescaleDB):
     → Better if you need time-range queries within an activity
     → Supports downsampling older data automatically
```

> For interviews: **S3 for raw GPS, metadata in Cassandra.** The same blob + metadata split from Dropbox (Q04).

**2. Segment matching algorithm**

```
1. Encode activity GPS track as a bounding box
2. SpatialIndex.query(bbox) → candidate_segment_ids
   (could be 50 segments in that area, not 50,000)
3. For each candidate segment:
   a. Check if athlete's track enters the segment start zone (within 15m)
   b. Check if athlete's track exits the segment end zone
   c. If both: compute elapsed time between entry and exit timestamps
4. ZADD segment_leaderboard elapsed_ms athleteId
```

The spatial index turns an O(all_segments) problem into O(candidate_segments_in_area) — typically 50–200, not 500,000.

**3. Leaderboard design: per-segment sorted sets**

Building on Q07's sorted sets:

```
Key:    segment:{segmentId}:leaderboard:overall
Type:   ZSET (score = elapsed_ms, member = athleteId)
        → Lower score = faster = better rank

Key:    segment:{segmentId}:leaderboard:women
Key:    segment:{segmentId}:leaderboard:2024

ZADD segment:42:leaderboard:overall 312450 "athlete_99"  ← 5:12.45
ZRANK segment:42:leaderboard:overall "athlete_99"         ← rank 847
ZREVRANGE ... (wrong — lower time = better, so use ZRANGE for ascending)
```

---

## Capacity Estimation

```
Athletes:          100M registered, 10M DAU
Activities/day:    5M uploads
Avg GPS points:    3,600 per activity (1hr)
GPS data/day:      5M × 115 KB = 575 GB/day → S3

Segment matching:
  5M activities × avg 20 segments matched = 100M leaderboard updates/day
  → 1,200 ZADD ops/sec → well within Redis capacity

Segments total:    10M user-created segments
Leaderboard size:  avg 10,000 athletes per segment
Redis memory:      10M × 10K × 40 bytes = 4 TB → sharded Redis cluster
```

---

## Concepts Introduced

- **Time-series data pattern** — sequential, append-only data with time-range queries. The GPS track is your first time-series. Reappears in: Ad Click Aggregator (Q29), monitoring systems.
- **Encoded polyline + S3** — compress spatial sequences, store as blobs, retrieve when needed. Same metadata/blob split as Q02/Q04 applied to geo data.
- **Spatial index for bounding-box lookup** — narrow segment candidates before expensive geometric matching. Same QuadTree from Q12 and Q13, applied to line segments instead of points.
- **Per-category leaderboards** — multiple sorted sets for the same segment (overall, by gender, by year). The pattern scales from Strava segments to any multi-faceted ranking (game achievements, sales leaderboards).

---

## What to Study Next

➜ **[16 · FB Live Comments](16-fb-live-comments.md)** — combines fan-out from Q10 with WebSocket from Q11 to handle millions of concurrent viewers. The hardest fan-out challenge in the Medium tier.
