# Lesson 2 — ActiveRecord: Queries, Includes/Joins, Transactions

## The Mental Model

ActiveRecord is a **translator**. You write Ruby, it writes SQL.

```ruby
Post.where(status: 'published').order(created_at: :desc).limit(10)
# SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 10
```

Two things to keep in mind:

1. **Queries are lazy** — they don't hit the database until you iterate or call `.to_a`, `.first`, etc.
2. **Objects are not data** — an ActiveRecord object is an in-memory Ruby object backed by a DB row. When you associate objects, Rails makes more queries unless you tell it not to.

---

## Part 1: The N+1 Problem — The Most Common Interview Topic

### What is N+1?

Imagine you have 10 posts and you want to show each post's author name.

```ruby
# This looks innocent:
posts = Post.all
posts.each { |post| puts post.user.name }
```

What actually happens:

```sql
SELECT * FROM posts;                    -- 1 query
SELECT * FROM users WHERE id = 1;      -- query for post 1's user
SELECT * FROM users WHERE id = 2;      -- query for post 2's user
SELECT * FROM users WHERE id = 3;      -- query for post 3's user
-- ... N more queries for N posts
```

That's **N+1 queries**: 1 for the list + N for each association. With 100 posts, it's 101 queries. With 10,000 posts, your page times out.

### The Fix: `includes`

```ruby
posts = Post.includes(:user).all
posts.each { |post| puts post.user.name }
```

What actually happens now:

```sql
SELECT * FROM posts;
SELECT * FROM users WHERE id IN (1, 2, 3, ...);   -- 1 query for ALL users
```

Rails loads all users in one shot and holds them in memory. `post.user` now reads from memory, not the database.

### When to use `includes` vs `joins`

|                         | `includes`                          | `joins`                           |
| ----------------------- | ----------------------------------- | --------------------------------- |
| **Purpose**             | Load associated records into memory | Filter/sort by associated data    |
| **Queries**             | 2 queries (or 1 with eager_load)    | 1 query (SQL JOIN)                |
| **Access association?** | Yes, in memory                      | Only for filtering, not rendering |
| **Use when**            | You'll render association data      | You need WHERE on another table   |

```ruby
# includes — load posts AND their users for rendering
Post.includes(:user).all

# joins — filter posts WHERE user.name = 'Alice' (don't need user data itself)
Post.joins(:user).where(users: { name: 'Alice' })

# Both together — filter by user AND render user data
Post.joins(:user).includes(:user).where(users: { name: 'Alice' })
# Or more concisely:
Post.eager_load(:user).where(users: { name: 'Alice' })
```

**Interview tip:** "I use `includes` when I need to render associated data. I use `joins` when I need to filter or sort by a column on the associated table. If I need both, `eager_load` does a single LEFT JOIN and loads the association."

---

## Exercise 1: Find and Fix an N+1

Add a `comments` endpoint that returns all comments with their author and post title.

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

1. Which line causes a database query on every iteration of the loop? How would you tell Rails to load those records upfront instead?

- it should be `author.name` which would cause an iteration after every loop because the `comments` doesn't have the `author` within the scope of that `comments` object

2. After you add `includes`, what SQL does Rails produce? How many queries does it take now regardless of how many comments exist?

- it should produce 2, one in which it gets all of the required posts, and then the second one that does the `WHERE in`

---

## Part 2: Scopes — Reusable, Chainable Queries

Scopes are named query fragments that live on the model. They're chainable:

```ruby
# Already in app/models/post.rb:
scope :published, -> { where(status: 'published') }
scope :recent,    -> { order(created_at: :desc) }
scope :by_author, ->(user) { where(user: user) }
scope :draft,     -> { where(status: 'draft') }

# Chain them freely:
Post.published.recent.limit(5)
Post.by_author(current_user).draft
```

Scopes are just class methods that return a relation — so they're always chainable.

**When to use a scope vs a where:**

- Use a scope when you'll reuse the condition in multiple places
- Use an inline `where` for one-off conditions

