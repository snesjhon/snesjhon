# Level 2: Schema Design Decisions

> **Goal**: Make correct schema design choices — breaking vs backwards-compatible changes, mutation structure, and when to use connections vs raw arrays.
>
> **Builds on Level 1**: You know when to use GraphQL vs REST. Now design the GraphQL schema correctly.

---

## Exercise 1: Breaking or backwards-compatible?

A schema change is **breaking** if existing clients that compiled against the old schema will break without code changes. It's **backwards-compatible** if old clients continue working unchanged.

**Breaking changes**:
- Removing a field
- Renaming a field
- Changing a field's type
- Making an optional argument required

**Backwards-compatible**:
- Adding a new optional field
- Adding a new query or mutation
- Adding a new optional argument
- Deprecating a field (keeping it, marking `@deprecated`)

| Schema change | Breaking or Backwards-compatible? |
|---------------|----------------------------------|
| Remove a field from a type | |
| Add a new optional field to a type | |
| Rename `username` field to `handle` | |
| Add a new query to the schema | |
| Change a field's type from String to Int | |
| Add a new optional argument to an existing query | |
| Make an optional argument required | |
| Mark an existing field as `@deprecated` (still serving it) | |
| Add a new mutation | |
| Remove a nullable field that clients might query | |

**Follow-up**: You need to rename a field. What's the safe migration path using GraphQL's built-in tooling?

> _Your answer:_

---

## Exercise 2: Input object or inline args?

For mutations, should you use an input object (`createPost(input: CreatePostInput!)`) or inline arguments (`createPost(title: String!, body: String!)`)?

**Rule**: Always use input objects for mutations with more than one meaningful argument. Adding a new optional field to an input object is backwards-compatible. Adding a new inline argument is a breaking change (changes the mutation signature).

**Exception**: Single-argument mutations that will never grow (`deletePost(id: ID!)`) can use inline args.

| Mutation scenario | Input object or Inline args? | Why |
|-------------------|------------------------------|-----|
| createPost with title, body, published, tags | | |
| deletePost (only needs id, will never grow) | | |
| updateUser with name, bio, avatar_url | | |
| publishPost (only needs post id) | | |
| inviteTeamMember with email, role, team_id, message | | |

---

## Exercise 3: Connection or raw array?

- **Connection**: Paginated list with `edges`, `nodes`, `pageInfo`, optional `totalCount`. Use for unbounded or real-time collections.
- **Raw array**: Simple `[Type]`. Use for small, bounded collections that will never need pagination.

| Collection scenario | Connection or Raw array? |
|--------------------|--------------------------|
| All posts for a user (unbounded, grows over time) | |
| Tags on a post (always 2–8 tags) | |
| Notifications for a user (stream, real-time) | |
| Roles on a user (admin/member/viewer, always < 5) | |
| Comments on a post (can be thousands) | |
| Images in a post carousel (max 10, bounded by product rules) | |

**Follow-up**: You started with a raw array for `post.comments` when posts had < 10 comments. Now posts regularly have 500+ comments. What does the schema migration look like, and is it breaking?

> _Your answer:_

---

## Exercise 4: Mutation payload validation

Every mutation payload **must** include `errors: [String!]!`. GraphQL always returns HTTP 200 — without an errors field, the React client cannot tell success from silent failure.

| Payload fields | Valid or Missing errors? |
|----------------|--------------------------|
| `{ post: Post, errors: [String] }` | |
| `{ user: User, errors: [String] }` | |
| `{ post: Post }` | |
| `{ success: Boolean }` | |
| `{ comment: Comment, errors: [String], post: Post }` | |

**Design question**: You have a `deletePost` mutation. On success, there's no record to return. Design the complete payload type:

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Change | Answer |
|--------|--------|
| Remove field from type | breaking |
| Add new optional field | backwards_compatible |
| Rename field | breaking |
| Add new query | backwards_compatible |
| Change field type | breaking |
| Add optional argument | backwards_compatible |
| Make optional argument required | breaking |
| Deprecate field (still serving) | backwards_compatible |
| Add new mutation | backwards_compatible |
| Remove nullable field | breaking |

**Exercise 2**
| Scenario | Answer |
|----------|--------|
| createPost, multiple fields | input_object |
| deletePost, id only | inline_args |
| updateUser, multiple fields | input_object |
| publishPost, id only | inline_args |
| inviteTeamMember, complex | input_object |

**Exercise 3**
| Scenario | Answer |
|----------|--------|
| User posts, unbounded | connection |
| Post tags, 2-8 | raw_array |
| User notifications, stream | connection |
| User roles, < 5 | raw_array |
| Post comments, thousands | connection |
| Carousel images, max 10 | raw_array |

**Exercise 4**
| Payload | Answer |
|---------|--------|
| { post, errors } | correct |
| { user, errors } | correct |
| { post } | missing_errors |
| { success } | missing_errors |
| { comment, errors, post } | correct |

</details>
