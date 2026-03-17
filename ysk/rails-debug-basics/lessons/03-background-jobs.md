# Lesson 3 — Background Jobs (ActiveJob + Sidekiq)

## The Mental Model

An HTTP request has a budget: **~30 seconds** before most clients and load balancers time out.
Sending an email, resizing an image, generating a PDF, calling a slow API — none of these
should happen inside that budget.

**Background jobs** are work you hand off to a separate process:

```
HTTP Request → Controller → "put this job in the queue" → respond 200 immediately
                                           ↓
                                    Job Queue (Redis)
                                           ↓
                              Worker Process picks it up
                              and does the actual work
```

The user doesn't wait. The work still happens. The request stays fast.

---

## The Two Layers

**ActiveJob** = Rails abstraction layer. You write one Job class; it works with any queue backend.

**Sidekiq** = A real queue backend built on Redis. It's what actually processes jobs in production.

```
Your Code (ActiveJob) → Sidekiq (processes it) → Redis (stores the queue)
```

For interviews, you're expected to know both. ActiveJob for the Rails API; Sidekiq for the production reality (concurrency, retries, monitoring, queues).

---

## Setting Up (Lesson 3 additions)

First, uncomment the Sidekiq gem in your Gemfile:

```ruby
gem 'sidekiq', '~> 7.0'
```

Add to `config/application.rb`:

```ruby
config.active_job.queue_adapter = :sidekiq
```

In development, you can use `:async` (in-process, no Redis) for quick testing:

```ruby
# config/environments/development.rb
config.active_job.queue_adapter = :async
```

---

## Part 1: Defining a Job

```ruby
# app/jobs/comment_notification_job.rb
class CommentNotificationJob < ApplicationJob
  queue_as :default

  def perform(comment_id)
    comment = Comment.find_by(id: comment_id)
    return unless comment  # guard: record might be deleted by the time job runs

    # Do the work: send email, push notification, etc.
    # PostMailer.new_comment(comment).deliver_now
    Rails.logger.info "Notifying about comment #{comment_id} on post #{comment.post_id}"
  end
end
```

And to enqueue it:

```ruby
CommentNotificationJob.perform_later(comment.id)
```

---

## The Golden Rule: Pass IDs, Not Objects

This is the #1 thing interviewers check for.

```ruby
# WRONG — do not do this
CommentNotificationJob.perform_later(comment)

# RIGHT
CommentNotificationJob.perform_later(comment.id)
```

**Why?** Jobs are serialized to JSON and stored in Redis. ActiveRecord objects aren't JSON.
Rails uses "GlobalID" to serialize them automatically, but:

1. If the record is deleted between enqueue and execute, GlobalID deserialization raises
2. The serialized object may be stale — the DB record has changed but the job has the old data
3. It's a hidden coupling between job timing and record lifecycle

Always pass the ID. Re-fetch the record inside `perform`. Add a guard if it might be deleted.

**Interview tip:** "I always pass IDs to jobs and re-fetch inside perform. This way the job
always works with fresh data and gracefully handles deleted records."

---

## Part 2: retry_on and discard_on

By default, Sidekiq retries failed jobs 25 times with exponential backoff. You need to be
explicit about which errors should retry and which should be discarded.

```ruby
class CommentNotificationJob < ApplicationJob
  queue_as :default

  # Retry on transient failures (network blip, DB connection)
  retry_on Net::OpenTimeout, wait: 5.seconds, attempts: 3
  retry_on ActiveRecord::Deadlocked, wait: :polynomially_longer, attempts: 10

  # Discard if the record is gone — retrying won't help
  discard_on ActiveRecord::RecordNotFound

  def perform(comment_id)
    comment = Comment.find(comment_id)  # raises RecordNotFound if deleted → discarded
    # ...
  end
end
```

**Rules of thumb:**

- `retry_on` → transient errors that might resolve themselves (network, locks)
- `discard_on` → permanent errors where retrying is pointless (record deleted, invalid state)

**Idempotency** — design jobs so running them twice doesn't cause problems:

```ruby
# Bad: sends 2 emails if the job runs twice
user.send_welcome_email!

# Good: check if already done
return if user.welcome_email_sent_at.present?
user.send_welcome_email!
user.update!(welcome_email_sent_at: Time.current)
```

---

## Exercise 1: Build the CommentNotificationJob

Create `app/jobs/comment_notification_job.rb` with:

1. `queue_as :notifications`
2. `discard_on ActiveRecord::RecordNotFound`
3. `retry_on` for a transient error of your choice
4. A `perform(comment_id)` that re-fetches the comment and logs a notification

Then wire it into your comments controller so that creating a comment enqueues the job.

**Guiding questions:**

1. Where in the comments controller `create` action should you call `perform_later` — before or after saving the comment? Why does order matter?
2. Should the HTTP response wait for the job to finish before returning? Which method — `perform_later` or `perform_now` — achieves the non-blocking behavior you want?
3. If the comment gets deleted before the job runs, what happens with `discard_on ActiveRecord::RecordNotFound` in place versus without it?

