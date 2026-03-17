# Lesson 2 — ActiveRecord: Queries, Scopes, Services, Transactions

## The Mental Model

ActiveRecord is a **translator**. You write Ruby, it writes SQL.

```ruby
Post.where(status: 'published').order(created_at: :desc).limit(10)
# SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 10
```

Two things to keep in mind as you go through this lesson:

1. **Queries are lazy** — they don't hit the database until you iterate or call `.to_a`, `.first`, etc.
2. **Objects are not data** — an ActiveRecord object is an in-memory Ruby object backed by a DB row. When you access associations on that object, Rails makes more queries unless you tell it not to.

---

## Part 1: The N+1 Problem

### What is N+1?

N+1 is the most common performance mistake in Rails apps, and the most common ActiveRecord interview topic.

Imagine you have 10 posts and want to show each post's author name:

```ruby
posts = Post.all
posts.each { |post| puts post.user.name }
```

This looks fine, but watch what happens in the database:

```sql
SELECT * FROM posts;                    -- 1 query to load all posts
SELECT * FROM users WHERE id = 1;      -- then 1 query per post to get its user
SELECT * FROM users WHERE id = 2;
SELECT * FROM users WHERE id = 3;
-- ...N more queries for N posts
```

That's **N+1 queries** — 1 for the list, then one for every row. With 10 posts it's 11 queries. With 10,000 posts, your page times out.

The problem is that when you load posts, Rails doesn't know you're going to ask for `post.user`. So the first time you call it in the loop, it fires a query. Then again. Then again.

### The Fix: `includes`

`includes` tells Rails upfront: "when you load these posts, also load their users in one batch and hold them in memory."

```ruby
posts = Post.includes(:user).all
posts.each { |post| puts post.user.name }
```

Now Rails runs two queries total, regardless of how many posts there are:

```sql
SELECT * FROM posts;
SELECT * FROM users WHERE id IN (1, 2, 3, ...);  -- all users in one shot
```

`post.user` now reads from memory — no database hit.

### `includes` vs `joins` — easy to confuse

Both involve associations, but they solve different problems:

- **`includes`** — "load this association into memory so I can use it when rendering"
- **`joins`** — "filter or sort results based on a condition on the associated table"

```ruby
# includes — loads users into memory for rendering
Post.includes(:user).all

# joins — filters posts WHERE the user's name is Alice (user data is NOT held in memory)
Post.joins(:user).where(users: { name: 'Alice' })
```

A common mistake: using `joins` and then calling `post.user` in the loop expecting it to be pre-loaded. It won't be — `joins` uses the association for filtering only, not for memory. If you need to render association data, you need `includes`.

If you need to both filter by the association AND render it:

```ruby
Post.eager_load(:user).where(users: { name: 'Alice' })
# Does a single LEFT JOIN and holds the user data in memory
```

|                         | `includes`                          | `joins`                           |
| ----------------------- | ----------------------------------- | --------------------------------- |
| **Purpose**             | Load associated records into memory | Filter/sort by associated data    |
| **Queries**             | 2 queries (or 1 with eager_load)    | 1 query (SQL JOIN)                |
| **Access association?** | Yes, in memory                      | Only for filtering, not rendering |
| **Use when**            | You'll render association data      | You need WHERE on another table   |

**Interview tip:** "I use `includes` when I need to render associated data. I use `joins` when I need to filter by a column on the associated table. If I need both, `eager_load` does a single LEFT JOIN and holds the association in memory."

---

## Exercise 1: Find and Fix an N+1

Add a `comments` endpoint that returns all comments for a post, with each comment's author name.

First, add the route (nested under posts):

```ruby
resources :posts, only: [:index, :show, :create, :update, :destroy] do
  resources :comments, only: [:index, :create, :destroy]
end
```

Create `app/controllers/api/v1/comments_controller.rb`. Write an `index` action starting from the N+1 version below, then fix it.

**N+1 version (bad) — start here:**

```ruby
def index
  post = Post.find(params[:post_id])
  comments = post.comments
  render json: comments.map { |c| { body: c.body, author: c.author.name } }
  # c.author fires a query each iteration!
end
```

**Guiding questions:**

1. Which association is causing a query on every iteration? How do you tell Rails to load it upfront?
2. After you add `includes`, how many total queries does this action fire — regardless of how many comments the post has?

---

## Part 2: Scopes — Reusable, Chainable Queries

### What is a scope?

A scope is a named, reusable query fragment defined on a model. Instead of writing `where(status: 'published')` in every controller action, you name it once on the model and use that name everywhere.

Under the hood, a scope is just a class method that returns an ActiveRecord relation:

```ruby
# These two are equivalent:
scope :published, -> { where(status: 'published') }

def self.published
  where(status: 'published')
end
```

Because scopes return a relation, they're always chainable — you can keep stacking them and Rails combines them into a single SQL query:

```ruby
scope :published, -> { where(status: 'published') }
scope :recent,    -> { order(created_at: :desc) }
scope :by_status, ->(status) { where(status: status) }

Post.published.recent.limit(5)
# SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 5
```

### Why use scopes instead of inline `where`?

Two reasons:

**Reusability** — if the definition of "published" changes (say, it also needs `published_at <= Time.now`), you change it in one place, not everywhere it's used.

**Readability** — `Post.published.recent` reads like English; `Post.where(status: 'published').order(created_at: :desc)` reads like SQL.

### Checking params before applying a scope

In controllers, you'll often only want to apply a scope if a query param was actually sent. Rails gives you `.present?` for this — it returns `true` if the value is non-nil and non-empty:

```ruby
params[:status].present?   # true if status was sent and isn't blank
params[:status].nil?       # only true if completely absent — misses empty string ""
```

Always use `.present?` over `.nil?` for param checks — it covers both missing and blank values.

**When to use a scope vs inline `where`:**

- Use a scope when you'll reuse the condition in multiple places
- Use an inline `where` for one-off conditions specific to a single action

**Interview tip:** "I define scopes for business concepts like `published` or `by_author` because they make the code read like the domain, not like SQL."

---

## Exercise 2: Add a filtered index

Update `PostsController#index` to accept an optional `status` query param:

```
GET /api/v1/posts?status=draft    → returns only that user's draft posts
GET /api/v1/posts                 → returns all published posts (default)
```

Use scopes. Don't write raw SQL strings.

**Guiding questions:**

1. How do you check whether `params[:status]` was actually sent vs empty or missing?
2. When status is present, why should results be scoped to `current_user`? What's the security risk if you don't?
3. How do you structure the conditional so `includes` and `recent` apply in both branches without duplicating them?

---

## Part 3: Service Objects — Keeping Logic Out of Controllers

### What is a service object?

A service object is a plain Ruby class that encapsulates a single business operation. It's not a Rails concept — it's a pattern. Rails controllers are meant to handle HTTP: parse the request, call some logic, render a response. When that "some logic" gets complex, it belongs in a service, not the controller.

Think of it this way:

- **Controller** — traffic cop. Directs the request to the right place, renders the response.
- **Model** — knows about data and its rules.
- **Service** — knows how to perform a specific operation that involves coordinating models.

### File structure

Services live in `app/services/`:

```
app/
  services/
    post_publish_service.rb
    s3_presigned_url_service.rb
```

Rails autoloads this directory, so no `require` needed.

### Anatomy of a service object

The convention is simple: `initialize` takes what the service needs, `call` performs the operation and returns a result.

```ruby
# app/services/post_publish_service.rb
class PostPublishService
  def initialize(post, user)
    @post = post
    @user = user
  end

  def call
    # perform the operation
    # return true/false, or raise on failure
  end
end
```

Calling it from a controller:

```ruby
result = PostPublishService.new(post, current_user).call

if result
  render json: post
else
  render json: { error: 'failed' }, status: :unprocessable_entity
end
```

### `raise` and `rescue` — handling failures

Inside a service, you'll often need to stop execution and signal that something went wrong. `raise` throws an exception; `rescue` catches it.

```ruby
def call
  raise ArgumentError, 'Not authorized' unless @post.user == @user
  # if the line above raises, nothing below runs
  @post.update!(status: 'published')
  true
rescue ActiveRecord::RecordInvalid
  false
end
```

- `raise` immediately stops execution and unwinds the call stack
- `rescue` catches a specific exception type and lets you handle it gracefully
- The service returns `true` on success, `false` if a known error is caught

This pattern keeps error handling local to the service — the controller just checks the return value and doesn't need to know the details.

---

## Part 4: Transactions — All or Nothing

### What is a transaction?

A transaction wraps multiple database writes so they either **all succeed or all fail together**. If anything goes wrong mid-way, the database rolls back to exactly the state it was in before the transaction started.

Without a transaction, two writes are independent:

```ruby
# Dangerous — no transaction
post.update!(status: 'published')
AuditLog.create!(action: 'published', post: post)
# If the second line fails, the post is published but nothing was logged
# Your data is now inconsistent
```

With a transaction, they're coupled:

```ruby
# Safe — wrapped in a transaction
ActiveRecord::Base.transaction do
  post.update!(status: 'published')
  AuditLog.create!(action: 'published', post: post)
  # If anything raises here, BOTH operations roll back
end
```

### Bang methods inside transactions — critical detail

Non-bang methods (`save`, `update`, `create`) return `false` on failure — they don't raise an exception, so the transaction doesn't know anything went wrong and won't roll back.

Bang methods (`save!`, `update!`, `create!`) raise `ActiveRecord::RecordInvalid` on failure — that exception propagates out of the transaction block and triggers the rollback automatically.

```ruby
ActiveRecord::Base.transaction do
  post.update(status: 'published')   # ❌ returns false on failure — no rollback
  post.update!(status: 'published')  # ✅ raises on failure — triggers rollback
end
```

**Always use bang methods inside transactions.**

### When do you need a transaction?

Whenever two or more writes must succeed together:

- Publishing a post + creating an audit log entry
- Transferring money: debit account A + credit account B
- Creating an order + decrementing inventory

If one of those writes failing would leave your data in a broken or inconsistent state, it belongs in a transaction.

Combining a service object with a transaction is the natural pattern — the service encapsulates the operation, the transaction ensures atomicity:

```ruby
def call
  raise ArgumentError, 'Not authorized' unless @post.user == @user

  ActiveRecord::Base.transaction do
    @post.update!(status: 'published')
    AuditLog.create!(action: 'published', post: @post, user: @user)
  end

  true
rescue ActiveRecord::RecordInvalid
  false
end
```

### Custom routes — `member` vs `collection`

When you need an action that doesn't fit the standard CRUD routes (`index`, `show`, `create`, `update`, `destroy`), Rails lets you add custom routes.

There are two types:

- **`member`** — the action operates on a **specific record** and the URL includes `:id`
- **`collection`** — the action operates on the **entire collection** and there's no `:id`

```ruby
resources :posts do
  member do
    patch :publish      # PATCH /posts/:id/publish — publishes one specific post
  end
  collection do
    get :archived       # GET /posts/archived — returns all archived posts
  end
end
```

Use `member` when your action needs to know _which_ record to operate on. `publish` needs a post ID — so it's a member route.

