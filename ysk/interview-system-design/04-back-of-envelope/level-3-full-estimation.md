# Level 3: Full System Estimation

> **Goal**: Given a system prompt, produce a complete estimation that drives multiple architecture decisions simultaneously.
>
> **Builds on Levels 1 and 2**: You can calculate individual numbers. Now tie them all together into a complete back-of-envelope estimation like an interviewer expects.

---

## What a full estimation covers

When an interviewer gives you a system prompt, they expect you to derive:

1. Average write QPS
2. Peak write QPS
3. Average read QPS
4. Peak read QPS
5. Daily storage
6. Annual storage
7. App server count (write path)
8. Whether caching is required
9. Cache hit rate needed (if applicable)
10. Storage tier strategy

---

## Exercise 1: Twitter-like system

**Prompt**: 100 million tweets per day. Each tweet is ~500 bytes. Read:write ratio is 10:1.

Work through every number. Show your calculation next to each answer.

| Metric | Your calculation | Answer |
|--------|-----------------|--------|
| Avg write QPS | | |
| Peak write QPS | | |
| Avg read QPS | | |
| Peak read QPS | | |
| Daily storage | | |
| Annual storage | | |

---

## Exercise 2: Chat application

**Prompt**: 10 million messages per day. Each message is ~200 bytes. Read:write ratio is 2:1.

| Metric | Your calculation | Answer |
|--------|-----------------|--------|
| Avg write QPS | | |
| Peak write QPS | | |
| Avg read QPS | | |
| Peak read QPS | | |
| Daily storage | | |
| Annual storage | | |

---

## Exercise 3: Infrastructure decisions

Given your estimates, translate them into concrete infrastructure choices.

Use these constants:
- Rails DB-heavy capacity: 300 req/sec/server
- Postgres complex reads: 1,000 queries/sec
- 30% headroom factor (effective = capacity × 0.7)
- Multi-tier storage if annual storage ≥ 1 TB

**Twitter infrastructure**:

| Decision | Your answer | Reasoning |
|----------|-------------|-----------|
| App servers for write path | | |
| Cache required? | | |
| Cache hit rate needed | | |
| Storage strategy | | |

**Chat infrastructure**:

| Decision | Your answer | Reasoning |
|----------|-------------|-----------|
| App servers for write path | | |
| Cache required? | | |
| Cache hit rate needed | | |
| Storage strategy | | |

---

## Exercise 4: Your own scenario

Practice with a new prompt from scratch. Use this one or pick your own:

**Prompt**: Instagram-like photo sharing. 5 million photo uploads per day. Each photo is 1 MB. Users view photos 50x more than they upload.

Work it through completely:

**Scale estimates**:

> _Write QPS (avg + peak):_

> _Read QPS (avg + peak):_

> _Daily + annual storage:_

**Infrastructure**:

> _App servers needed:_

> _Cache required? Hit rate needed?_

> _Storage tier strategy:_

**Biggest architectural challenge** at this scale:

> _Your answer:_

---

## The interview script

Practice saying this out loud for the Twitter scenario:

> "Let's start with scale. 100 million tweets per day divided by 100,000 seconds gives us 1,000 writes per second average, with a 3x peak of 3,000. At a 10:1 read ratio that's 10,000 average reads and 30,000 peak reads per second.
>
> For storage: 100 million tweets at 500 bytes is 50 GB per day, which compounds to about 18 TB per year — so we definitely need multi-tier storage.
>
> At 3,000 peak writes, I need 3,000 / (300 × 0.7) = about 15 DB-heavy app servers.
>
> 30,000 peak reads far exceeds Postgres's 1,000 reads/sec limit — caching is required. We need a 96.7% hit rate to bring DB load within capacity. That's achievable for a Twitter-style timeline since most reads hit popular or recently-active content.
>
> For the write path I'd use Postgres with synchronous replication for durability. For reads I'd use Redis for hot timelines and S3 for media."

---

<details>
<summary>Answer key</summary>

**Twitter**
| Metric | Answer |
|--------|--------|
| Avg write QPS | 1,000.0 |
| Peak write QPS | 3,000.0 |
| Avg read QPS | 10,000.0 |
| Peak read QPS | 30,000.0 |
| Daily storage | 50.0 GB |
| Annual storage | 18.25 TB |

**Twitter infrastructure**
| Decision | Answer |
|----------|--------|
| App servers (write) | 15 |
| Cache required | true |
| Cache hit rate needed | 0.9667 (96.67%) |
| Storage strategy | multi_tier |

**Chat**
| Metric | Answer |
|--------|--------|
| Avg write QPS | 100.0 |
| Peak write QPS | 300.0 |
| Avg read QPS | 200.0 |
| Peak read QPS | 600.0 |
| Daily storage | 2.0 GB |
| Annual storage | 0.73 TB |

**Chat infrastructure**
| Decision | Answer |
|----------|--------|
| App servers (write) | 2 |
| Cache required | false (600 peak read < 1,000 DB capacity) |
| Cache hit rate needed | 0.0 |
| Storage strategy | single_tier |

</details>
