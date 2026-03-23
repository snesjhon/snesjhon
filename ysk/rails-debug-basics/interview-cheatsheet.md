# Rails Interview Cheat Sheet

---

## 1. CRUD / REST API

### HTTP Verbs & Status Codes

| Action  | Verb   | Path       | Success | Error         |
|---------|--------|------------|---------|---------------|
| index   | GET    | /posts     | 200     | —             |
| show    | GET    | /posts/:id | 200     | 404           |
| create  | POST   | /posts     | 201     | 422           |
| update  | PATCH  | /posts/:id | 200     | 404, 422      |
| destroy | DELETE | /posts/:id | 204     | 404           |

- **200** OK · **201** Created · **204** No Content · **404** Not Found · **422** Unprocessable Entity
- 400 = malformed request. 422 = valid request but failed validation. Know the difference.

### Key Patterns

```ruby
# Strong params — allowlist only
params.require(:post).permit(:title, :body, :status)

# Build from association — user_id set by server, not client
current_user.posts.build(post_params)  # ✅
Post.new(post_params)                  # ❌ user_id could be spoofed

# Scoped find — authorization AND 404 in one
current_user.posts.find(params[:id])   # raises 404 if not theirs
Post.find(params[:id])                 # ❌ finds anyone's post

# Status codes
render json: post, status: :created                                          # 201
render json: { errors: post.errors.full_messages }, status: :unprocessable_entity  # 422
render json: { error: 'not found' }, status: :not_found                     # 404
head :no_content                                                             # 204 destroy

# before_action — DRY shared setup
before_action :set_post, only: [:show, :update, :destroy]
# if set_post renders, the action itself is skipped
```

### Routing

```ruby
namespace :api do
  namespace :v1 do
    resources :posts, only: [:index, :show, :create, :update, :destroy] do
      member     { patch :publish }   # /posts/:id/publish — needs an ID
      collection { get :archived }    # /posts/archived    — no ID
    end
  end
end
```

---

## 2. ActiveRecord

### N+1 — The #1 Performance Gotcha

```ruby
# BAD — fires 1 + N queries
posts = Post.all
posts.each { |p| puts p.user.name }  # query per post

# GOOD — 2 queries total
posts = Post.includes(:user).all
posts.each { |p| puts p.user.name }  # reads from memory
```

### includes vs joins vs eager_load

| | `includes` | `joins` | `eager_load` |
|---|---|---|---|
| Purpose | Load assoc into memory | Filter/sort by assoc | Filter AND load into memory |
| Queries | 2 | 1 (INNER JOIN) | 1 (LEFT JOIN) |
| Access assoc in loop? | ✅ Yes | ❌ No (N+1!) | ✅ Yes |
| Use when | Rendering assoc data | WHERE on another table | Both filter + render |

```ruby
# Filter by assoc + render assoc data — use eager_load
Post.eager_load(:user).where(users: { verified: true })

# Filter only, no rendering — joins is enough
Post.joins(:user).where(users: { verified: true })

# ❌ Common trap — joins doesn't load, N+1 follows
posts = Post.joins(:user).where(users: { verified: true })
posts.each { |p| puts p.user.name }  # still fires a query per post!
```

### Scopes

```ruby
scope :published, -> { where(status: 'published') }
scope :recent,    -> { order(created_at: :desc) }

Post.published.recent.limit(5)  # chainable, one SQL query

# params check — always use .present?, not .nil?
params[:status].present?  # true if non-nil AND non-blank
```

### Transactions — All or Nothing

```ruby
ActiveRecord::Base.transaction do
  post.update!(status: 'published')      # ✅ bang — raises on failure → rollback
  AuditLog.create!(action: 'published')  # ✅ bang
  # post.update(...)                     # ❌ returns false, no rollback
end
```

- Use bang methods (`save!`, `update!`, `create!`) inside transactions
- Non-bang methods return false silently — the transaction won't roll back

### Service Objects

```ruby
# app/services/post_publish_service.rb
class PostPublishService
  def initialize(post, user) = @post, @user = post, user

  def call
    raise ArgumentError, 'Not authorized' unless @post.user == @user
    ActiveRecord::Base.transaction do
      @post.update!(status: 'published')
      AuditLog.create!(action: 'published', post: @post)
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end
end

# Controller stays thin
result = PostPublishService.new(post, current_user).call
```

### Complex Queries

```ruby
# Count comments per post (no N+1)
Post.left_joins(:comments)
    .group('posts.id')
    .select('posts.*, COUNT(comments.id) AS comment_count')

# pluck — DB values only, no object instantiation
post.comments.distinct.pluck(:user_id)  # [1, 2, 3]

# Distinct — collapse duplicates from joins
Post.joins(:comments).where(comments: { user_id: 1 }).distinct

# left_joins — keeps posts with zero comments (INNER JOIN would drop them)
Post.left_joins(:comments)
```

---

## 3. Background Jobs (ActiveJob + Sidekiq)

### Core Rule: Pass IDs, Not Objects

```ruby
# ❌ Wrong — object serialized to Redis, may be stale or deleted
CommentNotificationJob.perform_later(comment)

# ✅ Right — re-fetch inside perform, always fresh data
CommentNotificationJob.perform_later(comment.id)
```