**Interview tip:** "Any time I have two writes that need to be atomic, I wrap them in a transaction and use bang methods so any failure automatically rolls everything back."

---

## Exercise 3: Build a publish service with a transaction

Create `app/services/post_publish_service.rb` with `initialize(post, user)` and a `call` method.

**What it should do:**

- Ensure only the author can publish the post — raise if not
- Wrap the status update in a transaction using a bang method
- Return `true` on success, `false` on failure

Then wire it into the controller with a custom `publish` action:

```ruby
# routes.rb
resources :posts do
  member do
    patch :publish
  end
end
```

**Guiding questions:**

1. What does `raise` do to execution flow when the user isn't authorized? Why is that safer than an `if/else`?
2. Why must you use `update!` instead of `update` inside the transaction?
3. After a successful publish, the controller calls `post.reload` before rendering. Why — what changed that `post` doesn't know about yet?

---

## Part 5: Complex Queries — joins, group, count

### The mental model: SQL operates on a flat table of rows

Before you can reason about `joins`, `group`, and `count`, you need to picture what SQL is actually doing.

A database table is just rows and columns. When you `JOIN` two tables, SQL produces a **new, flat table** by stitching matching rows together side by side. Everything — filtering, grouping, counting — happens on that stitched result.

The Rails query that produces this:

```ruby
Post.joins(:comments)
```

Which generates:

```sql
SELECT posts.*
FROM posts
INNER JOIN comments ON comments.post_id = posts.id
```

Here's what the database is actually doing internally before it hands results back:

```bash
posts                          comments
id | title    | user_id        id | post_id | body        | user_id
---+----------+---------       ---+---------+-------------+--------
1  | "Rails"  | 10             1  | 1       | "Great!"    | 20
2  | "React"  | 11             2  | 1       | "Agreed"    | 21
3  | "SQL"    | 10             3  | 2       | "Nice"      | 20

Intermediate flat result (what SQL works with internally):
posts.id | posts.title | comments.id | comments.body
---------+-------------+-------------+--------------
1        | "Rails"     | 1           | "Great!"
1        | "Rails"     | 2           | "Agreed"       ← post 1 appears TWICE
2        | "React"     | 3           | "Nice"
3        | "SQL"       | (nothing)   | (nothing)      ← dropped because INNER JOIN

Final result Rails receives (SELECT posts.* trims it back):
posts.id | posts.title | posts.user_id
---------+-------------+--------------
1        | "Rails"     | 10            ← duplicate — one per matching comment
1        | "Rails"     | 10
2        | "React"     | 11
```

This flat intermediate result is what every subsequent `.where`, `.group`, and `.count` operates on — before `SELECT` trims it down to what Rails actually returns. Keep this picture in your head: it explains why you get duplicates, why you need `distinct`, and why LEFT JOIN matters.

---

### `joins` (INNER JOIN) — filter by what's in another table

**Mental model:** _Only keep rows where a match exists on both sides._

`joins` does an INNER JOIN. Every row in the result must have a matching row in the joined table. Records with no match are silently dropped.

```ruby
# Posts that Alice has commented on
Post.joins(:comments).where(comments: { user_id: alice.id })
```

What SQL this generates:

```sql
SELECT posts.*
FROM posts
INNER JOIN comments ON comments.post_id = posts.id
WHERE comments.user_id = 10
```

What's happening: Rails joins the two tables into that flat result, then filters down to only rows where the comment belongs to Alice.

**The duplicate problem.** If Alice commented 3 times on the same post, that post appears 3 times in the flat joined result — one row per comment. Add `.distinct` to collapse them back to one:

```ruby
Post.joins(:comments).where(comments: { user_id: alice.id }).distinct
```

```sql
SELECT DISTINCT posts.*
FROM posts
INNER JOIN comments ON comments.post_id = posts.id
WHERE comments.user_id = 10
```

**`joins` is a filter mechanism, not a loader.** The SQL it generates says `SELECT posts.*` — only post columns come back. The comments table is used as a gating condition, then discarded. Rails builds no comment objects from this query. If you call `post.comment` on any result, you'll fire a new query.

#### The bouncer mental model

Think of `joins` as a **bouncer at the door**. The bouncer checks IDs (the join condition) to decide who gets in. But once you're inside, nobody hands you a copy of your ID — you just have yourself.

`joins` checks: _does this post have a matching row in the comments table?_ If yes, the post gets through. The comment data is not handed to you on the other side. It was used only to make the decision.

`includes`, by contrast, is like a host who checks the guest list **and** brings you a printed copy of everything they know about you. You get the post **and** the pre-loaded comments in memory.

#### The three cases where `joins` is the right choice

**Case 1: Existence check — "give me X that have at least one Y"**

You don't need the Y data, you just need to know Y exists.

```ruby
# Posts that have been commented on — I don't care about the comment content
Post.joins(:comments).distinct

# Users who have at least one published post — I don't need post data
User.joins(:posts).where(posts: { status: 'published' }).distinct
```

You're rendering user profile cards — just their name and avatar. You don't need post titles. The condition "must have a published post" uses `joins`, but the result is pure `User` objects.

**Case 2: Filtering on a property of an association — "give me X where Y.column = value"**

```ruby
# Posts whose author is verified — render post data only, filter via users table
Post.joins(:user).where(users: { verified: true })

# Orders placed by customers in California — building an order report, not a customer report
Order.joins(:customer).where(customers: { state: 'CA' })
```

The associated table provides a filter criterion. What you're rendering is still the base model. You'd use `includes` only if you needed `post.user.name` in your view — if you only need `post.title` and `post.body`, `joins` is enough and avoids loading user objects into memory.

