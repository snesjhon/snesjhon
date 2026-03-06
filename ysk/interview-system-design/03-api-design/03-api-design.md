# API Design: GraphQL Schema Design, REST Principles, and N+1 Prevention

> **Goal**: Design clean, evolvable APIs. Justify GraphQL over REST for the right use cases. Build schemas that clients can grow with and resolvers that don't quietly destroy database performance.
>
> **Companion exercises**: `level-1-api-style.rb`, `level-2-schema-decisions.rb`, `level-3-n-plus-one.rb`

---

## 1. Overview

API design is the contract between your system and its consumers. A good API is predictable, evolvable, and safe to extend without breaking existing clients. A bad API is versioned-by-accident, over-fetches data, or silently generates hundreds of database queries per request.

This module covers three skills:
1. Knowing when to use GraphQL vs REST and being able to defend the choice
2. Designing a GraphQL schema that handles real-world requirements cleanly
3. Identifying and preventing N+1 query problems in resolvers

---

## 2. Core Concept & Mental Model

### The Restaurant Menu Analogy

**REST** is a fixed menu. The kitchen decides what combinations come on each plate. If you want pasta, you get pasta, salad, and bread — even if you only want the pasta. If you need pasta and soup from two different dishes, you make two orders.

**GraphQL** is an à la carte counter. You tell the kitchen exactly what you want: "pasta only, no bread, and add shrimp from the seafood dish." One order, exactly what you asked for.

Neither is wrong. A fixed menu is simpler, faster to serve, and better for kitchens (servers) that need to optimize preparation. À la carte is better when guests (clients) have wildly different tastes and the kitchen has the infrastructure to handle custom orders.

---

## 3. Building Blocks — Progressive Learning

### Level 1: REST vs GraphQL — The Justified Choice

**Why this level matters**

Saying "we use GraphQL" without being able to explain why — or when REST is still correct — is a red flag. Interviewers want to know you've made a deliberate decision, not just followed a trend.

**When GraphQL wins**

```
Multiple clients with different data shapes:
  Mobile app: needs post.title, post.author.name (bandwidth-sensitive)
  Web app: needs post.title, post.body, post.comments, post.tags (feature-rich)
  -> REST: you build two endpoints or one bloated endpoint.
  -> GraphQL: each client queries exactly what it needs in one request.

Deeply related data in one request:
  post -> author -> organization -> plan -> features
  -> REST: 4 round trips or a custom "mega endpoint"
  -> GraphQL: one query, one HTTP request

Evolving schema without versioning:
  -> REST: adding a field is fine; removing or renaming requires /v2/
  -> GraphQL: add fields freely. Old clients ignore new fields.
     Deprecate old fields with @deprecated. Remove only when usage drops to zero.

Type-safe, self-documenting contract:
  -> GraphQL schema IS the documentation. Clients introspect it.
     React component queries declare exactly what they depend on.
```

**When REST is still the right tool**

```
File uploads:
  multipart/form-data doesn't map cleanly to GraphQL.
  Use a dedicated REST endpoint: POST /uploads

External webhooks and callbacks:
  Stripe, GitHub, Twilio call YOUR endpoint. They speak REST.
  Always REST for inbound webhooks: POST /webhooks/stripe

Public third-party APIs:
  REST is universally understood. GraphQL requires tooling.
  If you're building a public developer API, REST is more accessible.

Simple health checks and infrastructure endpoints:
  GET /healthz, GET /readyz, GET /metrics
  These are not "resources" — they're infrastructure. REST is fine.

Simple one-shot integrations:
  If a single endpoint does one thing and never changes, GraphQL overhead isn't justified.
```

**REST resource design — the principles**

```
Nouns in URLs. Verbs as HTTP methods.

BAD:  POST /createPost         (verb in URL)
BAD:  GET  /getUser?id=5       (verb + query param for ID)
GOOD: POST /posts              (create)
GOOD: GET  /users/5            (get)
GOOD: GET  /users/5/posts      (nested resource)
GOOD: PATCH /posts/5           (partial update)
GOOD: DELETE /posts/5          (delete)

Nested resource rule:
  Use /parent/:id/child when the child only makes sense in context of parent.
  Use /child?parent_id=X when the child has independent identity.
```

> **Mental anchor**: "GraphQL for flexible clients with diverse data needs. REST for file uploads, webhooks, and public APIs. Justify the choice; don't just pick by convention."

---

**-> Bridge to Level 2**: You've chosen GraphQL. Now design the schema. The schema is your contract — get it wrong and you'll be hacking workarounds forever.

### Level 2: GraphQL Schema Design — The Rules That Matter

**Why this level matters**

A poorly designed schema creates problems that compound over time: N+1 bugs baked into the type graph, mutations that can't evolve, clients that can't be updated independently. The rules here are hard-won patterns from production GraphQL at scale.

