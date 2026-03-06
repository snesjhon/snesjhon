# CAP Theorem: Consistency, Availability, and Partition Tolerance

> **Goal**: Understand the constraints every distributed system operates under — and use them to justify every database and cache choice you make.
>
> **Companion exercises**: `level-1-consistency-models.rb`, `level-2-cp-vs-ap.rb`, `level-3-distributed-tradeoffs.rb`

---

## 1. Overview

CAP theorem is not trivia. It is the single most important framework for explaining why your architecture looks the way it does. Every time you choose a database, a cache strategy, or a replication configuration, you are implicitly making a CAP decision. Making it explicit — and being able to defend it — is what separates architectural thinking from guessing.

The theorem states: a distributed system can guarantee at most two of three properties simultaneously:

| Property                | What it means                                                  |
| ----------------------- | -------------------------------------------------------------- |
| **Consistency**         | Every read returns the most recent write, or an error          |
| **Availability**        | Every request gets a non-error response (may be stale)         |
| **Partition Tolerance** | The system keeps working when network links between nodes fail |

The practical reality: **partition tolerance is non-negotiable** in any distributed system. Networks fail. Nodes lose connectivity. You cannot build a system that simply stops existing when a network partition occurs. So the real choice is always between **C and A** during a partition.

---

## 2. Core Concept & Mental Model

### The Post Office Analogy

Imagine two post offices in different cities sharing the same customer records.

**The CP post office** (Consistent + Partition Tolerant): When the phone line between cities goes down, the post office in City B *closes its window*. "I cannot verify this customer's current address right now. I refuse to serve you rather than serve you wrong information." You get an error, not stale data.

**The AP post office** (Available + Partition Tolerant): When the phone line goes down, City B keeps its window open. "I'll serve you with the address I have on file as of yesterday." You get a response — possibly stale — but you get a response.

Neither is wrong. The right choice depends on what failure mode is acceptable for *your specific data*.

---

## 3. Building Blocks — Progressive Learning

### Level 1: The Three Properties — What Each Actually Means

**Why this level matters**

Candidates confuse "consistency" in CAP with ACID consistency. They are different. CAP consistency is about whether all nodes in a cluster return the same value at any point in time. ACID consistency is about invariants within a single database transaction. Conflating them under interview pressure is a red flag.

**Consistency (CAP)**

```
Scenario: two database nodes, Node A and Node B, replicate to each other.
  User writes "price = $50" to Node A.
  Network partition: Node B hasn't received the update yet.
  User reads from Node B.

  Consistent system:  returns an error. "I cannot guarantee this is current."
  Inconsistent system: returns the old value ($45). No error.

Consistent does NOT mean "correct data."
It means: "I will refuse to answer rather than answer wrong."
```

**Availability**

```
Scenario: same partition. User reads from Node B.

  Available system:   responds with the data it has, even if stale. No error.
  Unavailable system: returns an error or times out.

Available does NOT mean "fast."
It means: "I will always respond, even if my answer is stale."
```

**Partition Tolerance**

```
Scenario: Node A and Node B cannot communicate.

  Partition-tolerant: both nodes keep operating independently.
  Not partition-tolerant: the system fails entirely until the partition heals.

In practice: every distributed system must be partition-tolerant.
The only "not partition-tolerant" systems are single-node systems.
```

> **Mental anchor**: "Consistency = refuse to lie. Availability = always answer. Partition tolerance = keep running when split. In distributed systems, you always have P. Choose C or A."

---

**-> Bridge to Level 2**: You understand what each property means. Now apply it: given a data type, which failure mode is acceptable? That determines your CP vs AP choice.

### Level 2: CP vs AP — Matching Data to Its Required Guarantee

**Why this level matters**

The interview will present a system with multiple types of data. Your job is to make a deliberate CP or AP decision for each one — and defend it. The defense requires understanding what goes wrong if you pick the wrong one.

**The decision question**: "Which failure mode is acceptable for this data?"

```
CP failure mode: during a partition, requests fail or block.
  -> Users get errors. Writes are refused. The system appears down for some operations.
  -> Acceptable when: serving stale data causes real harm (financial, security, inventory).

AP failure mode: during a partition, stale data is served.
  -> Users get responses, but possibly wrong ones. No errors.
  -> Acceptable when: brief inconsistency is recoverable and the user experience matters more.
```