**Case 3: Filtering through a join table (many-to-many)**

```ruby
# Posts tagged "rails" — tags come through a join table, I don't need tag objects
Post.joins(:tags).where(tags: { name: 'rails' }).distinct
```

The tag data gates the filter. The result is post objects only.

#### The trap: using `joins` then accessing the association in a loop

This is the most common `joins` mistake. You think the join loaded the data. It didn't.

```ruby
# ❌ This looks fine but produces N+1
posts = Post.joins(:user).where(users: { verified: true })
posts.each { |post| puts post.user.name }
#                         ↑ fires a SELECT for each post — joins didn't load users
```

`joins` joined the users table for filtering, but `SELECT posts.*` only brought back post columns. When you call `post.user`, Rails has nothing in memory and fires a new query per post.

Fix: if you need to **render** the association, add `includes`. If you need to both filter and render in a single query, use `eager_load`:

```ruby
# ✅ filter AND render user data — two queries
Post.includes(:user).where(users: { verified: true })  # needs references(:user) in some Rails versions

# ✅ filter AND render user data — single LEFT JOIN
Post.eager_load(:user).where(users: { verified: true })
```

#### Decision tree

```bash
Do I need to access post.user (or any association attribute) while rendering?
  YES → includes (or eager_load if also filtering by that association)
  NO  → joins is enough

Am I just checking existence or filtering on a column in another table?
  YES → joins
```

---

## Exercise 5: Posts the current user has commented on

Add `GET /api/v1/posts/commented_on` — returns all posts where `current_user` has left at least one comment.

First, add the route as a collection action on posts (no `:id` — it operates on the whole collection):

```ruby
resources :posts do
  collection do
    get :commented_on
  end
end
```

The response shape should match the existing index — id, title, status, author name.

**What to think through before writing the query:**

The question is: _which posts has this user commented on?_ You need to cross the posts ↔ comments relationship. The key constraints are:

- Filter by `comments.user_id = current_user.id`
- A user might have commented multiple times on the same post — the post should only appear once
- You don't need to render any comment data, just the post

**Guiding questions:**

1. Should you use `joins` or `includes` here? You're filtering on a condition in the comments table but the response only needs post fields — which is the right tool?
2. If a user commented 3 times on one post, how many times does that post appear in the raw joined result? What do you add to collapse it back to one?
3. Why would `includes(:comments)` be the wrong choice here even though you're involving the comments table?

---

### `left_joins` (LEFT OUTER JOIN) — keep everything, even with no match

**Mental model:** _Keep all rows from the left table. Fill in NULLs on the right side when there's no match._

```bash
posts LEFT JOIN comments:
posts.id | posts.title | comments.id | comments.body
---------+-------------+-------------+--------------
1       | "Rails"    | 1          | "Great!"
1       | "Rails"    | 2          | "Agreed"
2       | "React"    | 3          | "Nice"
3       | "SQL"      | NULL       | NULL         ← stays! no comment, but still included
```

INNER JOIN would have dropped post 3. LEFT JOIN keeps it, filling the comment columns with NULL.

```ruby
# All posts, including those with zero comments
Post.left_joins(:comments)
```

On its own this isn't very useful — you'd still get duplicates and NULLs. `left_joins` is almost always combined with `group` and an aggregate like `COUNT`.

---

### `group` — the "bucket" operation

**Mental model:** _Sort the flat joined result into buckets, one bucket per unique value. Aggregate functions then apply per bucket._

`group` maps to SQL's `GROUP BY`. It takes all the rows in your result and collapses rows that share the same value in a column into a single row. Once rows are collapsed into groups, aggregate functions like `COUNT` and `SUM` run independently on each group instead of across the entire table.

#### Why `group` exists

Without `group`, `COUNT` sees every row as one big pile and returns a single number for the whole query. That's fine when you want a global total. But most of the time you want a number _per record_ — comments per post, orders per user, posts per tag. `group` is what creates those per-record buckets.

Think of it like a spreadsheet pivot: take a long flat list of rows, sort them into named piles, and compute a number for each pile.

```bash
Without group:                         With group('posts.id'):
posts.id | comments.id               Bucket: post 1 → 2 comments
1       | 1                        Bucket: post 2 → 1 comment
1       | 2            →           Bucket: post 3 → 0 comments
2       | 3
3       | NULL
COUNT = 3 (wrong, across all)      COUNT per bucket = [2, 1, 0] (right)
```

The flat joined table (from `left_joins`) has one row per comment. Without `group`, `COUNT` sees three comment rows and says "3". With `group('posts.id')`, SQL first sorts those rows into per-post piles, then runs `COUNT` inside each pile independently.

---

#### The three cases where `group` is the right choice

**Case 1: Count how many child records each parent has**

The most common use. You have posts; you want to know how many comments each one has — without firing N separate COUNT queries.

```ruby
Post.left_joins(:comments)
    .group('posts.id')
    .select('posts.*, COUNT(comments.id) AS comment_count')
```

What SQL this generates:

```sql
SELECT posts.*, COUNT(comments.id) AS comment_count
FROM posts
LEFT JOIN comments ON comments.post_id = posts.id
GROUP BY posts.id
```

Breaking it down:

**`left_joins(:comments)`** — produces the flat intermediate table by stitching each post row to its matching comment rows. Critically, this is a LEFT join, not INNER. INNER join would silently drop posts that have zero comments — they'd simply not appear in the result. LEFT join keeps every post and fills the comment columns with `NULL` when there's no match. That `NULL` matters for the next piece.

