# Level 2: CP vs AP — Matching Data to Its Required Guarantee

> **Goal**: Given a real system component, make a deliberate CP or AP decision and understand the failure mode you're accepting.
>
> **Builds on Level 1**: You know what CP and AP mean. Now apply it to specific data types and defend the choice.

---

## Exercise 1: Choose consistency for each component

**The decision question**: "What is the cost of serving stale data here?"
- High cost (money, security, real harm) → CP
- Low cost (annoying but recoverable) → AP

| Component | CP or AP? | What goes wrong if you pick the other? |
|-----------|-----------|----------------------------------------|
| Payment ledger | | |
| User activity feed | | |
| Inventory count at checkout | | |
| Product catalog (name, description) | | |
| Auth token validation | | |
| Recommendation engine results | | |
| Distributed job lock | | |
| Search index for blog posts | | |
| Seat reservation for event tickets | | |
| User follower count display | | |

**Practice saying it out loud**: Pick the two most interesting rows above and write a one-sentence interview-style justification for your CP or AP choice.

> _Your answer:_

---

## Exercise 2: What does the system do during a partition?

A partition just occurred. Given the consistency model and the type of request, what does the system do?

| Consistency model | Request type | System response |
|-------------------|--------------|-----------------|
| CP | Read | |
| CP | Write | |
| AP | Read | |
| AP | Write | |

**Follow-up**: A user tries to check their account balance and the system is CP with a partition in progress. They get an error. Is that the right call? Why?

> _Your answer:_

---

## Exercise 3: Replication lag tolerance

How much replica lag is acceptable for each data type? Use these SLAs:
- Financial / auth data: **0ms** (must read from primary)
- User profiles: **up to 5 seconds**
- Social feeds: **up to 10 seconds**
- Search indexes: **up to 30 seconds**

| Data type | Lag | Acceptable? |
|-----------|-----|-------------|
| Financial data | 0ms | |
| Financial data | 50ms | |
| User profile | 3,000ms | |
| User profile | 8,000ms | |
| Social feed | 8,000ms | |
| Social feed | 15,000ms | |
| Search index | 25,000ms | |
| Search index | 45,000ms | |

**Follow-up**: Why must financial data read from the primary with 0ms lag? What specific scenario does routing to a replica enable?

> _Your answer:_

---

## Exercise 4: Pick the right database

Given requirements, choose the right database family. Use this map:
- Strong consistency + relational → **PostgreSQL**
- High write throughput + eventual OK → **Cassandra**
- Low-latency reads + sessions/cache → **Redis**
- Variable scale + tunable consistency → **DynamoDB**

| Requirements | Database |
|--------------|----------|
| Financial transactions, strong consistency required | |
| User session cache, sub-millisecond reads | |
| IoT sensor data, 100k writes/sec, eventual consistency OK | |
| E-commerce product catalog, variable traffic | |
| Bank ledger, ACID transactions required | |
| Real-time leaderboard, fast in-memory operations | |

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
