---
sr-due: 2026-04-05
sr-interval: 30
sr-ease: 273
---
# Level 2: CP vs AP — Matching Data to Its Required Guarantee

#review

> **Goal**: Given a real system component, make a deliberate CP or AP decision and understand the failure mode you're accepting.
>
> **Builds on Level 1**: You know what CP and AP mean. Now apply it to specific data types and defend the choice.

---

## Exercise 1: Choose consistency for each component

**The decision question**: "What is the cost of serving stale data here?"
- High cost (money, security, real harm) → CP
- Low cost (annoying but recoverable) → AP

| Component                           | CP or AP? | What goes wrong if you pick the other? |
| ----------------------------------- | --------- | -------------------------------------- |
| Payment ledger                      |           |                                        |
| User activity feed                  |           |                                        |
| Inventory count at checkout         |           |                                        |
| Product catalog (name, description) |           |                                        |
| Auth token validation               |           |                                        |
| Recommendation engine results       |           |                                        |
| Distributed job lock                |           |                                        |
| Search index for blog posts         |           |                                        |
| Seat reservation for event tickets  |           |                                        |
| User follower count display         |           |                                        |

**Practice saying it out loud**: Pick the two most interesting rows above and write a one-sentence interview-style justification for your CP or AP choice.

> _Your answer:_

---

## Exercise 2: What does the system do during a partition?

A partition just occurred. Given the consistency model and the type of request, what does the system do?

| Consistency model | Request type | System response |
| ----------------- | ------------ | --------------- |
| CP                | Read         |                 |
| CP                | Write        |                 |
| AP                | Read         |                 |
| AP                | Write        |                 |

**Follow-up**: A user tries to check their account balance and the system is CP with a partition in progress. They get an error. Is that the right call? Why?

> _Your answer:_

---

## Exercise 3: Replication lag tolerance

How much replica lag is acceptable for each data type? Use these SLAs:
- Financial / auth data: **0ms** (must read from primary)
- User profiles: **up to 5 seconds**
- Social feeds: **up to 10 seconds**
- Search indexes: **up to 30 seconds**

| Data type      | Lag      | Acceptable? |
| -------------- | -------- | ----------- |
| Financial data | 0ms      |             |
| Financial data | 50ms     |             |
| User profile   | 3,000ms  |             |
| User profile   | 8,000ms  |             |
| Social feed    | 8,000ms  |             |
| Social feed    | 15,000ms |             |
| Search index   | 25,000ms |             |
| Search index   | 45,000ms |             |

**Follow-up**: Why must financial data read from the primary with 0ms lag? What specific scenario does routing to a replica enable?

> _Your answer:_

---

## Exercise 4: Pick the right database

Given requirements, choose the right database family. Use this map:
- Strong consistency + relational → **PostgreSQL**
- High write throughput + eventual OK → **Cassandra**
- Low-latency reads + sessions/cache → **Redis**
- Variable scale + tunable consistency → **DynamoDB**

| Requirements                                              | Database |
| --------------------------------------------------------- | -------- |
| Financial transactions, strong consistency required       |          |
| User session cache, sub-millisecond reads                 |          |
| IoT sensor data, 100k writes/sec, eventual consistency OK |          |
| E-commerce product catalog, variable traffic              |          |
| Bank ledger, ACID transactions required                   |          |
| Real-time leaderboard, fast in-memory operations          |          |

**Follow-up**: DynamoDB supports both eventual and strong consistency reads. When would you pay for strong consistency reads in DynamoDB vs just using PostgreSQL?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Component | Answer |
|-----------|--------|
| Payment ledger | CP |
| User activity feed | AP |
| Inventory count at checkout | CP |
| Product catalog | AP |
| Auth token validation | CP |
| Recommendation engine | AP |
| Distributed job lock | CP |
| Search index for blog posts | AP |
| Seat reservation | CP |
| Follower count display | AP |

**Exercise 2**
| Model | Request | Response |
|-------|---------|----------|
| CP | Read | serve_error |
| CP | Write | serve_error |
| AP | Read | serve_stale |
| AP | Write | serve_stale (accept locally) |

