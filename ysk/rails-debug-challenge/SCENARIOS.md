# Rails Interview Challenge

Scenarios mapped to your interview rubric:

1. [Rails CRUD + API Building](#section-1--rails-crud--api-building)
2. [ActiveRecord: queries, includes/joins, transactions](#section-2--activerecord-queries-includesjoins-transactions)
3. [Background Jobs (Sidekiq / ActiveJob)](#section-3--background-jobs-sidekiq--activejob)
4. [AWS Fundamentals](#section-4--aws-fundamentals)

For each scenario: read the code, name the bug, explain how you'd fix it and why it matters.

---

## Section 1 — Rails CRUD + API Building

### Scenario 1 — "POST /api/v1/posts returns 200 on success but callers expect 201."

**Start here:** `app/controllers/api/v1/posts_controller.rb` → `create` action

> What is the correct REST status for a newly created resource?

- I should return a 201, right? Because 201 means created.

> What status does a failed save return right now — and why is that a problem?

- It returns 200, but that's a problem if there's an error. We should return a 403 or a 404.

---

### Scenario 2 — "GET /api/v1/posts/:id returns a 500 when the post doesn't exist."

**Start here:** `app/controllers/api/v1/posts_controller.rb` → `show` action

> How do you rescue `ActiveRecord::RecordNotFound` in a controller?

- What I didn't know is that you have a begin, rescue, end, but if you just add a rescue after a definition start, aka a function start, you can just bypass those, which then allows you to rescue based on what we're trying to rescue, the the rescue type.

> Where's the right place to put it — per-action, per-controller, or application-wide?

- CLAUDE: I'm not sure how to judge this really. Like per action, per control, or application wide. Like theoretically, if it's application wide, then I'll put it on the top, but not every action is getting a record. So, do I have to do it through every record? But I suppose it's like if a function meets this error, then therefore I can rescue it.

---

### Scenario 3 — "Any logged-in user can update any other user's post via PATCH /api/v1/posts/:id."

**Start here:** `app/controllers/api/v1/posts_controller.rb` → `update` action

> How do you scope the find to the current user?

- I suppose you scope the current user by then looking at the post cur current user or user ID and then compare it to the ID that we have right now, the ID of the current user that we have right now

> What status code do you return when the resource exists but the user isn't authorized?

- That'll be a 401 because it isn't authorized.

---

### Scenario 4 — "POST /api/v1/posts raises `ActiveModel::UnknownAttributeError: unknown attribute 'status'`."

**Start here:** `app/controllers/api/v1/posts_controller.rb` → `post_params`
Relevant: `db/schema.rb`

> How do you track down which permitted field is causing the mismatch?

- You look at the schema, right? You look at the schema file, and then from the schema file you see that it's not there. Therefore we have to run a migration.

> Is the fix in strong params, in the schema, or both?

- Theoretically, it would be as a migration. The params are getting the right thing that it expects, but if the migration is not if the schema is not there with it, then I assume that it shouldn't be there.

---

## Section 2 — ActiveRecord: queries, includes/joins, transactions

### Scenario 5 — "GET /api/v1/posts fires 51 SQL queries for a page of 50 posts."

**Start here:** `app/controllers/api/v1/posts_controller.rb` → `index` action

> Identify every N+1 in the response builder.
> What does `.includes` do vs `.joins`? When would you use each?

---

### Scenario 6 — "Return all users who have written at least one published post — without loading posts into memory."

**No file — write it.**

```ruby
# Write this as a scope or class method on User.
# The naive version to avoid:
# User.all.select { |u| u.posts.any? { |p| p.published? } }
```

> What's the difference between `joins`, `merge`, and a subquery here?
> What SQL does your version produce?

---

### Scenario 7 — "Find all comments where the commenter is not the post's author."

**No file — write it in ActiveRecord and plain SQL.**

> Walk through the join chain: comments → posts → users (author) vs users (commenter).
> When would you use `.joins` + `.where` vs a raw SQL string?

---

### Scenario 8 — "Publishing a post sometimes ends up published even when an error is raised halfway through."

**Start here:** `app/services/post_publish_service.rb`

> What happens when `ActivityLog.create!` raises — given that `@post.update!` already ran?
> How do you wrap multiple writes so they all succeed or all roll back?
> What's the difference between `update` and `update!` inside a transaction?

---

## Section 3 — Background Jobs (Sidekiq / ActiveJob)

### Scenario 9 — "After a Redis restart, some enqueued jobs are never processed."

**Start here:** `app/jobs/comment_notification_job.rb`

> What happens to jobs in Sidekiq's queue when Redis restarts?
> How does `retry_on` / `discard_on` interact with job durability?

---

### Scenario 10 — "Workers are slow — email delivery is blocking the thread for seconds per job."

**Start here:** `app/jobs/comment_notification_job.rb` → `deliver_now`

> What's the difference between `deliver_now` and `deliver_later`?
> If you call `deliver_later` inside a job, what actually happens?

---

### Scenario 11 — "After a deploy, jobs enqueued before the deploy raise `ActiveJob::DeserializationError`."

**Start here:** `app/jobs/comment_notification_job.rb` → `perform(comment)`

> Why does passing an ActiveRecord object as a job argument break across process restarts?
> What is GlobalID and how does ActiveJob use it?

---

### Scenario 12 — "Failed jobs retry forever and are filling the dead queue."

**Start here:** `app/jobs/comment_notification_job.rb`

> Write the correct `retry_on` and `discard_on` configuration for this job.
> What does `wait: :exponentially_longer` do?

---

## Section 4 — AWS Fundamentals

### Scenario 13 — "Uploads work locally but fail in production with `Aws::S3::Errors::NoCredentialsError`."

**Start here:** `config/storage.yml`

> Where are credentials configured right now — and what's wrong with that approach?
> What are the three ways to supply AWS credentials in a Rails app?
> Why are IAM instance roles the preferred method?

---

### Scenario 14 — "All S3 uploads are publicly readable. How do you lock them down and still serve them?"

**Start here:** `config/storage.yml`

> How do you make S3 objects private at the bucket policy level?
> How do you serve private ActiveStorage attachments with time-limited URLs in Rails?

---

### Scenario 15 — "Job queues are backed up. The team wants to move background jobs to SQS instead of Redis."

**No file — talk through it.**

> What is SQS and how does it differ from Redis as a job backend?
> What's the visibility timeout and why does it matter for long-running jobs?
> Trade-offs: SQS vs Redis-backed Sidekiq for throughput, ordering, and dead-letter queues.

---

### Scenario 16 — "A developer accidentally committed AWS access keys. Walk me through the response."

**No file — talk through it.**

> What's the first action — and why isn't "delete from git" enough on its own?
> How do you audit whether the keys were used?
> How do you prevent this going forward?

---

## Nvim Tips

- `:grep pattern app/` — search across files
- `gf` on a filename — jump to that file
- `:b#` — bounce between last two buffers
- `:copen` — open quickfix list
- `[d` — show definition under cursor (LSP/tags)