---

## Part 3: Queue Strategy

Sidekiq supports multiple queues with different priorities:

```ruby
# config/sidekiq.yml
:queues:
  - [critical, 3]    # weight 3 — processed 3x more often
  - [default, 2]
  - [low, 1]
```

```ruby
class PaymentJob < ApplicationJob
  queue_as :critical   # billing must not be delayed
end

class ReportGenerationJob < ApplicationJob
  queue_as :low        # reports can wait
end
```

**Interview tip:** "I use multiple queues for priority. Critical work like payments goes on
`:critical`. Bulk operations like report generation go on `:low`. This prevents a backlog
of low-priority jobs from blocking urgent work."

---

## Exercise 2: Build a PostPublishNotificationJob

When a post is published (via your `PostPublishService` from Lesson 2), enqueue a job
that would notify all commenters on that post.

**What to build:**

- A `PostPublishNotificationJob` that accepts a `post_id`, re-fetches the post, finds all unique commenter IDs, and logs that it would notify them
- An update to `PostPublishService` to enqueue this job after publishing

**Guiding questions:**

1. Should you enqueue the job inside the transaction or after it commits? What happens if you enqueue inside and the transaction rolls back — does the job still run?
2. If the job runs and the post is not yet in `published` status (due to a race condition), how would you handle that gracefully inside `perform`?
3. How do you get distinct commenter IDs without loading all comment objects into memory?

---

## Part 4: perform_now vs perform_later

```ruby
# perform_later — puts job in the queue, returns immediately (use this almost always)
CommentNotificationJob.perform_later(comment.id)

# perform_now — runs the job synchronously in the current process (use for testing/debugging only)
CommentNotificationJob.perform_now(comment.id)
```

**When to use `perform_now`:**

- Tests (so you don't need a real queue)
- One-off rake tasks where you want to wait for completion

**When NOT to use `perform_now` in a controller:**

- Never. It blocks the HTTP request thread. It defeats the purpose of background jobs.

---

## Background Jobs Interview Checklist

When asked about background jobs in an interview:

- [ ] Am I passing IDs, not objects?
- [ ] Do I have `retry_on`/`discard_on` defined for likely errors?
- [ ] Is my job idempotent (safe to run twice)?
- [ ] Am I enqueueing after transaction commit, not inside it?
- [ ] Is the queue priority appropriate for this work?
- [ ] What happens if the associated record is deleted before the job runs?

**When asked "how would you design a notification system?":**

1. "I'd create a background job so the HTTP request returns immediately"
2. "The job would receive an ID — never the object itself"
3. "I'd use retry_on for transient failures like SMTP timeouts"
4. "I'd discard on RecordNotFound since retrying won't help if the record is gone"
5. "I'd put notifications on a dedicated queue so they don't block other work"

Move on to **Lesson 4** once you can:

1. Write a job with correct ID serialization
2. Add appropriate retry_on and discard_on
3. Explain why to enqueue after (not inside) a transaction
4. Explain perform_later vs perform_now and when to use each

---

## Reference — Check Your Work

Once you've attempted both exercises, compare your implementation against these patterns.

### Exercise 1: CommentNotificationJob + controller wiring

```ruby
# app/jobs/comment_notification_job.rb
class CommentNotificationJob < ApplicationJob
  queue_as :notifications
  discard_on ActiveRecord::RecordNotFound
  retry_on Net::OpenTimeout, wait: 5.seconds, attempts: 3

  def perform(comment_id)
    comment = Comment.find(comment_id)
    Rails.logger.info "Notifying about comment #{comment_id} on post #{comment.post_id}"
  end
end
```

Comments controller `create` action:

```ruby
def create
  comment = @post.comments.build(comment_params)
  comment.author = current_user
  if comment.save
    CommentNotificationJob.perform_later(comment.id)  # async, non-blocking
    render json: comment, status: :created
  else
    render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
  end
end
```

Notice: the response returns **immediately** after `perform_later`. The job runs separately.

### Exercise 2: PostPublishNotificationJob + updated service

```ruby
# app/jobs/post_publish_notification_job.rb
class PostPublishNotificationJob < ApplicationJob
  queue_as :default
  discard_on ActiveRecord::RecordNotFound

  def perform(post_id)
    post = Post.find(post_id)
    commenter_ids = post.comments.distinct.pluck(:user_id)

    # In a real app: send notifications to each commenter
    Rails.logger.info "Post #{post_id} published — notifying #{commenter_ids.size} commenters"
  end
end
```

Updated `PostPublishService#call`:

```ruby
def call
  ActiveRecord::Base.transaction do
    @post.update!(status: 'published')
  end

  # Enqueue AFTER transaction commits — if we enqueue inside the transaction
  # and it rolls back, the job still runs pointing to an unpublished post
  PostPublishNotificationJob.perform_later(@post.id)

  true
end
```

**Key insight:** Enqueue jobs **after** transactions commit, not inside them. A job inside
a transaction could run before the transaction commits (race condition) or after it rolls back.