**The five schema design rules**

**Rule 1: Types represent domain objects. Every domain object gets an ID.**

```graphql
# Every persisted entity gets id: ID!
type Post {
  id: ID!            # Never nullable
  title: String!
  body: String!
  published: Boolean!
  author: User!      # Nested type
  createdAt: String!
}

type User {
  id: ID!
  name: String!
  email: String!
}
```

**Rule 2: Mutations take input objects and return payload objects.**

```graphql
# BAD: inline arguments
mutation {
  createPost(title: "Hello", body: "World", published: true)
}

# GOOD: input object
mutation {
  createPost(input: { title: "Hello", body: "World", published: true }) {
    post { id title }
    errors
  }
}

# Why input objects?
#   - You can add new optional fields to CreatePostInput without changing the mutation signature
#   - Clients that don't know about the new field pass nothing — backwards compatible

# Why payload objects?
#   - You can add new fields to CreatePostPayload without breaking clients
#   - errors: [String!]! is how clients know a mutation failed
#     (GraphQL returns HTTP 200 even on business logic failures)

type Mutation {
  createPost(input: CreatePostInput!): CreatePostPayload!
  updatePost(id: ID!, input: UpdatePostInput!): UpdatePostPayload!
  deletePost(id: ID!): DeletePostPayload!
}

input CreatePostInput {
  title: String!
  body: String!
  published: Boolean  # optional, defaults to false
}

type CreatePostPayload {
  post: Post           # null if mutation failed
  errors: [String!]!   # empty array on success
}
```

**Rule 3: Collections use the Connection pattern.**

```graphql
# BAD: raw array
type Query {
  posts: [Post!]!   # no pagination, N+1 risk on author, no cursor
}

# GOOD: Connection pattern
type Query {
  posts(first: Int, after: String, published: Boolean): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!   # opaque cursor; clients don't parse this
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Why cursor, not offset?
#   Offset: GET /posts?page=2&per_page=25
#   If 3 new posts are inserted between page 1 and page 2, you see duplicates.
#   Cursor: after: "cursor_string" — stable regardless of insertions.
#   For feeds, cursor is always correct. For static sorted lists, offset is fine.
```

**Rule 4: Fields are added freely; fields are deprecated, never removed abruptly.**

```graphql
type User {
  id: ID!
  name: String!
  username: String! @deprecated(reason: "Use name field instead")
  # username is still served; clients that query it still work
  # Remove only after confirming zero clients query username
}
```

**Rule 5: Auth lives at the resolver, not the schema.**

```
Don't design separate authenticated/unauthenticated types.
One schema. Resolvers check permissions and raise errors.

# In the resolver:
def resolve(id:)
  post = Post.find(id)
  raise GraphQL::ExecutionError, "Not authorized" unless current_user.can_read?(post)
  post
end
```

> **Mental anchor**: "ID on every entity. Input+payload for mutations. Connection for collections. Deprecate, never delete. Auth in resolvers."

---

**-> Bridge to Level 3**: The schema looks clean. But nested types create a hidden performance trap: every time a resolver accesses an association, it can generate a database query per parent record.

### Level 3: N+1 in GraphQL Resolvers — Detection and the DataLoader Fix

**Why this level matters**

N+1 is the most common GraphQL performance bug in production. It hides in type resolvers, is invisible in the schema, and can turn a 2-query page into a 201-query page with no code change other than adding data to the list. You must be able to spot it, explain it, and fix it.

**How N+1 happens in GraphQL**

```
Schema:
  type Post { author: User! }

Query:
  query {
    posts(first: 50) {
      title
      author { name }
    }
  }

What fires:
  1 query: SELECT * FROM posts LIMIT 50
  50 queries: SELECT * FROM users WHERE id = ? (once per post)
  Total: 51 queries

The resolver for User on PostType:
  def author
    object.user   # This is the culprit. Called 50 times.
  end

Looks fine. Is not fine.
```

**The DataLoader fix (batch loading)**

```
Principle: instead of executing queries one at a time,
COLLECT all IDs requested in one execution tick, then fire ONE batched query.

Without DataLoader:
  Post 1 -> User.find(user_id: 1)    <- query
  Post 2 -> User.find(user_id: 2)    <- query
  ...
  Post 50 -> User.find(user_id: 50)  <- query
  = 50 queries

With DataLoader:
  All 50 user_ids are collected.
  ONE query: User.where(id: [1, 2, 3, ..., 50])
  Results mapped back to each post in memory.
  = 1 query

Ruby implementation (graphql-batch gem):
  class UserByIdLoader < GraphQL::Batch::Loader
    def perform(user_ids)
      User.where(id: user_ids).each do |user|
        fulfill(user.id, user)
      end
      # Fulfill nil for any IDs that returned no record
      user_ids.each { |id| fulfill(id, nil) unless fulfilled?(id) }
    end
  end

  # In PostType resolver:
  def author
    UserByIdLoader.load(object.user_id)
  end
```