**The canonical examples**

```
CP (cannot tolerate stale reads):
  Bank account balance:   showing $500 when actual is $200 = overdraft risk
  Payment/charge records: double-processing = lost money
  Inventory count:        showing "1 left" when 0 = overselling
  Authentication tokens:  serving an invalidated token = security breach
  Distributed locks:      two nodes both thinking they hold the lock = corruption

AP (stale reads are recoverable):
  Social media feed:      seeing a post 2 seconds late is fine
  User profile / bio:     stale avatar for 30 seconds is harmless
  View counts / likes:    eventual convergence is acceptable
  Product recommendations: slightly stale personalization is OK
  Search index results:   a new post missing from results for a few seconds is fine
  Shopping cart contents: minor staleness is recoverable at checkout
```

**How to say this in an interview**

```
"For account balances, I need CP. If there's a partition between my
 database nodes, I'd rather reject the transaction than risk a double-charge.
 PostgreSQL with synchronous replication satisfies that.

 For the user's profile data — name, avatar, bio — I can use AP.
 If someone sees their old avatar during a network hiccup, they'll see
 the update within seconds when it resolves. I'd put that in a Cassandra
 cluster configured for eventual consistency, which gives me much better
 write throughput and availability."
```

**Databases by CAP behavior**

```
CP systems:
  PostgreSQL    -> single primary, synchronous replication enforces consistency
  MySQL         -> with synchronous replication enabled
  Redis Cluster -> in default config, prefers consistency over availability
  HBase         -> strongly consistent, built on HDFS
  Zookeeper     -> CP by design (used for distributed coordination)
  MongoDB       -> with write concern: "majority" (CP mode)

AP systems:
  Cassandra     -> designed for availability, tunable consistency
  DynamoDB      -> eventually consistent by default, strong consistency optional
  CouchDB       -> AP with eventual consistency
  DNS           -> classic AP example — propagation lag is intentional
  Riak          -> AP by default

Tunable (you choose per operation):
  Cassandra:    consistency_level = ONE (AP) vs QUORUM/ALL (CP)
  DynamoDB:     ConsistentRead = false (AP, cheaper) or true (CP, costs more)
  MongoDB:      write concern = 1 (AP) vs "majority" (CP)
```

> **Mental anchor**: "Financial data, inventory, and auth = CP. Social feeds, profiles, view counts = AP. Name the database and explain the replication setting."

---

**-> Bridge to Level 3**: You can pick CP or AP for a single data store. Real systems have multiple components with different requirements. Level 3 is about designing a system where different pieces have different consistency guarantees — and explaining the boundaries clearly.

### Level 3: The Consistency Spectrum & Multi-Component Systems

**Why this level matters**

CAP is a binary framing, but real systems live on a spectrum. You need vocabulary beyond "CP or AP" to describe the exact behavior of each component and the seams between them.

**The consistency spectrum**

```
Strong consistency (linearizability):
  Every read reflects the most recent write.
  Reads and writes appear to happen in a single global order.
  Cost: high latency (requires coordination across nodes).
  Use: financial ledgers, inventory counts, distributed locks.

Read-your-writes consistency:
  After you write, YOU always read your own write.
  Other users might still see old values for a moment.
  Cost: low (just pin your reads to the node you wrote to).
  Use: user settings, profile updates, anything that must feel instant to the editor.

Monotonic reads:
  Once you've read a value, you will never read an older one.
  You might not get the latest, but you won't go backwards.
  Cost: low (stick reads to a replica that's caught up enough).
  Use: activity feeds, notification history.

Eventual consistency:
  All nodes will converge to the same value — eventually.
  No guarantee on how long "eventually" takes.
  Cost: lowest (replicate asynchronously, accept lag).
  Use: view counts, likes, social feeds, search indexes.
```

**Designing a multi-component system with mixed guarantees**

