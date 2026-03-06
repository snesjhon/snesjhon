# Level 1: API Style — REST vs GraphQL and Pagination

> **Goal**: For each scenario, choose the right API style and pagination strategy. Know when each wins and why.

---

## When does each win?

Before starting, write the key signal for each in your own words:

**GraphQL wins when**:

> _Your answer:_

**REST wins when**:

> _Your answer:_

---

## Exercise 1: REST or GraphQL?

| Scenario | REST or GraphQL? | The deciding signal |
|----------|------------------|---------------------|
| React app fetching posts with author names | | |
| Stripe webhook hitting our endpoint | | |
| Mobile + web need different fields for the same resource | | |
| POST /uploads for avatar image upload | | |
| GET /healthz server health check | | |
| Dashboard fetching user + posts + activity in one screen | | |
| GitHub-style public developer API for third parties | | |
| React admin panel where each page needs different fields | | |
| POST /webhooks/github receiving push events | | |

**Notice**: webhooks and file uploads always go REST. Why can't GraphQL handle these well?

> _Your answer:_

---

## Exercise 2: Cursor or offset pagination?

- **Cursor pagination**: Stable even when new items insert between pages. Required for real-time or frequently-updated feeds.
- **Offset pagination**: Simple — "give me page 3." Fine for static, sorted datasets that rarely change. Breaks when items insert between pages (you skip or repeat items).

| Scenario | Cursor or Offset? | Why |
|----------|-------------------|-----|
| Twitter-style home feed (new posts insert constantly) | | |
| Admin user list, alphabetical, rarely changes | | |
| Notification stream (new notifications arrive live) | | |
| Product catalog sorted by category, static data | | |
| Activity feed (events insert in real time) | | |
| Search results page (stable result set for a query) | | |
| GraphQL posts feed in a React app | | |

**Explain the failure mode**: A user is browsing page 2 of an offset-paginated feed when 3 new posts arrive. What goes wrong on page 3?

> _Your answer:_

---

## Exercise 3: HTTP method for each REST operation

| Operation | HTTP method |
|-----------|-------------|
| Fetch a single post by ID | |
| Create a new post | |
| Update only the post title (partial update) | |
| Replace the entire post object | |
| Delete a post | |
| List all posts | |
| Upload a file | |

**Key distinction**: What's the difference between PATCH and PUT? When would you use each?

> _Your answer:_

**Safe vs idempotent**: Mark each method above as safe (S), idempotent (I), both, or neither:

| Method | Safe? | Idempotent? |
|--------|-------|-------------|
| GET | | |
| POST | | |
| PATCH | | |
| PUT | | |
| DELETE | | |

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Scenario | Answer |
|----------|--------|
| React app, posts with authors | graphql |
| Stripe webhook inbound | rest |
| Mobile + web, different fields | graphql |
| File upload | rest |
| Health check endpoint | rest |
| Dashboard nested data, one request | graphql |
| Public developer API | rest |
| React admin panel, varied fields | graphql |
| GitHub webhook push events | rest |

**Exercise 2**
| Scenario | Answer |
|----------|--------|
| Twitter home feed | cursor |
| Admin user list, alphabetical | offset |
| Notification stream, live | cursor |
| Product catalog, static | offset |
| Activity feed, real-time | cursor |
| Search results, stable | offset |
| GraphQL posts feed | cursor |

**Exercise 3**
| Operation | Method |
|-----------|--------|
| Fetch single post | get |
| Create new post | post |
| Update title only | patch |
| Replace entire post | put |
| Delete post | delete |
| List all posts | get |
| Upload file | post |

Safe/Idempotent:
| Method | Safe | Idempotent |
|--------|------|------------|
| GET | Yes | Yes |
| POST | No | No |
| PATCH | No | Yes |
| PUT | No | Yes |
| DELETE | No | Yes |

</details>