**`group('posts.id')`** — takes that flat table (which has one row per comment, so a post with 3 comments appears 3 times) and collapses it. Every row sharing the same `posts.id` gets folded into a single bucket. After this step, there's one bucket per post regardless of how many comments it has.

**`COUNT(comments.id)`** — runs inside each bucket and counts how many non-NULL `comments.id` values it finds. This is why LEFT join matters: posts with zero comments have `NULL` in the comment columns, and `COUNT` skips NULLs by design. So a post with no comments gets 0, not 1. If you wrote `COUNT(*)` instead, it would count the NULL row and return 1 for posts with no comments — wrong.

**`AS comment_count`** — gives the computed value a name in the result set. Without it, Rails has no way to surface it as a method on the object. With it, `post.comment_count` works in Ruby even though no such column exists in the database.

**`posts.*`** — tells SQL to include all real post columns (id, title, body, created_at, etc.) alongside the computed count. Without this you'd only get the count back with no post data to render.

Accessing the virtual attribute in Ruby:

```ruby
posts = Post.left_joins(:comments)
            .group('posts.id')
            .select('posts.*, COUNT(comments.id) AS comment_count')

posts.each { |p| puts "#{p.title}: #{p.comment_count} comments" }
# post.comment_count is NOT a real column — Rails reads it from the SELECT result
```

**Case 2: Summarize with aggregates other than COUNT**

`group` works with any aggregate function — `SUM`, `AVG`, `MAX`, `MIN`:

```ruby
# Total revenue per product
Order.group('product_id').sum(:amount)
# { 1 => 4500, 2 => 1200, 3 => 890 }  — returns a hash, not AR objects

# Average post length per user
Post.group('user_id').average(:body_length)

# Most recent activity per user
Post.group('user_id').maximum(:created_at)
```

When you call `.sum`, `.average`, `.maximum`, etc. at the end of a `group` chain, Rails returns a plain Ruby hash (`{ group_value => aggregate_result }`) rather than AR objects. No `select` or virtual attributes needed — Rails handles it.

**Case 3: Count occurrences of a value across rows**

Sometimes you're not joining — you just want to count how many times each distinct value appears in a column:

```ruby
# How many posts exist per status
Post.group(:status).count
# { "published" => 42, "draft" => 17, "archived" => 5 }

# How many users signed up per day
User.group("DATE(created_at)").count
```

No join needed. `group` works on the base table alone. Rails returns a hash.

---

#### The trap: forgetting `group` after a join and getting inflated counts

This is the most common `group` mistake. You join to get access to comment data, then count — but you're counting the flat joined rows, not the posts.

```ruby
# ❌ Looks right but counts all comment rows, not one per post
Post.joins(:comments).count
# Returns 3 (total comment rows) — not 2 (total posts with comments)
```

The flat JOIN result has one row per comment, so `COUNT` inflates. The fix is `group` + `COUNT` per bucket, or `.distinct` if you just want a deduplicated count of posts:

```ruby
# ✅ Count distinct posts that have comments
Post.joins(:comments).distinct.count

# ✅ Count comments per post
Post.left_joins(:comments).group('posts.id').select('posts.*, COUNT(comments.id) AS comment_count')
```

---

#### `HAVING` — filtering on aggregate results

`WHERE` filters rows _before_ grouping. `HAVING` filters buckets _after_ the aggregate is computed. You can't use `WHERE` on a computed value like `comment_count` because it doesn't exist until after `GROUP BY` runs.

```ruby
# ❌ Can't filter on comment_count with WHERE — it doesn't exist yet at that stage
Post.left_joins(:comments)
    .group('posts.id')
    .where('comment_count > 5')  # will raise an error

# ✅ Use HAVING to filter on the aggregated result
Post.left_joins(:comments)
    .group('posts.id')
    .having('COUNT(comments.id) > 5')
    .select('posts.*, COUNT(comments.id) AS comment_count')
```

A realistic use: find power users whose posts have received more than 10 comments on average.

```ruby
User.joins(posts: :comments)
    .group('users.id')
    .having('COUNT(comments.id) > 10')
    .select('users.*, COUNT(comments.id) AS total_comments_received')
```

The rule: use `WHERE` to filter rows before grouping (on real columns), use `HAVING` to filter on computed aggregate values.

---

#### The PostgreSQL rule: every selected column must be grouped or aggregated

When you list individual columns in `select`, PostgreSQL (and strict SQL databases) require that every non-aggregate column appears in `GROUP BY`. SQLite is more lenient and will let this slide, which makes it a common gotcha when deploying to production.

```ruby
# ❌ Will fail in PostgreSQL — post.title and post.user_id are selected but not in GROUP BY
.group('posts.id').select('posts.id, posts.title, posts.user_id, COUNT(comments.id)')

# ✅ Use posts.* — PostgreSQL allows this because id is the primary key (all columns are functionally dependent on it)
.group('posts.id').select('posts.*, COUNT(comments.id) AS comment_count')

# ✅ Or list every selected column in GROUP BY
.group('posts.id', 'posts.title', 'posts.user_id').select('posts.id, posts.title, posts.user_id, COUNT(comments.id) AS comment_count')
```

`posts.*` works in PostgreSQL when you're grouping by the primary key because the database knows all other post columns are uniquely determined by `posts.id`.

---

#### Decision tree

```
Do I want one number for the entire query?
  YES → .count / .sum / .average alone (no group needed)

Do I want a number per record?
  YES → group('table.id') + COUNT/SUM/etc in select, or group + .count/.sum (returns hash)

Do I need to filter based on that computed number?
  YES → add .having('COUNT(...) > N') after group

Am I getting inflated counts after a join?
  → Add group, or add .distinct if you just need deduplicated records
```