### Job Anatomy

```ruby
class CommentNotificationJob < ApplicationJob
  queue_as :notifications

  discard_on ActiveRecord::RecordNotFound        # record deleted — retrying won't help
  retry_on Net::OpenTimeout, wait: 5.seconds, attempts: 3  # transient — retry

  def perform(comment_id)
    comment = Comment.find(comment_id)  # re-fetch fresh
    # do work
  end
end
```

### perform_later vs perform_now

```ruby
CommentNotificationJob.perform_later(id)  # async, non-blocking — use this
CommentNotificationJob.perform_now(id)    # sync, blocks request — tests/rake only
```

### Enqueue AFTER the transaction, not inside it

```ruby
# ❌ Inside transaction — job may run before commit, or after rollback
ActiveRecord::Base.transaction do
  post.update!(status: 'published')
  PostPublishJob.perform_later(post.id)  # dangerous
end

# ✅ After transaction commits
ActiveRecord::Base.transaction { post.update!(status: 'published') }
PostPublishJob.perform_later(post.id)
```

### Idempotency — safe to run twice

```ruby
# ❌ Bad — sends 2 emails on duplicate run
user.send_welcome_email!

# ✅ Good — guard against duplicate execution
return if user.welcome_email_sent_at.present?
user.send_welcome_email!
user.update!(welcome_email_sent_at: Time.current)
```

### Queue Priority

```ruby
queue_as :critical   # billing, auth
queue_as :default    # notifications
queue_as :low        # reports, exports
```

---

## 4. AWS

### S3 — Two Upload Patterns

**Server-side** (client → Rails → S3)
- Simple, but large files block your server
- Good for: small files, or when you need to process before storing

**Presigned URL** (client → S3 directly) — preferred
- Rails generates a signed URL, client uploads straight to S3
- Server never touches file bytes — stays free for other requests
- URL expires (e.g. 15 min), scoped to one key

```
1. Client: POST /api/v1/upload_url { filename, content_type }
2. Rails: generates presigned PUT URL + key → returns both
3. Client: PUT <presigned_url> with file bytes directly to S3
4. Client: POST /api/v1/posts { avatar_key }
5. Rails: saves key to DB → 200 OK
```

### IAM Credentials — Best to Worst

1. **IAM Role on EC2/ECS** — no keys at all, AWS SDK picks up automatically ✅ best
2. **Env vars** (`AWS_ACCESS_KEY_ID`) — gitignored `.env` locally, platform config in prod
3. **Rails credentials** (`rails credentials:edit`) — encrypted at rest, committable
4. **Hardcoded in code** — ❌ never. If it hits git, treat as compromised immediately

### Least Privilege — scope to only what's needed

```json
{
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::my-app-uploads/uploads/*"
}
// NOT "Action": "*", "Resource": "*" — that's full account access
```

### SQS vs Sidekiq

| | Sidekiq | SQS |
|---|---|---|
| Backed by | Redis (you manage) | AWS-managed, durable |
| Monitoring | Sidekiq Web UI | CloudWatch |
| Best for | High throughput, complex workflows | AWS-native, simple queuing |

**Visibility Timeout** — SQS hides a message while a worker processes it. If the worker crashes and doesn't delete the message, it reappears after the timeout and gets retried. Set it longer than your longest expected job runtime.

### Leaked Key Response (in order)

1. **Revoke the key immediately** — before investigating anything else
2. Check CloudTrail for unauthorized API calls
3. Rotate to a new key (or better: switch to IAM roles)
4. Purge from git history (`git filter-branch` or BFG)
5. Notify your security team

### Active Storage

```ruby
# model
has_one_attached :cover_image
has_many_attached :photos

# usage
post.cover_image.attach(io: file, filename: 'cover.jpg')
post.cover_image.url     # presigned GET URL
post.cover_image.attached?

# Under the hood: active_storage_blobs + active_storage_attachments (polymorphic)
# DB never stores file bytes — stores the S3 key
```

---

## Quick Gotcha Reference

| Gotcha | Wrong | Right |
|--------|-------|-------|
| N+1 | `Post.all` then `post.user` in loop | `Post.includes(:user)` |
| joins trap | `joins(:user)` then `post.user` in loop | `eager_load(:user)` |
| Ownership | `Post.find(params[:id])` in update | `current_user.posts.find(params[:id])` |
| Strong params | Accept all params | `params.require(:post).permit(...)` |
| Build | `Post.new(user_id: ...)` | `current_user.posts.build(...)` |
| Transaction | `post.update(...)` inside tx | `post.update!(...)` inside tx |
| Job args | `perform_later(comment)` | `perform_later(comment.id)` |
| Job timing | enqueue inside transaction | enqueue after transaction commits |
| AWS creds | hardcoded keys | IAM role or env vars |
| IAM policy | `"Action": "*"` | least privilege, specific actions + ARN |
| Delete status | 200 + body | `head :no_content` (204) |
| Missing record | crash | `rescue ActiveRecord::RecordNotFound` → 404 |