**Interview tip:** "I define scopes for business concepts like `published` or `by_author`
because they make the code read like the domain, not like SQL."

---

## Exercise 2: Add a filtered index

Update `PostsController#index` to accept a `status` query param:

```
GET /api/v1/posts?status=draft    → returns only draft posts by current user
GET /api/v1/posts                 → returns all published posts (default)
```

Use scopes to build this. Don't write raw SQL strings.

**Guiding questions:**

1. How do you check whether a query param was actually sent in the request, versus an empty or missing value?
2. How do you conditionally apply different scopes based on that check — without duplicating the `includes` and `recent` calls?
3. When the `status` param is present, why should the results be scoped to `current_user`? What would happen if you showed all users' drafts?

---

## Part 3: Transactions — All or Nothing

A transaction wraps multiple DB operations so they either **all succeed or all fail together**.

```ruby
# Without a transaction — dangerous
post.update!(status: 'published')
ActivityLog.create!(action: 'published', record: post)
# If the second line fails, the post is published but nothing was logged!

# With a transaction — safe
ActiveRecord::Base.transaction do
  post.update!(status: 'published')
  ActivityLog.create!(action: 'published', record: post)
  # If anything raises here, BOTH operations are rolled back
end
```

The key: use **bang methods** (`save!`, `update!`, `create!`) inside transactions — they raise on failure, triggering the rollback. Non-bang methods return false and don't trigger rollback.

### When do you need a transaction?

Whenever you have **two or more writes that must succeed together**:

- Publishing a post + creating an audit log entry
- Transferring money: debit account A + credit account B
- Creating an order + decrementing inventory

**Interview tip:** "Any time I have two writes that need to be atomic, I wrap them in a transaction. I use bang methods inside so any failure automatically rolls everything back."

---

## Exercise 3: Build a publish service with a transaction

Create `app/services/post_publish_service.rb` with an `initialize(post, user)` and a `call` method.

**What it should do:**

- Ensure only the author can publish the post
- Wrap the status update in a transaction
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

1. What two operations need to succeed together inside your transaction? What happens to the post's status if the second operation fails without a transaction?
2. Inside the transaction, should you use `save` or `save!` (and `update` or `update!`)? Why does the choice matter for triggering rollback?
3. How does the controller know whether the service succeeded so it can render the right response?

---

## Part 4: Complex Queries — joins, select, group

### Finding posts with comments by a specific user

```ruby
# Posts that alice has commented on
Post.joins(:comments).where(comments: { user_id: alice.id }).distinct
```

### Counting with group

```ruby
# Comment counts per post
Post.left_joins(:comments).group('posts.id').select('posts.*, COUNT(comments.id) as comment_count')
# Now each post has a .comment_count attribute
```

### `merge` — combining scopes across associations

```ruby
# Published posts by alice
Post.joins(:user).merge(User.where(name: 'Alice')).published
```

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

1. Should you load all posts into Ruby and call `.length`, or let the database count them? What's the difference in SQL produced by `.length` vs `.count`?
2. For `total_comments_received`, comments don't belong directly to the user — they belong to posts. How do you count across that join?
3. How many database queries does your implementation use? Can you reduce it?

---

## ActiveRecord Interview Checklist

When talking through a query in an interview:

- [ ] Will this produce N+1? (Do I need `includes`?)
- [ ] Am I loading more data than needed? (Use `select` to limit columns)
- [ ] Should this be a scope? (Will I reuse it?)
- [ ] Do multiple writes need to be atomic? (Wrap in transaction)
- [ ] Am I counting in Ruby or in SQL? (Always prefer SQL for counts/sums)

Move on to **Lesson 3** once you can:

1. Explain N+1 and fix it with `includes`
2. Know when to use `joins` vs `includes`
3. Write a service with a transaction using bang methods
4. Chain scopes to build queries

---

## Reference — Check Your Work

Once you've attempted all exercises, compare your implementation against these patterns.

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
            current_user.posts.where(status: params[:status])
          else
            Post.published
          end.includes(:user, :comments).recent

  render json: posts.map { |post| serialize_post(post) }
