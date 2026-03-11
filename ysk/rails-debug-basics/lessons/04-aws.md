# Lesson 4 — AWS Fundamentals

## The Mental Model

AWS is a collection of managed infrastructure services. For a Rails backend, you'll interact
with a handful of them constantly:

| Service | What it is | Rails analogy |
|---|---|---|
| **S3** | File storage in the cloud | Like a hard drive, but infinitely scalable and accessible via URL |
| **IAM** | Identity & Access Management | Who is allowed to do what |
| **SQS** | Managed job queue | Like Redis for Sidekiq, but AWS-managed |
| **RDS** | Managed relational database | Your Postgres/MySQL, but AWS runs the server |
| **EC2** | Virtual servers | The machine your Rails app runs on |
| **ECS/EKS** | Container orchestration | Running your Docker containers at scale |

For this interview prep, we focus on **S3, IAM, and SQS** — the most common in API interviews.

---

## Part 1: S3 — File Storage

### The Basics

S3 stores **objects** (files) in **buckets** (namespaced containers). Each object has a key
(essentially a path), a value (the file), and metadata.

```
Bucket: my-app-uploads
  Key:  uploads/users/123/avatar.jpg
  Key:  uploads/posts/456/cover.png
```

### Two Upload Patterns

**Pattern A: Server-side upload** — client → your Rails server → S3
- Simple, you control the file before it hits S3
- Bottleneck: large files go through your server (wasted CPU/bandwidth)
- Good for: small files, server-side processing needed (resize, virus scan)

**Pattern B: Presigned URL** — client → presigned URL → S3 directly
- Rails generates a temporary signed URL; client uploads directly to S3
- Your server never touches the file bytes
- Good for: large files, high throughput, video/audio
- **This is the preferred pattern in modern APIs**

```
1. Client: POST /api/v1/upload_url  { filename: "avatar.jpg", content_type: "image/jpeg" }
2. Rails: generates a presigned PUT URL from AWS SDK → returns { url: "https://s3.aws.../...", key: "..." }
3. Client: PUT <presigned_url> with file bytes directly to S3
4. Client: POST /api/v1/posts/1  { avatar_key: "uploads/users/123/avatar.jpg" }
5. Rails: stores the S3 key in the database
```

### In Rails: Active Storage

Rails has built-in S3 integration via Active Storage:

```ruby
# Gemfile
gem 'aws-sdk-s3', '~> 1.0'

# config/storage.yml
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: us-east-1
  bucket: <%= ENV['S3_BUCKET'] %>

# config/environments/production.rb
config.active_storage.service = :amazon

# app/models/post.rb
class Post < ApplicationRecord
  has_one_attached :cover_image   # Active Storage handles everything
end

# Usage
post.cover_image.attach(io: file, filename: 'cover.jpg')
post.cover_image.url   # generates a presigned URL for access
```

### Presigned URL Service (without Active Storage)

```ruby
# app/services/s3_presigned_url_service.rb
class S3PresignedUrlService
  EXPIRY = 15.minutes

  def initialize(key:, content_type:)
    @key = key
    @content_type = content_type
  end

  def generate_put_url
    s3_client.presigned_url(
      :put_object,
      bucket: ENV.fetch('S3_BUCKET'),
      key: @key,
      expires_in: EXPIRY.to_i,
      content_type: @content_type
    )
  end

  private

  def s3_client
    @s3_client ||= Aws::S3::Presigner.new(
      client: Aws::S3::Client.new(region: ENV.fetch('AWS_REGION', 'us-east-1'))
    )
  end
end
```

---

## Part 2: IAM — Credentials and Access

**The cardinal rule: never hardcode AWS credentials in your code.**

Credentials can rotate. Code is committed to git. Secrets in git are a breach.

### The hierarchy (best to worst):

**1. IAM Roles (best — no credentials at all)**
When your Rails app runs on EC2 or ECS, assign an IAM role to the instance/task.
The AWS SDK picks up credentials automatically from the instance metadata service.
No access keys anywhere. No rotation needed.

```
EC2 Instance → IAM Role → S3 permissions
Your Rails app reads from the instance metadata: no credentials needed in code
```

**2. Environment variables (good)**
```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

Rails credentials or `.env` (gitignored). The AWS SDK picks these up automatically.

**3. Rails credentials (good for Rails apps)**
```bash
rails credentials:edit
```
```yaml
aws:
  access_key_id: ...
  secret_access_key: ...
```
```ruby
# Access via:
Rails.application.credentials.aws[:access_key_id]
```

**4. Hardcoded in code (never)**
```ruby
# DO NOT DO THIS
Aws::S3::Client.new(access_key_id: 'AKIA...', secret_access_key: 'abc123')
```

**Interview tip:** "In production I'd use an IAM role attached to the instance or container —
no credentials to rotate or accidentally leak. In dev I use environment variables via dotenv."

---

## Part 3: IAM — Least Privilege

Each IAM policy should grant **only what the application needs**.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::my-app-uploads/*"
    }
  ]
}
```

This policy:
- Allows: upload, read, delete objects
- Denies (by default): listing bucket contents, deleting the bucket, accessing other buckets
- Scoped to: a specific bucket only

**What NOT to do:**
```json
{
  "Action": "*",    // full admin access — never for an application
  "Resource": "*"   // every resource in your account
}
```

