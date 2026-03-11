# Rails Debug Basics

A progressive build-along Rails API app for interview prep.

## How This Works

The app starts with a thin foundation. Each lesson has you **build on it** — not fix bugs,
but construct correct patterns from scratch, the way you'd be asked to in a codepad interview.

| Lesson | Topic | What you build |
|---|---|---|
| [01-crud-api.md](lessons/01-crud-api.md) | Rails CRUD + API | Full CRUD for posts (show, create, update, destroy) |
| [02-activerecord.md](lessons/02-activerecord.md) | ActiveRecord | N+1 fixes, joins, scopes, transactions, services |
| [03-background-jobs.md](lessons/03-background-jobs.md) | Background Jobs | CommentNotificationJob, PublishNotificationJob |
| [04-aws.md](lessons/04-aws.md) | AWS Fundamentals | S3 presigned URL service, IAM patterns |

## What's Pre-Built

- `User`, `Post`, `Comment` models with associations and validations
- `ApplicationController` with `current_user` via `X-User-Id` header
- `GET /api/v1/posts` (index) — your first worked example
- Database migrations and seed data

## Setup

```bash
cd rails-debug-basics
bundle install
rails db:create db:migrate db:seed
rails server
```

Seed output will print user IDs — pass them as `X-User-Id` header in requests.

## Start Here

Open `lessons/01-crud-api.md` and read from the top. The worked example is already in
`app/controllers/api/v1/posts_controller.rb`. Build each exercise, then continue to the next lesson.