**Interview tip:** "When I need a per-record aggregate — like comment count per post — I reach for `left_joins` + `group` + `COUNT` in a custom `select`. If I just need a hash of totals, I use `group(:column).count`. If I need to filter on the aggregate, I add `having`."

---

## Exercise 6: Post feed with SQL-computed comment counts

Add `GET /api/v1/posts/feed` — returns all published posts, each with a `comment_count` computed in SQL. Posts with zero comments should still appear.

Add the route as a collection action alongside Exercise 5:

```ruby
resources :posts do
  collection do
    get :commented_on
    get :feed
  end
end
```

The response for each post should include: id, title, author name, status, and `comment_count`.

**What to think through before writing the query:**

You need one query that returns post data plus a per-post comment count. The challenge is that computing this in Ruby (loading posts, then calling `post.comments.count` in a loop) fires N+1 queries. You want the database to do the counting.

**Guiding questions:**

1. Why must you use `left_joins` instead of `joins` here? What happens to posts with zero comments if you use an INNER JOIN?
2. After `left_joins`, a post with 3 comments appears 3 times in the flat result. What do you add to collapse those rows into one per post?
3. `COUNT(comments.id)` vs `COUNT(*)` — for posts with zero comments, `left_joins` produces a row with `NULL` in the comment columns. Which COUNT correctly returns 0 for those posts, and why?
4. You want `post.comment_count` to be accessible in Ruby on the returned objects. What two things do you need in the query to make that work?
5. You still need `post.user.name` in the response. Does `left_joins` + `group` load the user into memory? What do you add so you're not firing an N+1 on users?

---

## Exercise 7: Popular posts

Add `GET /api/v1/posts/popular?min_comments=2` — returns published posts that have received at least `min_comments` comments. Default to 1 if the param isn't sent (at least one comment means someone engaged).

Add the route:

```ruby
resources :posts do
  collection do
    get :commented_on
    get :feed
    get :popular
  end
end
```

The response should include: id, title, author name, and `comment_count`.

**What to think through before writing the query:**

This builds directly on Exercise 6 — you need comment counts per post — but now you also need to filter _on_ that count. That's the key new wrinkle: `comment_count` doesn't exist as a real column, so you can't filter it the normal way.

**Guiding questions:**

1. Why can't you add `.where('comment_count >= ?', min_comments)` after the `group`? What does Rails complain about, and why?
2. `having` takes a raw SQL string. Write the condition to filter on the comment count — what does that string look like?
3. Should `published` scope go before or after `group`? Does the order matter for correctness, or is it just style?
4. `params[:min_comments]` comes in as a string from the URL. What do you need to do before passing it to `having`?

---

### Counting in SQL vs Ruby — always prefer SQL

Every aggregate should happen in the database, not in Ruby.

```ruby
# ❌ Loads every post record into Ruby memory as ActiveRecord objects, then counts them
user.posts.to_a.length   # SELECT * FROM posts WHERE user_id = 10  (loads everything)

# ✅ Runs COUNT(*) in the database — one number comes back, no records loaded
user.posts.count         # SELECT COUNT(*) FROM posts WHERE user_id = 10

# ❌ Same mistake with sum — loads all records into memory
user.posts.map(&:view_count).sum

# ✅ SUM in SQL
user.posts.sum(:view_count)  # SELECT SUM(view_count) FROM posts WHERE user_id = 10
```

The performance gap isn't academic. If the user has 50,000 posts, `.to_a.length` loads 50,000 AR objects into memory. `.count` returns a single integer. Use `.count`, `.sum`, `.average`, `.minimum`, `.maximum` — all push the work to SQL.

**`.size` vs `.count` — one subtle difference:**

```ruby
posts = user.posts.to_a   # already loaded into memory
posts.size    # ✅ reads from memory, no query (smart)
posts.count   # ❌ fires another COUNT(*) query even though posts are loaded
```

If you've already loaded the records (e.g., to render them), use `.size` — it checks memory first and only queries if needed. If you only need the number, use `.count`.

---

### `select` with virtual attributes

When you add computed columns with `AS`, Rails doesn't know about them as model attributes — but it will expose them as method calls on the object. This only works if the column appears in `SELECT`.

```ruby
posts = Post.left_joins(:comments)
            .group('posts.id')
            .select('posts.*, COUNT(comments.id) AS comment_count')

post = posts.first
post.comment_count   # ✅ works — Rails reads it from the result set
post.title           # ✅ works — real column
Post.first.comment_count  # ❌ nil — this post wasn't loaded with that SELECT
```

Virtual attributes only exist on objects loaded by that specific query. Don't pass these objects around and expect them to carry those extra attributes everywhere.

---

### `merge` — use another model's scopes through a join

`merge` lets you apply one model's scopes when querying through a join to that model. Without it, you'd have to write raw column conditions that belong in the other model.

```ruby
# Without merge — condition leaks out of User model
Post.joins(:user).where(users: { role: 'admin' }).published

# With merge — keep User conditions in User
Post.joins(:user).merge(User.admins).published
# where User.admins is: scope :admins, -> { where(role: 'admin') }
```

Both generate the same SQL. The difference is maintainability: if the definition of "admin" changes, you change it in one place (the `User` model), not everywhere it's referenced.

```ruby
# A realistic example: posts by verified users, published, with comment counts
Post.joins(:user)
    .merge(User.verified)
    .published
    .left_joins(:comments)
    .group('posts.id')
    .select('posts.*, COUNT(comments.id) AS comment_count')
    .recent
```

Each piece is independently readable and each condition lives in the right model.

---

## Exercise 8: Posts by engaged users