**Interview tip:** "I apply least privilege — the IAM role for my Rails app only gets
`s3:PutObject`, `s3:GetObject` on the specific bucket it needs. Not `s3:*`. Not `*:*`."

---

## Part 4: SQS — Managed Job Queue

SQS is Amazon's managed message queue. For Rails, it can replace Redis+Sidekiq as the
queue backend. Common when you're already deeply in AWS and don't want to manage Redis.

### How it works

```
Rails: SqsJob.perform_later(id)  →  SQS queue (AWS-managed)
                                           ↓
                          Worker polls SQS, picks up the message, calls perform(id)
```

### Visibility Timeout

When a worker picks up a message, SQS hides it from other workers for a **visibility timeout**
window (default: 30 seconds). If the job completes, the message is deleted. If the job
crashes, the message becomes visible again and another worker picks it up.

**Set visibility timeout longer than your longest expected job runtime:**
```
If your job takes up to 2 minutes: set visibility timeout to at least 5 minutes
```

### SQS as ActiveJob adapter

```ruby
# Gemfile
gem 'aws-sdk-sqs'
gem 'activejob-sqs-adapter'   # third party, or use shoryuken

# config/application.rb
config.active_job.queue_adapter = :sqs

# Your jobs don't change at all — ActiveJob abstraction handles it
class NotificationJob < ApplicationJob
  queue_as :default   # maps to an SQS queue name
  def perform(id)
    # same as before
  end
end
```

**SQS vs Sidekiq:**

| | Sidekiq | SQS |
|---|---|---|
| Persistence | Redis | AWS-managed, durable |
| Scaling | You manage Redis | Fully managed |
| Monitoring | Sidekiq Web UI | AWS CloudWatch |
| Cost | Redis server | Pay per message |
| Guarantee | At-least-once | At-least-once |
| Best for | High throughput, complex workflows | AWS-native, simple queuing |

---

## Part 5: Security Response — What to Do When Keys Leak

If AWS credentials are accidentally committed to git:

1. **Immediately revoke the key** in IAM console — treat it as compromised the moment it's seen
2. **Check CloudTrail** for any API calls made with that key
3. **Rotate to a new key** (or better: switch to IAM roles so there are no keys)
4. **Purge from git history** with `git filter-branch` or BFG Repo Cleaner
5. **Notify your security team** — even if no unauthorized usage is found

**Interview tip:** "The first step is to deactivate the key immediately. Not after investigating — immediately. Then I'd check CloudTrail to understand what, if anything, was accessed. Then I'd make sure we switch to IAM roles so this can't happen again."

---

## Exercise: Design an S3 Upload Flow

**Scenario:** A user wants to upload a profile picture to your Rails API.

Before looking at any reference material, design the full flow yourself:

1. Walk through each step of the request lifecycle — what does the client send, what does Rails return, where does the file actually go?
2. Decide which upload pattern you'd use (server-side vs presigned URL) and write down your reasoning before choosing.
3. Design the IAM policy for this feature: which specific S3 actions does your Rails app need? Which resource ARN should the policy scope to?

**Guiding questions:**
1. If you use a presigned URL, the client uploads directly to S3 — but how does your Rails app then know the upload succeeded and which S3 key to store on the user record?
2. Where do the AWS credentials live in your Rails app? Walk through the hierarchy from best to worst option and explain why IAM roles are preferred over access keys.
3. A junior developer proposes using `"Action": "s3:*"` on `"Resource": "*"` to "keep it simple". What's wrong with this, and what would you specify instead?

Add the route and service skeleton to your app after working through your design.

---

## AWS Interview Checklist

- [ ] Can you explain the difference between S3 server-side upload and presigned URLs?
- [ ] Where do credentials live? (IAM role → env vars → Rails credentials — never hardcoded)
- [ ] What is least privilege and how do you apply it in IAM?
- [ ] What is SQS and how does it compare to Sidekiq/Redis?
- [ ] What do you do if a credential is leaked?
- [ ] What is Active Storage and when would you use it vs direct S3 SDK?

**Final interview tip — thinking aloud:**
Always explain your *why* before your *what*.
"I'd use a presigned URL **because** large files shouldn't pass through the app server —
it wastes bandwidth and introduces a bottleneck."
The interviewer wants to hear that you understand the tradeoffs, not just that you know the API.

---

## Reference — Check Your Work

Once you've designed the flow yourself, compare against this structured answer.

**Full presigned URL flow:**
1. "I'd use presigned URLs so the file goes directly from client to S3 without passing through my server..."
2. "The client calls `POST /api/v1/upload_url` with the filename and content type..."
3. "Rails generates a presigned PUT URL using the AWS SDK and returns it with the S3 key..."
4. "The client uploads directly to S3 using that URL — my server never sees the bytes..."
5. "After upload, the client sends the S3 key to Rails, which saves it to the user record..."
6. "For credentials: I'd use an IAM role on the EC2 instance, no access keys in code..."
7. "The IAM policy would allow `s3:PutObject` on the specific bucket only..."

**Controller action for generating the presigned URL:**
```ruby
def upload_url
  key = "uploads/#{current_user.id}/#{SecureRandom.uuid}/#{params[:filename]}"
  url = S3PresignedUrlService.new(
    key: key,
    content_type: params[:content_type]
  ).generate_put_url

  render json: { upload_url: url, key: key }
end
```

**Minimal IAM policy (least privilege):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::my-app-uploads/uploads/*"
    }
  ]
}
```
