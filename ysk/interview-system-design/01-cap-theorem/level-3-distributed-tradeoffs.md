# Level 3: Distributed Trade-offs — Multi-Component System Design

> **Goal**: Reason about consistency requirements across an entire system — not just one component. Identify which components must share consistency models and which can differ.
>
> **Builds on Level 2**: You can pick CP or AP for a single data store. Now design a system where different components have different guarantees and explain the boundaries.

---

## Exercise 1: Consistency coupling

Two services in an e-commerce system: can they use independent consistency models, or must they agree?

**Rule**: Components that exchange data with hard correctness requirements (money, inventory, auth) must agree. Components with soft requirements (search, feeds, analytics) can differ independently.

| Service A | Service B | Independent or Must Match? | Why? |
|-----------|-----------|---------------------------|------|
| Payment service | Order service | | |
| Product catalog | Recommendation engine | | |
| Inventory service | Order service | | |
| User profile | Activity feed | | |
| Auth service | Session store | | |
| Search index | Product catalog | | |

**Follow-up**: The inventory service is CP and the order service is AP. A customer places an order for an item that's out of stock. What happens? Who's responsible for the inconsistency?

> _Your answer:_

---

## Exercise 2: The partition decision

A partition is occurring. Given the data type and operation, what's the correct action?

- **reject_request**: CP data — refuse rather than risk inconsistency
- **serve_from_cache**: AP read — return last known value
- **queue_for_later**: AP write — accept locally, sync when partition heals
- **fail_open**: Low-stakes action where proceeding with defaults is harmless

| Data type | Operation | Correct action |
|-----------|-----------|----------------|
| Financial data | Write | |
| Product description | Read | |
| Analytics event | Write | |
| Feature flag | Read | |
| Inventory count | Write | |
| Notification | Write | |

**Design question**: Your checkout service is partitioned from your inventory service. You have two choices: reject the order (CP) or allow it and risk overselling (AP). For a flash sale with 10,000 units, which do you choose and why?

> _Your answer:_

---

## Exercise 3: Replication strategy

Given requirements, choose the replication strategy.

- **Synchronous**: Primary waits for ALL replicas before confirming. Zero data loss on failover, but write latency = slowest replica.
- **Asynchronous**: Primary confirms immediately, replicates in background. Fast writes, but potential data loss if primary crashes before replication.
- **Semi-synchronous**: Primary waits for AT LEAST ONE replica. Balance of safety and speed.

| Requirements | Replication strategy |
|--------------|---------------------|
| Bank transactions — zero data loss tolerance | |
| User-generated content feed — high write volume | |
| Order records — durability needed but some write speed required | |
| Real-time analytics ingest — massive throughput | |
| Auth credentials — must not lose on crash | |

**Follow-up**: Your synchronous replication is causing 200ms write latency because one replica is in a different region. What are your options?

> _Your answer:_

---

## Exercise 4: Read routing

In a replicated system, where should reads go?

- **Primary only**: Freshest data. Higher load on primary. Required for CP-critical data.
- **Any replica**: Possible lag, but distributes load. Good for AP data in single-region.
- **Local replica**: Reduces cross-region latency. Good for globally distributed AP data.

| Scenario | Read routing |
|----------|--------------|
| Session token validation | |
| Global product catalog, multi-region deployment | |
| Post content, single-region app | |
| Account balance check | |
| News feed, users globally distributed | |

**System design question**: Walk through a complete e-commerce checkout flow. For each operation below, state your consistency requirement (strong / read-your-writes / eventual) and where reads should go:

1. Load product page (title, description, images)
2. Check inventory count before showing "Add to Cart"
3. Verify auth token at checkout
4. Decrement inventory when order is placed
5. Send order confirmation email

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Service A | Service B | Answer |
|-----------|-----------|--------|
| Payment service | Order service | Must match |
| Product catalog | Recommendation engine | Independent |
| Inventory service | Order service | Must match |
| User profile | Activity feed | Independent |
| Auth service | Session store | Must match |
| Search index | Product catalog | Independent |

**Exercise 2**
| Data type | Operation | Answer |
|-----------|-----------|--------|
| Financial | Write | reject_request |
| Product description | Read | serve_from_cache |
| Analytics event | Write | queue_for_later |
| Feature flag | Read | fail_open |
| Inventory count | Write | reject_request |
| Notification | Write | queue_for_later |

**Exercise 3**
| Requirements | Answer |
|--------------|--------|
| Bank, zero data loss | Synchronous |
| User content feed, high volume | Asynchronous |
| Order records, durability + speed | Semi-synchronous |
| Analytics ingest, massive throughput | Asynchronous |
| Auth credentials, no loss | Synchronous |

**Exercise 4**
| Scenario | Answer |
|----------|--------|
| Session token validation | Primary only |
| Global product catalog, multi-region | Local replica |
| Post content, single-region | Any replica |
| Account balance check | Primary only |
| News feed, global users | Local replica |

</details>