**Exercise 3**
| Data type | Lag | Answer |
|-----------|-----|--------|
| Financial | 0ms | Acceptable |
| Financial | 50ms | Unacceptable |
| User profile | 3000ms | Acceptable |
| User profile | 8000ms | Unacceptable |
| Social feed | 8000ms | Acceptable |
| Social feed | 15000ms | Unacceptable |
| Search index | 25000ms | Acceptable |
| Search index | 45000ms | Unacceptable |

**Exercise 4**
| Requirements | Answer |
|--------------|--------|
| Financial transactions, strong consistency | PostgreSQL |
| User sessions, sub-ms reads | Redis |
| IoT sensor, 100k writes/sec, eventual | Cassandra |
| E-commerce catalog, variable traffic | DynamoDB |
| Bank ledger, ACID required | PostgreSQL |
| Real-time leaderboard, in-memory | Redis |

</details>

---

## Flashcards #flashcards

During a partition, what does a CP system do for reads? For writes?
?
Both return an error or block. A CP system refuses all requests it cannot guarantee are consistent — reads and writes alike.
<!--SR:!2026-03-10,3,250-->

---

During a partition, what does an AP system do for reads? For writes?
?
Reads: serve the last known cached value. Writes: accept locally on one node and sync when the partition heals. No errors returned.
<!--SR:!2026-03-10,4,270-->

---

A user updates their password and immediately tries to log in again. The auth system routes the login read to a replica that's 200ms behind. What goes wrong?
?
The replica doesn't yet know about the password change. The login may succeed with the old password — or fail if the new password is used. This is a read-your-writes violation. Auth reads must go to the primary.
<!--SR:!2026-03-09,3,250-->

---

What is the maximum acceptable replication lag for financial and auth data? Why?
?
0ms — reads must go to the primary. Any lag creates a window where a stale balance or invalidated token is served, causing overdrafts, double-spends, or security breaches.
<!--SR:!2026-03-10,4,270-->

---

What replication lag is acceptable for user profiles?
?
Up to ~5 seconds. Seeing a slightly outdated avatar or bio for a few seconds causes no harm.
<!--SR:!2026-03-10,4,270-->

---

What replication lag is acceptable for social feeds?
?
Up to ~10 seconds. A post appearing a few seconds late is annoying at worst, not harmful.
<!--SR:!2026-03-10,4,270-->

---

What goes wrong if you store inventory counts in an AP store?
?
Two users simultaneously see "1 item left," both complete checkout — you've oversold. The stale read caused a real transaction to go through on inventory that doesn't exist.
<!--SR:!2026-03-10,4,270-->

---

What goes wrong if you store auth session tokens in an AP cache?
?
A logged-out token remains valid in some regions until the cache catches up. A user who was logged out can still authenticate — a direct security vulnerability.

---

What goes wrong if you use a CP store for like counts?
?
During any partition, like counts become unavailable — reads block or error. You've introduced unnecessary failure modes for data that has no real consistency requirement. Massive over-engineering.

---

What goes wrong if you use an AP store for a distributed job queue?
?
Two workers both see the same job as unclaimed and both start processing it. Duplicate processing — potentially causing data corruption or double side-effects.

---

When would you use DynamoDB with strong consistency reads instead of just using PostgreSQL?
?
When you need DynamoDB's horizontal scale and global distribution but have specific operations that require freshness. PostgreSQL is simpler for pure CP needs. DynamoDB strong reads make sense when you're already on DynamoDB for scale and only need consistency on a subset of reads — you pay per-read for it rather than re-architecting.

---

Payment ledger — CP or AP? What fails if you pick the other?
?
CP. If AP: stale balance reads allow double-spending or overdrafts. Irreversible financial harm.

---

Distributed job lock — CP or AP? What fails if you pick the other?
?
CP. If AP: two workers both think they hold the lock simultaneously — duplicate job execution, data corruption.

---

Seat reservation for event tickets — CP or AP? What fails if you pick the other?
?
CP. If AP: two users both see the last seat as available and both complete purchase — oversold seat, real customer harm.

---

User activity feed — CP or AP? What fails if you pick the other?
?
AP. If CP: feed becomes unavailable during any partition — unnecessary downtime for data where a 10-second delay causes no harm.