**When to use includes vs DataLoader**

```
Post.includes(:user) in the collection resolver:
  Works when you know upfront that user will be requested.
  Simple. One line in the query resolver.
  Limitation: only works one level deep. Nested: post.author.organization -> N+1 again.

DataLoader:
  Works at any depth.
  Each loader type batches across the full execution context.
  Required for deeply nested graphs.
  More code but more flexible.

Rule of thumb:
  One level deep association -> includes in the query resolver
  Two+ levels deep, or conditional access -> DataLoader
```

**Detecting N+1 in an interview**

```
Whenever you see a type with a belongs_to or has_many field AND that type
appears in a list query -> there is N+1 risk.

Checklist:
  [ ] Does PostType have author: User! ?              -> N+1 risk in posts list query
  [ ] Does CommentType have post: Post! ?             -> N+1 risk in comments list query
  [ ] Does UserType have organization: Organization! ?-> N+1 risk in users list query
  [ ] Is any of these loaded inside a resolver        -> confirm N+1

Saying it in an interview:
  "I notice that PostType exposes author: User!. If clients query a list of posts
   and include author, we'll fire one User query per post. That's an N+1.
   I'd fix this with includes in the posts resolver for the simple case, or
   the graphql-batch DataLoader pattern for deeper nesting."
```

> **Mental anchor**: "Nested type in a list query = N+1 risk. One level deep = includes. Deeper or conditional = DataLoader. Always ask: who is responsible for batching?"

---

## 4. Decision Framework

```
REST or GraphQL?
  Client is React SPA with diverse data needs         -> GraphQL
  File upload                                          -> REST endpoint alongside /graphql
  External webhook / inbound callback                  -> REST
  Public developer API                                 -> REST (more accessible)
  Internal service-to-service                          -> Either; GraphQL if schema is shared

Pagination type?
  Real-time or frequently-inserted feed               -> Cursor (stable)
  Static sorted list (alphabetical, by date, no live) -> Offset is fine

Schema change impact?
  Adding a new field / type / argument (optional)     -> Backwards compatible, ship it
  Removing a field                                     -> Breaking. Deprecate, then remove.
  Renaming a field                                     -> Breaking. Add new, deprecate old.
  Changing field type (String -> Int)                 -> Breaking. New field + deprecate old.
  Making optional argument required                   -> Breaking.

N+1 fix?
  Single level association on collection type         -> includes in collection resolver
  Multi-level or conditional loading                  -> DataLoader (graphql-batch)
```

---

## 5. Common Gotchas

**1. Mutations without errors in the payload**

GraphQL returns HTTP 200 for validation failures. If your mutation payload has no `errors` field, React has no way to surface failure to the user. Always include `errors: [String!]!`.

**2. Returning raw arrays instead of Connection types**

`posts: [Post!]!` works for small, static datasets. For anything that will grow, cursor pagination from the start is far easier than retrofitting it later (clients must be updated when you change the schema).

**3. Solving N+1 in the wrong place**

Adding `includes(:user)` in the PostType author resolver does nothing — it runs per post, so it fires N queries for N posts, each with an includes. The includes must go in the COLLECTION resolver (the one that fetches the list of posts), not in the individual type resolver.

**4. Over-nesting the type graph**

`post.author.organization.plan.features` is a 4-level chain. Every level adds N+1 risk and makes DataLoader setup more complex. Design flat-ish schemas; expose nested data only when clients genuinely need it in one request.

**5. Forgetting that schema changes affect multiple clients**

A web app, a mobile app, and an internal dashboard might all share the same GraphQL schema. A "minor" field removal affects all three. Always check usage before deprecating; always keep deprecated fields alive through a migration period.

---

## 6. Practice Scenarios

- [ ] "Design the GraphQL schema for a multi-tenant SaaS. Organizations have teams, teams have members, members have posts." Design the full type graph. Where is N+1 risk?
- [ ] "Mobile app needs title + author name. Web app needs title + body + comments + reactions. Design the API." Why GraphQL? Design the schema that serves both.
- [ ] "A client reports that loading the post list page makes 101 database queries. You have 100 posts." Diagnose and fix. Which resolver is the culprit?
- [ ] "We need to rename the `username` field to `handle` on UserType. How do you do this safely?" (@deprecated + migration timeline + monitor usage before removal)
- [ ] "Design the mutations for creating and publishing a post." Input types, payload types, error handling. What happens when validation fails?

**Run the exercises**:
```
ruby level-1-api-style.rb
ruby level-2-schema-decisions.rb
ruby level-3-n-plus-one.rb
```
