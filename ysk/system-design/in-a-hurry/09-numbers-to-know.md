# Numbers to Know

> **Mental model**: Back-of-envelope math is how you show an interviewer that your design is grounded in reality, not guesswork. Memorize these anchors.

---

## The Core Idea

You don't need exact numbers. You need **orders of magnitude** — the difference between 1ms and 100ms, between 1GB and 1TB. Interviewers use estimation to see if you think like an engineer who's shipped real systems.

---

## Latency Numbers

| Operation | Latency | Mental Anchor |
|-----------|---------|---------------|
| L1 cache reference | ~0.5ns | Effectively instant |
| L2 cache reference | ~7ns | — |
| RAM access | ~100ns | — |
| SSD random read | ~100µs (0.1ms) | 1000x slower than RAM |
| HDD seek | ~10ms | 100x slower than SSD |
| Network: same datacenter | ~0.5ms | |
| Network: same region (cross-AZ) | ~1–5ms | |
| Redis GET | ~1ms | |
| DB query (indexed, warm) | ~5–10ms | |
| Network: cross-continent | ~80–100ms | US → EU |
| Network: cross-world | ~150–200ms | US → Asia |

**The rule**: Memory → SSD → Network → HDD. Each is orders of magnitude slower.

---

## Storage Units

```
1 KB  = 1,000 bytes         ← a short email
1 MB  = 1,000 KB            ← a photo thumbnail
1 GB  = 1,000 MB            ← a short video
1 TB  = 1,000 GB            ← a hard drive
1 PB  = 1,000 TB            ← Facebook stores petabytes of photos
```

**Common estimations**:
- A tweet / short text: ~280 bytes → ~300 bytes
- A user record (name, email, metadata): ~1 KB
- A profile photo (compressed): ~100 KB–1 MB
- A 1080p video, 1 minute: ~100 MB
- A 4K video, 1 minute: ~400 MB

---

## Throughput Anchors

| System | Typical Throughput |
|--------|--------------------|
| Single PostgreSQL server (writes) | ~5,000–10,000 writes/sec |
| Single Cassandra node (writes) | ~30,000–50,000 writes/sec |
| Redis (single node) | ~100,000 ops/sec |
| Kafka (single partition) | ~100,000 messages/sec |
| HTTP server (single instance) | ~10,000–50,000 req/sec |
| A busy CDN edge node | Millions of req/sec |

---

## Back-of-Envelope Template

Use this structure for any capacity estimation:

```
1. Daily Active Users (DAU): e.g., 100M
2. Requests per user per day: e.g., 10 reads, 1 write
3. Requests per second:
     Reads:  100M × 10 / 86,400 ≈ 12,000 RPS
     Writes: 100M × 1  / 86,400 ≈ 1,200 WPS
     Peak:   assume 2–3x average → ~3,600 WPS peak

4. Storage per item: e.g., 1KB per post
5. New storage per day: 100M × 1 write × 1KB = 100 GB/day
6. Storage for 5 years: 100GB × 365 × 5 ≈ 180 TB

7. Bandwidth:
     Read bandwidth: 12,000 RPS × 1KB = 12 MB/s (negligible)
     Write bandwidth: 1,200 WPS × 1KB = 1.2 MB/s
```

---

## Common Approximations

```
1 day  = 86,400 seconds ≈ 100,000 seconds (round up for easy math)
1 year ≈ 31.5M seconds ≈ 30M seconds

1M requests/day  = ~12 RPS
10M requests/day = ~120 RPS
1B requests/day  = ~12,000 RPS

Rough read:write ratio for most consumer apps: 10:1 to 100:1
```

---

## Availability Numbers (Nines)

| Uptime | Downtime/year | Downtime/month |
|--------|---------------|----------------|
| 99% (two nines) | 3.65 days | 7.2 hours |
| 99.9% (three nines) | 8.7 hours | 43 minutes |
| 99.99% (four nines) | 52 minutes | 4.3 minutes |
| 99.999% (five nines) | 5.2 minutes | 26 seconds |

> Most companies target **99.9% to 99.99%**. Five nines is extremely rare and expensive.

---

## Interview Signals

- Round aggressively: "100M users, 10 actions/day, 86,400 seconds ≈ 100K, so ~10,000 RPS"
- State assumptions out loud: "I'll assume 10:1 read-to-write ratio"
- Use these to justify architectural decisions: "At 50K writes/sec, a single Postgres instance won't cut it — we need sharding or Cassandra"
- Mention peak vs average: "Average is 1,200 WPS but Black Friday peaks at 3–5x — so we design for ~5,000 WPS"