First, add a scope to the `User` model:

```ruby
scope :with_comments, -> { joins(:comments).distinct }
```

This scope returns users who have left at least one comment anywhere on the platform.

Then add `GET /api/v1/posts/by_engaged_users` — returns published posts written by users who have the `with_comments` scope (i.e., users who have engaged with the platform by commenting).

Add the route:

```ruby
resources :posts do
  collection do
    get :commented_on
    get :feed
    get :popular
    get :by_engaged_users
  end
end
```

The response should include: id, title, author name, and status.

**What to think through before writing the query:**

You're filtering posts based on a property of their author — specifically, whether that author has commented on anything. The condition (has comments) lives logically on the `User` model. `merge` lets you apply that scope without leaking user-table conditions into the posts query.

**Guiding questions:**

1. Without `merge`, how would you write this filter inline? What's wrong with that approach if the definition of "engaged user" changes later?
2. `merge(User.with_comments)` requires that posts already be joined to users. What method creates that join, and which JOIN type should it be — INNER or LEFT?
3. The `User.with_comments` scope itself uses `joins(:comments).distinct`. When you compose this with `Post.joins(:user).merge(User.with_comments)`, how many tables are being joined in the final SQL?
4. After writing this, check the query with `.to_sql` in the Rails console. Read the generated SQL and verify it matches your mental model.

---

### Putting it together — reading a complex query

When you encounter a chain like this, read it in layers:

```ruby
Post.left_joins(:comments)
    .joins(:user)
    .merge(User.active)
    .where('comments.created_at > ?', 1.week.ago)
    .group('posts.id')
    .select('posts.*, COUNT(comments.id) AS recent_comment_count')
    .order('recent_comment_count DESC')
    .limit(10)
```

1. **What's the base table?** `posts`
2. **What's being joined?** Comments (left join — keep posts with 0 comments) and users (inner join — only posts with a user)
3. **What's being filtered?** Only active users (`merge`), only comments from the last week
4. **How is it being grouped?** One bucket per post
5. **What's being computed?** Count of recent comments per post
6. **How is it sorted and limited?** Most recently commented posts first, top 10

This is the mental order: shape → filter → group → aggregate → sort → limit.

---

## Exercise 4: User dashboard query

Add a `GET /api/v1/users/:id/stats` endpoint that returns:

```json
{
  "total_posts": 5,
  "published_posts": 3,
  "draft_posts": 2,
  "total_comments_received": 12
}
```

**Guiding questions:**

1. Should you use `.length` or `.count` for each stat? What SQL does each produce?
2. For `total_comments_received`, comments belong to posts, not directly to the user. How do you count across that join?
3. How many database queries does your implementation fire? Can you get it down?

---

## ActiveRecord Interview Checklist

When talking through a query in an interview:

- [ ] Will this produce N+1? (Do I need `includes`?)
- [ ] Am I loading more data than I need? (Use `select` to limit columns)
- [ ] Should this be a scope? (Will I reuse this condition?)
- [ ] Do multiple writes need to be atomic? (Wrap in a transaction, use bang methods)
- [ ] Am I counting in Ruby or in SQL? (Always prefer SQL)
- [ ] Does this logic belong in a controller, or in a service?
- [ ] Am I filtering by an association or loading it? (`joins` vs `includes`)
- [ ] Do I need records with zero children included? (`left_joins` not `joins`)
- [ ] Am I filtering on a computed aggregate? (`having`, not `where`)
- [ ] Is a condition leaking out of the model it belongs in? (`merge`)

Move on to Lesson 3 once you can:

1. Explain N+1 and fix it with `includes`
2. Know when to use `joins` vs `includes`, and when `eager_load` is right
3. Write and call a service object from a controller
4. Wrap multiple writes in a transaction with bang methods
5. Chain scopes to build conditional queries
6. Use `left_joins` + `group` + `select` to compute per-record aggregates in SQL
7. Know when `WHERE` won't work and you need `HAVING` instead
8. Apply another model's scope through a join with `merge`

---

## Reference — Check Your Work

Once you've attempted all exercises, compare your implementation against these.

### Exercise 1: Fixed N+1

```ruby
def index
  post = Post.find(params[:post_id])
  comments = post.comments.includes(:author)
  render json: comments.map { |c| { body: c.body, author: c.author.name } }
end
```

### Exercise 2: Filtered index

```ruby
def index
  posts = if params[:status].present?
            current_user.posts.by_status(params[:status])
          else
            Post.published
          end.includes(:user, :comments).recent

  render json: posts.map { |post|
    {
      id: post.id,
      title: post.title,
      author: post.user.name,
      comment_count: post.comments.size
    }
  }
end
```

Notice the pattern: decide the base relation first, then chain `includes` and `recent` at the end — they apply to whichever branch was taken.

### Exercise 3: Publish service with transaction

```ruby
# app/services/post_publish_service.rb
class PostPublishService
  def initialize(post, user)
    @post = post
    @user = user
  end

  def call
    raise ArgumentError, 'Not authorized' unless @post.user == @user

    ActiveRecord::Base.transaction do
      @post.update!(status: 'published')
      AuditLog.create!(action: 'published', post: @post, user: @user)
    end

    true
  rescue ActiveRecord::RecordInvalid
    false
  end
end
```

Controller wiring:

```ruby
def publish
  post = current_user.posts.find(params[:id])

  if PostPublishService.new(post, current_user).call
    render json: post.reload   # reload because the service updated it in the DB
  else
    render json: { error: 'Could not publish post' }, status: :unprocessable_entity
  end
rescue ActiveRecord::RecordNotFound
  render json: { error: 'Post not found' }, status: :not_found
end
```