end
```

Notice the pattern: start with a base relation, layer conditions, then call `.includes` at the end.

### Exercise 3: Publish service with transaction

```ruby
class PostPublishService
  def initialize(post, user)
    @post = post
    @user = user
  end

  def call
    # Ensure only the author can publish
    raise ArgumentError, 'Not authorized' unless @post.user == @user

    ActiveRecord::Base.transaction do
      @post.update!(status: 'published')
      # In a real app: AuditLog.create!(user: @user, action: 'publish', target: @post)
      # For now, we just demonstrate the pattern
    end

    true
  rescue ActiveRecord::RecordInvalid => e
    false
  end
end
```

Controller wiring:

```ruby
def publish
  post = current_user.posts.find(params[:id])
  if PostPublishService.new(post, current_user).call
    render json: post.reload
  else
    render json: { error: 'Could not publish post' }, status: :unprocessable_entity
  end
rescue ActiveRecord::RecordNotFound
  render json: { error: 'Post not found' }, status: :not_found
end
```

### Exercise 4: User dashboard queries

```ruby
# Efficient — let the DB count
user.posts.count                    # total
user.posts.published.count          # published
user.posts.draft.count              # draft
Comment.joins(:post).where(posts: { user_id: user.id }).count  # comments on their posts
```

---

## Class vs Instance Methods — Why `Post.comments` Doesn't Work

This trips up a lot of beginners. Here's the mental model.

### The Blueprint vs The House

Think of a Rails model like a **blueprint**:

```
Post   ← the blueprint (the class)
post   ← an actual house built from that blueprint (an instance)
```

You wouldn't ask a blueprint "show me your rooms" — it doesn't have rooms, it's just a design. You'd ask a **specific house** built from that blueprint.

```ruby
Post          # the blueprint — exists in memory, no data attached
Post.find(1)  # "build me the house at address #1" — returns a real object with data
```

### Class methods vs Instance methods

```ruby
# CLASS methods — called on the blueprint itself
# Rails defines these for you:
Post.all          # give me all posts
Post.find(1)      # give me post #1
Post.where(...)   # give me posts matching a condition

# INSTANCE methods — called on a specific post object
post = Post.find(1)
post.title        # what's this post's title?
post.comments     # what are this post's comments?
post.author       # who wrote this post?
```

`has_many :comments` in your model adds `.comments` to **instances only**. Rails has no way of knowing which post's comments you want if you ask `Post.comments` — the question doesn't make sense without a specific post.

### The only exception — scopes

Scopes are intentionally defined at the class level because they apply to *all* posts:

```ruby
scope :published, -> { where(status: 'published') }

Post.published   # ✅ makes sense — "give me all published posts"
post.published   # ❌ doesn't make sense — you already have one specific post
```

### A common mistake and how to spot it

```ruby
# ❌ Wrong — asking the blueprint for comments
comments = Post.comments

# ✅ Right — find the specific post first, then ask for its comments
post = Post.find(params[:post_id])
comments = post.comments
```

If you ever see `NoMethodError: undefined method 'x' for Post:Class`, that's Rails telling you: "you're calling an instance method on the class itself." The fix is almost always: find the record first, then call the method on it.

---

## Helpers

### `rails routes`

```bash
rails routes
# or filter by resource:
rails routes | grep comments
```

When you're confused about what `params` keys are available in a controller, `rails routes` shows you the actual URL patterns Rails generates. For nested resources it makes the param naming obvious:

```
GET  /api/v1/posts/:post_id/comments      api/v1/comments#index
POST /api/v1/posts/:post_id/comments      api/v1/comments#create
DELETE /api/v1/posts/:post_id/comments/:id api/v1/comments#destroy
```

The `:post_id` in the URI pattern is exactly what ends up in `params[:post_id]`. The innermost resource always gets plain `params[:id]` — everything above it gets `params[:resource_name_id]`.
