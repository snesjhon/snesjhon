# Level 3: N+1 Query Detection and Prevention

> **Goal**: Detect N+1 risk in a GraphQL schema, calculate the actual query count, and choose the right fix.
>
> **Builds on Level 2**: You can design a schema correctly. Now ensure it doesn't silently fire hundreds of DB queries per request.

---

## The N+1 pattern

```
Query.posts resolves 50 posts → 1 query
PostType#author resolves user for each post → 50 queries
Total: 51 queries for what should be 2
```

This kills performance at scale and is the #1 GraphQL performance bug.

---

## Exercise 1: Does this resolver have N+1 risk?

**N+1 risk exists when**: A resolver runs once per item in a list AND fires a DB query each time.
**No risk when**: The field is a scalar already on the object, or the association was pre-loaded before the resolver ran.

| Resolver description | N+1 risk or no risk? |
|----------------------|----------------------|
| `PostType#author` calls `object.user` (not pre-loaded) in a posts list | |
| `PostType#title` returns `object.title` (scalar, no query) | |
| `CommentType#post` calls `object.post` (not pre-loaded) in a comments list | |
| `PostType#author` when the posts resolver does `Post.includes(:user)` | |
| `UserType#organization` calls `object.org` per user in a users list | |
| `PostType#published_at` returns `object.published_at` (scalar) | |

**Pattern check**: What's the signal that a field in a type will cause N+1?

> _Your answer:_

---

## Exercise 2: Calculate total DB queries

**Not pre-loaded**: 1 (list query) + N (one per record) = N + 1
**Pre-loaded with includes**: 1 (list) + 1 (eager load) = 2
**DataLoader batched**: 1 (list) + 1 (batch) = 2
**Scalar only**: 1 (list query) = 1

| Records | Association strategy | Total DB queries |
|---------|---------------------|-----------------|
| 50 posts | Author not pre-loaded | |
| 50 posts | Author with `includes` | |
| 50 posts | Author with DataLoader | |
| 50 posts | Title scalar only | |
| 100 comments | Post not pre-loaded | |
| 100 comments | Post with DataLoader | |

**Insight**: Without pre-loading, fetching 50 posts with their authors fires _____ queries. With `includes`, it fires _____. What's the DB impact at 1,000 requests/minute?

> _Your answer:_

---

## Exercise 3: Choose the right fix

- **`includes` in collection**: Add `.includes(:association)` to the list query resolver. Works for one level of association you control.
- **DataLoader**: Use a batch loader that collects all IDs in one execution tick and fires one query. Required for two+ levels of nesting or when you don't control the collection.
- **No fix needed**: No association loading per record — nothing to fix.

| Scenario | Fix |
|----------|-----|
| `posts { author { name } }` | |
| `posts { author { organization { name } } }` | |
| `posts { title, body }` (scalars only) | |
| `users { posts { title } }` (has_many) | |
| `comments { post { author { name } } }` (three levels) | |
| `post { tags }` (small array, pre-loaded) | |

**Explain the limit of `includes`**: Why does `posts { author { organization { name } } }` require DataLoader instead of a nested `includes`?

> _Your answer:_

---

## Exercise 4: DataLoader batch efficiency

DataLoader collects all IDs in one execution tick, then fires **one query** for all of them — regardless of how many parent records there are.

| Number of parent records | DataLoader queries for the association |
|--------------------------|----------------------------------------|
| 1 post | |
| 50 posts | |
| 1,000 posts | |
| 10,000 posts | |

**The key insight**: DataLoader always fires exactly _____ query per association type per request. This is what makes it so powerful for deeply nested GraphQL schemas.

**Design question**: Your schema has `posts { author { organization { teams { members { name } } } } }`. Without any optimization, how many queries would 20 posts trigger? With DataLoader at every level, how many?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Resolver | Answer |
|----------|--------|
| PostType#author, not pre-loaded | n_plus_one |
| PostType#title, scalar | no_risk |
| CommentType#post, not pre-loaded | n_plus_one |
| PostType#author, with includes | no_risk |
| UserType#organization, not pre-loaded | n_plus_one |
| PostType#published_at, scalar | no_risk |

**Exercise 2**
| Records | Strategy | Total queries |
|---------|----------|---------------|
| 50 posts | Not pre-loaded | 51 |
| 50 posts | includes | 2 |
| 50 posts | DataLoader | 2 |
| 50 posts | Scalar only | 1 |
| 100 comments | Not pre-loaded | 101 |
| 100 comments | DataLoader | 2 |

**Exercise 3**
| Scenario | Fix |
|----------|-----|
| posts > author > name | includes_in_collection |
| posts > author > organization > name | dataloader |
| posts > title, body (scalars) | no_fix_needed |
| users > posts > title | includes_in_collection |
| comments > post > author > name (3 levels) | dataloader |
| post > tags (pre-loaded) | no_fix_needed |

**Exercise 4**
DataLoader always fires **1** query per association type, regardless of parent count.

</details>
