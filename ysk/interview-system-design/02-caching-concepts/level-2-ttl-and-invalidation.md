# Level 2: TTL and Cache Invalidation

> **Goal**: Choose appropriate TTLs and invalidation strategies. Understand the trade-off between staleness and DB load.
>
> **Builds on Level 1**: You know the three cache patterns. Now decide how long cached data lives and how you remove it when the source changes.

---

## The core trade-off

**Short TTL** → more cache misses → more DB load → fresher data
**Long TTL** → fewer misses → less DB load → staler data

The right TTL balances: *how stale is acceptable* vs *how expensive is a cache miss*.

---

## Exercise 1: TTL buckets

Assign each data type to a TTL bucket. There's no single right number — think about the acceptable staleness window.

- **Very short** (< 60 seconds): changes constantly, stale = real harm
- **Short** (1–5 minutes): user-facing, changes occasionally
- **Medium** (5–30 minutes): expensive to compute, occasional updates
- **Long** (> 30 minutes): rarely changes, high compute cost

| Data type | TTL bucket | Reasoning |
|-----------|------------|-----------|
| Live stock price (updates per second) | | |
| E-commerce product price (stale = lost revenue) | | |
| User profile bio and avatar | | |
| Homepage featured posts | | |
| User-generated report | | |
| Search autocomplete suggestions | | |
| Country list for dropdown | | |
| Terms of service text | | |

**Follow-up**: Product price is "very short" but a product description is "long." Both belong to the same product record. What does this tell you about cache key design?

> _Your answer:_

---

## Exercise 2: Invalidation strategies

When data changes, how do you handle the stale cache entry?

- **TTL expiry**: Passive — let the cache expire on schedule. Use when you don't control the write, or brief staleness is fine.
- **Event invalidate**: Active — delete the cache key after the DB update. Use when you control the write and the user expects to see their change.
- **Write-through**: Update cache and DB together synchronously. Use when zero stale window is required.
- **Version key**: Embed a version in the cache key (e.g., `user:42:v3`). Old keys become unreachable. Use when a schema change or deploy changes the shape of cached data.

| Scenario | Strategy | Why |
|----------|----------|-----|
| Product description updated by admin, 5 min stale is fine | | |
| User changes their email — must see new email immediately | | |
| Account balance — must never be stale after a write | | |
| A deploy adds a new field to the cached user object | | |
| Third-party API data you cache but can't control when it updates | | |
| User updates their post and expects to see the change right away | | |

---

## Exercise 3: DB request rate from hit rate

Same formula as Level 1: `db_req = total_qps × (1 − hit_rate)`. Return as a float.

| Total QPS | Hit rate | DB requests/sec |
|-----------|----------|-----------------|
| 8,000 | 92% | |
| 20,000 | 98% | |
| 1,000 | 70% | |

**Reflection**: At 70% hit rate on 1,000 QPS you get 300 DB requests/sec. Your DB handles 1,000/sec. Is the cache helping much? What hit rate would you need to cut DB load in half?

> _Your answer:_

---

## Exercise 4: Stale window from TTL

**Formula**: `max_stale_window = TTL`

If a key is cached right before an update happens, the stale version can live for up to the full TTL duration.

| TTL | Maximum stale window |
|-----|---------------------|
| 60 seconds | |
| 300 seconds | |
| 30 seconds | |
| 3,600 seconds | |

**Design question**: A user updates their account email. The cache has a 5-minute TTL. The user immediately logs out and back in, and still sees their old email. You get a support ticket. What are your options to fix this without removing the cache entirely?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Data type | TTL bucket |
|-----------|------------|
| Live stock price | very_short |
| E-commerce product price | very_short |
| User profile bio/avatar | short |
| Homepage featured posts | short |
| User-generated report | medium |
| Search autocomplete | medium |
| Country dropdown list | long |
| Terms of service text | long |

**Exercise 2**
| Scenario | Strategy |
|----------|----------|
| Product description, 5 min stale OK | ttl_expiry |
| User email change, see immediately | event_invalidate |
| Account balance, never stale after write | write_through |
| Deploy adds field to cached object | version_key |
| Third-party data, can't control writes | ttl_expiry |
| User updates post, expects immediate feedback | event_invalidate |

**Exercise 3**
| QPS | Hit rate | DB reqs/sec |
|-----|----------|-------------|
| 8,000 | 92% | 640.0 |
| 20,000 | 98% | 400.0 |
| 1,000 | 70% | 300.0 |

**Exercise 4**
| TTL | Max stale window |
|-----|-----------------|
| 60s | 60s |
| 300s | 300s |
| 30s | 30s |
| 3,600s | 3,600s |

</details>