### Exercise 4: User dashboard queries

```ruby
def stats
  user = User.find(params[:id])

  render json: {
    total_posts:              user.posts.count,
    published_posts:          user.posts.published.count,
    draft_posts:              user.posts.draft.count,
    total_comments_received:  Comment.joins(:post).where(posts: { user_id: user.id }).count
  }
end
```

Each `.count` runs a `COUNT(*)` in SQL — no records are loaded into Ruby memory.

---

### Exercise 5: Posts the current user has commented on

```ruby
# config/routes.rb
resources :posts do
  collection do
    get :commented_on
  end
end
```

```ruby
# app/controllers/api/v1/posts_controller.rb
def commented_on
  posts = Post.joins(:comments)
              .where(comments: { user_id: current_user.id })
              .distinct
              .includes(:user)
              .recent

  render json: posts.map { |post|
    {
      id: post.id,
      title: post.title,
      status: post.status,
      author: post.user.name
    }
  }
end
```

`joins(:comments)` does an INNER JOIN — only posts that have at least one comment come through. `.where(comments: { user_id: current_user.id })` narrows that to comments by this user. `.distinct` collapses duplicate post rows when a user commented multiple times on the same post.

`includes(:user)` is still needed — `joins` does not load the user into memory, and `post.user.name` in the render loop would fire N+1 without it.

---

### Exercise 6: Post feed with SQL-computed comment counts

```ruby
# config/routes.rb
collection do
  get :feed
end
```

```ruby
# app/controllers/api/v1/posts_controller.rb
def feed
  posts = Post.published
              .left_joins(:comments)
              .joins(:user)
              .group('posts.id')
              .select('posts.*, COUNT(comments.id) AS comment_count')
              .recent

  render json: posts.map { |post|
    {
      id: post.id,
      title: post.title,
      status: post.status,
      author: post.user.name,
      comment_count: post.comment_count
    }
  }
end
```

`left_joins(:comments)` keeps posts with zero comments (they get `NULL` in comment columns; `COUNT(comments.id)` returns 0 for them). `joins(:user)` is an INNER JOIN — every post has a user, so this is safe and means `post.user` is available without a separate query (the user columns come back in `posts.*`... actually no — `joins` does `SELECT posts.*`, user columns aren't included).

Wait — `joins(:user)` brings user columns through only if you select them. Since we `select('posts.*')`, user data is not in memory. We need `includes(:user)` for that:

```ruby
def feed
  posts = Post.published
              .left_joins(:comments)
              .includes(:user)
              .group('posts.id')
              .select('posts.*, COUNT(comments.id) AS comment_count')
              .recent

  render json: posts.map { |post|
    {
      id: post.id,
      title: post.title,
      status: post.status,
      author: post.user.name,
      comment_count: post.comment_count
    }
  }
end
```

`post.comment_count` works because `AS comment_count` names the computed column and Rails exposes it as a method on each returned object.

---

### Exercise 7: Popular posts

```ruby
# config/routes.rb
collection do
  get :popular
end
```

```ruby
# app/controllers/api/v1/posts_controller.rb
def popular
  min = (params[:min_comments] || 1).to_i

  posts = Post.published
              .left_joins(:comments)
              .includes(:user)
              .group('posts.id')
              .having('COUNT(comments.id) >= ?', min)
              .select('posts.*, COUNT(comments.id) AS comment_count')
              .recent

  render json: posts.map { |post|
    {
      id: post.id,
      title: post.title,
      author: post.user.name,
      comment_count: post.comment_count
    }
  }
end
```

`WHERE` can't reference `comment_count` because that value doesn't exist until after `GROUP BY` runs. `HAVING` operates on the already-bucketed result, so it can filter on the aggregate. The `?` placeholder handles the sanitization — always pass user input this way, never interpolate it directly into the string.

---

### Exercise 8: Posts by engaged users

```ruby
# app/models/user.rb
scope :with_comments, -> { joins(:comments).distinct }
```

```ruby
# config/routes.rb
collection do
  get :by_engaged_users
end
```

```ruby
# app/controllers/api/v1/posts_controller.rb
def by_engaged_users
  posts = Post.published
              .joins(:user)
              .merge(User.with_comments)
              .includes(:user)
              .recent

  render json: posts.map { |post|
    {
      id: post.id,
      title: post.title,
      status: post.status,
      author: post.user.name
    }
  }
end
```

`joins(:user)` creates the bridge to the users table. `merge(User.with_comments)` then applies the `with_comments` scope — which itself joins users to comments — through that bridge. The final SQL joins three tables: posts → users → comments. The condition "user must have at least one comment" is defined in the User model and stays there; if the definition of "engaged" changes, you update `with_comments` in one place.

`includes(:user)` is still needed for `post.user.name` — `joins` does not load the association into memory.

To inspect the full generated SQL in the console:

```ruby
Post.published.joins(:user).merge(User.with_comments).to_sql
```

---

## Helpers

### `rails routes`

```bash
rails routes
# filter by resource:
rails routes | grep comments
```

When you're confused about what `params` keys are available, `rails routes` shows you the URL patterns Rails generates. For nested resources it makes param naming obvious:

```
GET    /api/v1/posts/:post_id/comments      api/v1/comments#index
POST   /api/v1/posts/:post_id/comments      api/v1/comments#create
DELETE /api/v1/posts/:post_id/comments/:id  api/v1/comments#destroy
```

The `:post_id` in the URI pattern is exactly what ends up in `params[:post_id]`. The innermost resource always gets `params[:id]` — everything above it gets `params[:resource_name_id]`.
</thinking>