```
Example: e-commerce platform

Component            Consistency Level    Why
-------------------  -------------------  ------------------------------------------
Order records        Strong              Orders must not be lost or duplicated
Inventory count      Strong              Overselling causes real customer harm
Payment ledger       Strong              Money movement requires linearizability
User sessions        Read-your-writes    After login, you must see your own session
Product catalog      Monotonic reads     Prices shouldn't jump backwards for a user
Reviews / ratings    Eventual            Slight lag is fine; throughput matters more
Search index         Eventual            New products appear in search within seconds

Architecture result:
  PostgreSQL (synchronous) -> orders, inventory, payments
  Redis (read-your-writes) -> sessions, rate limiting
  Cassandra (tuned)        -> product catalog (quorum reads), reviews (one read)
  Elasticsearch            -> search index (eventually consistent)
```

**The partition scenario walkthrough — say this out loud**

```
"Let's say our inventory service gets partitioned from the order service.

 I need to decide: do I reject the order (CP) or allow it with possible overselling (AP)?

 For this use case — a high-volume flash sale — I'd go CP. Overselling
 has direct business cost. I'd return a 503 to the user: 'Unable to process
 your order right now, please retry.' That's a worse user experience, but
 it's a recoverable one.

 For the product description service — which is stateless and read-only —
 I'd go AP. If a user sees an old product description during a partition,
 I'll serve from cache. When the partition heals, we're consistent again.
 The cost of a brief inconsistency here is essentially zero."
```

> **Mental anchor**: "Strong > read-your-writes > monotonic > eventual. Name the exact consistency level per component. When a partition hits, say which failure mode you're accepting and why."

---

## 4. Decision Framework

```
Is this data financial, inventory, or security-related?
  Yes -> CP. Strong consistency. PostgreSQL with synchronous replication.
       Acceptable failure mode: requests fail during partition.

Is stale data recoverable within seconds?
  Yes -> AP. Eventual consistency. Cassandra, DynamoDB in default mode.
       Acceptable failure mode: briefly stale reads.

Does the user need to immediately see their own write?
  Yes -> Read-your-writes minimum. Redis, or route reads to the primary.
       Does NOT require full strong consistency.

Is this a distributed lock or coordination primitive?
  Yes -> CP. Zookeeper, Redis with Redlock, or a dedicated consensus layer.
       Locks that are wrong cause corruption worse than a brief outage.
```

---

## 5. Common Gotchas

**1. Confusing CAP consistency with ACID consistency**

ACID consistency = your database enforces integrity constraints (foreign keys, check constraints) within a transaction. CAP consistency = all nodes return the same value at any point in time. You can have ACID consistency without CAP consistency.

**2. Treating "eventual consistency" as "probably fine"**

Eventual means "will converge given no new writes and sufficient time." In practice, that's milliseconds to seconds. But under continuous write load, a lagging replica may never fully catch up. Design around this explicitly: add convergence monitoring, not just hope.

**3. Not naming the database and configuration**

"I'd use a consistent database" is not an answer. "I'd use PostgreSQL with synchronous_commit = on and a replica that must acknowledge each write before we confirm it to the client" is an answer. Configuration details signal production experience.

**4. Applying the same consistency model to the whole system**

Every component should have a deliberate, justified consistency level. If you design your whole system with strong consistency, you've sacrificed unnecessary throughput. If you design everything as eventual, you risk data corruption in critical paths.

---

## 6. Practice Scenarios

- [ ] "Design a bank transfer system. What consistency model do you need for the ledger? What happens if the two account nodes are partitioned?" (CP case — refuse the transaction)
- [ ] "Design Twitter's like count. Does the like count need to be exact?" (AP case — eventual is fine, explain why)
- [ ] "You're designing a distributed shopping cart. The cart service is partitioned from the inventory service. Do you allow 'add to cart'?" (AP at cart layer, CP at checkout — explain the boundary)
- [ ] "Your read replicas are 500ms behind the primary. A user updates their password and immediately logs in again. What might go wrong?" (Read-your-writes problem — route auth reads to primary)
- [ ] "Cassandra vs PostgreSQL for a notification delivery log. Justify your choice." (AP — delivery logs are high write, eventual is fine; or CP if exactly-once delivery is required — defend either)

**Run the exercises**:
```
ruby level-1-consistency-models.rb
ruby level-2-cp-vs-ap.rb
ruby level-3-distributed-tradeoffs.rb
```
