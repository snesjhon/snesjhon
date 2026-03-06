# Level 2: Capacity Planning — From QPS to Infrastructure Decisions

> **Goal**: Use QPS numbers to make concrete decisions: how many servers, whether you need a cache, how many read replicas, and which storage tier.
>
> **Builds on Level 1**: You can calculate QPS and storage. Now translate those numbers into infrastructure.

---

## Reference capacities

Memorize these rough limits:

| Component | Capacity |
|-----------|----------|
| Rails app server (DB-heavy requests) | 300 req/sec |
| Rails app server (simple requests) | 1,000 req/sec |
| PostgreSQL (complex queries) | 1,000 queries/sec |
| Redis (single node) | 100,000 req/sec |

Always add **30% headroom**: effective capacity = `server_capacity × 0.7`

---

## Exercise 1: How many app servers?

**Formula**: `servers = ceil(peak_qps / (server_capacity × 0.7))`

Always round up — you can't run a partial server.

| Peak QPS | Server type | Servers needed | Your work |
|----------|-------------|----------------|-----------|
| 300 | DB-heavy (300/server) | | |
| 900 | DB-heavy | | |
| 3,000 | DB-heavy | | |
| 700 | Simple (1,000/server) | | |
| 5,000 | Simple | | |

**Why 30% headroom?** What happens to a server running at 100% capacity during a traffic spike?

> _Your answer:_

---

## Exercise 2: Do you need a cache?

A single PostgreSQL instance handles ~1,000 complex reads/sec. If peak read QPS exceeds that, you need a cache or read replicas.

| Peak read QPS | Cache required? |
|---------------|----------------|
| 500 | |
| 1,000 | |
| 1,001 | |
| 30,000 | |

**Follow-up**: Your peak read QPS is 1,001 — just over DB capacity. Would you add a cache or a read replica? What factors influence the decision?

> _Your answer:_

---

## Exercise 3: What cache hit rate do you need?

To bring DB read load within capacity, you need a minimum hit rate.

**Formula**: `hit_rate_needed = 1 − (db_capacity / read_qps)`
If `read_qps ≤ db_capacity`, return 0.0 (no cache needed).

| Read QPS | DB capacity | Hit rate needed | Your work |
|----------|-------------|-----------------|-----------|
| 1,000 | 1,000 | | |
| 10,000 | 1,000 | | |
| 30,000 | 1,000 | | |
| 5,000 | 1,000 | | |
| 20,000 | 2,000 | | |

**Insight**: At 30,000 read QPS with a 1,000/sec DB, you need a ____% hit rate. Is that achievable? What data would need to be cached to reach it?

> _Your answer:_

---

## Exercise 4: How many read replicas (without caching)?

Each replica handles 1,000 reads/sec. Add 30% headroom.

**Formula**: `replicas = ceil(peak_read_qps / (1,000 × 0.7))`

| Peak read QPS | Replicas needed |
|---------------|-----------------|
| 500 | |
| 3,000 | |
| 10,000 | |
| 30,000 | |

**The punchline**: 30,000 read QPS requires _____ read replicas without caching. That same load with a 96.7% cache hit rate requires just 1 DB. Which approach would you take and why?

> _Your answer:_

---

## Exercise 5: Storage tiering

Data accessed frequently should live on fast, expensive storage. Old data can move to cheaper tiers.

- **Hot** (0–90 days): Primary database (SSD, fast, expensive)
- **Warm** (91–365 days): Object storage like S3 (cheap, still accessible)
- **Cold** (> 365 days): Archive storage like Glacier (very cheap, slow retrieval)

| Data age | Storage tier |
|----------|-------------|
| 0 days | |
| 45 days | |
| 90 days | |
| 91 days | |
| 180 days | |
| 365 days | |
| 366 days | |
| 730 days | |

**Design question**: You're building a logging system. Logs are queried frequently in the first week, occasionally for 3 months, and almost never after that. Design your tiering strategy and the migration process.

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Peak QPS | Type | Servers |
|----------|------|---------|
| 300 | DB-heavy | 2 |
| 900 | DB-heavy | 5 |
| 3,000 | DB-heavy | 15 |
| 700 | Simple | 1 |
| 5,000 | Simple | 8 |

**Exercise 2**
| Peak read QPS | Answer |
|---------------|--------|
| 500 | db_sufficient |
| 1,000 | db_sufficient |
| 1,001 | cache_required |
| 30,000 | cache_required |

**Exercise 3**
| Read QPS | DB cap | Hit rate |
|----------|--------|----------|
| 1,000 | 1,000 | 0.0 |
| 10,000 | 1,000 | 0.9 |
| 30,000 | 1,000 | 0.9667 |
| 5,000 | 1,000 | 0.8 |
| 20,000 | 2,000 | 0.9 |

**Exercise 4**
| Peak read QPS | Replicas |
|---------------|----------|
| 500 | 1 |
| 3,000 | 5 |
| 10,000 | 15 |
| 30,000 | 43 |

**Exercise 5**
| Age | Tier |
|-----|------|
| 0 days | hot |
| 45 days | hot |
| 90 days | hot |
| 91 days | warm |
| 180 days | warm |
| 365 days | warm |
| 366 days | cold |
| 730 days | cold |

</details>
