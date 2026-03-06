# Level 1: QPS and Storage Calculations

> **Goal**: Convert daily event counts to QPS and compute storage requirements. These are the raw calculations that drive every infrastructure decision.

---

## The formulas

Memorize these before your interview:

```
avg_qps  = daily_events / 100,000       (100K second approximation for 1 day)
peak_qps = avg_qps × 3                  (3x spike multiplier)
storage  = count × bytes_per_item
```

Storage units (1000-based):
- 1 KB = 1,000 bytes
- 1 MB = 1,000,000 bytes
- 1 GB = 1,000,000,000 bytes
- 1 TB = 1,000,000,000,000 bytes

---

## Exercise 1: Average QPS from daily events

`avg_qps = daily_events / 100,000`

| Daily events | Avg QPS | Your work |
|--------------|---------|-----------|
| 10,000,000 (10M) | | |
| 100,000,000 (100M) | | |
| 1,000,000 (1M) | | |
| 500,000,000 (500M) | | |
| 50,000,000 (50M) | | |

**Why 100,000?** A day has 86,400 seconds. Rounding to 100,000 makes mental math fast and introduces only a small error. Interviewers expect approximate answers — show your reasoning, not precision.

---

## Exercise 2: Peak QPS

`peak_qps = avg_qps × 3`

| Daily events | Peak QPS |
|--------------|----------|
| 10,000,000 | |
| 100,000,000 | |
| 1,000,000,000 (1B) | |

**When would you use a higher multiplier than 3x?** Think about flash sales, live events, viral moments.

> _Your answer:_

---

## Exercise 3: Read QPS from write QPS

`read_qps = write_qps × read_write_ratio`

| Write QPS | Read:Write ratio | Read QPS |
|-----------|-----------------|----------|
| 1,000 | 10:1 | |
| 500 | 100:1 | |
| 3,000 | 2:1 | |

**Explain the ratio**: Twitter has a very high read:write ratio. Instagram stories have a lower one. Why does this ratio matter for architecture decisions?

> _Your answer:_

---

## Exercise 4: Daily storage

`storage = count × bytes_per_item` → normalize to the largest clean unit

| Scenario | Daily storage | Your work |
|----------|---------------|-----------|
| 100M tweets @ 500 bytes each | | |
| 10M photos @ 300 KB each | | |
| 1M messages @ 200 bytes each | | |
| 100K video-minutes @ 60 MB each | | |

---

## Exercise 5: Annual storage

`annual_storage_tb = (daily_storage_gb × 365) / 1,000`

| Daily storage | Annual storage (TB) |
|---------------|---------------------|
| 50 GB/day | |
| 3,000 GB/day | |
| 100 GB/day | |

**Design decision trigger**: When annual storage exceeds 1 TB, you need a storage tiering strategy (hot/warm/cold). Below 1 TB, a single tier might suffice.

---

## Putting it together: Twitter-like system

Work through this from scratch. Write out each step:

- **Scale**: 100M tweets/day, each tweet ~500 bytes, 10:1 read:write ratio

1. Average write QPS: ____
2. Peak write QPS: ____
3. Average read QPS: ____
4. Peak read QPS: ____
5. Daily storage: ____
6. Annual storage: ____

> _Your work:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Daily events | Avg QPS |
|--------------|---------|
| 10M | 100.0 |
| 100M | 1,000.0 |
| 1M | 10.0 |
| 500M | 5,000.0 |
| 50M | 500.0 |

**Exercise 2**
| Daily events | Peak QPS |
|--------------|----------|
| 10M | 300.0 |
| 100M | 3,000.0 |
| 1B | 30,000.0 |

**Exercise 3**
| Write QPS | Ratio | Read QPS |
|-----------|-------|----------|
| 1,000 | 10:1 | 10,000.0 |
| 500 | 100:1 | 50,000.0 |
| 3,000 | 2:1 | 6,000.0 |

**Exercise 4**
| Scenario | Storage |
|----------|---------|
| 100M tweets @ 500B | 50.0 GB |
| 10M photos @ 300KB | 3.0 TB |
| 1M messages @ 200B | 200.0 MB |
| 100K video-min @ 60MB | 6.0 TB |

**Exercise 5**
| Daily | Annual |
|-------|--------|
| 50 GB | 18.25 TB |
| 3,000 GB | 1,095.0 TB |
| 100 GB | 36.5 TB |

**Twitter-like**:
1. 100M / 100K = 1,000 QPS avg write
2. 1,000 × 3 = 3,000 QPS peak write
3. 1,000 × 10 = 10,000 QPS avg read
4. 3,000 × 10 = 30,000 QPS peak read
5. 100M × 500B = 50 GB/day
6. 50 × 365 / 1,000 = 18.25 TB/year

</details>
