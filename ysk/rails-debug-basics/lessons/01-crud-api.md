# Lesson 1 — Rails CRUD + API Building

## The Mental Model

Think of a Rails API as a **post office**:

- The **route** is the address — it tells Rails where to deliver the request
- The **controller** is the sorting room — it receives the package, decides what to do, and sends a response
- The **model** is the warehouse — it knows how to find, store, and validate data
- **JSON** is the packaging format — it's how data travels over HTTP

A client sends `GET /api/v1/posts` → Rails matches the route → calls `PostsController#index` → model fetches data → controller renders JSON back.

---

## HTTP Verbs + Status Codes — Know These Cold

| Action   | Verb   | Path       | Success Code   | Error Codes              |
| -------- | ------ | ---------- | -------------- | ------------------------ |
| List all | GET    | /posts     | 200 OK         | —                        |
| Show one | GET    | /posts/:id | 200 OK         | 404 Not Found            |
| Create   | POST   | /posts     | 201 Created    | 422 Unprocessable Entity |
| Update   | PATCH  | /posts/:id | 200 OK         | 404, 422                 |
| Delete   | DELETE | /posts/:id | 204 No Content | 404                      |

**Interview tip:** When asked "what status code would you return?", always say the code AND why.
"I'd return 422 because the record failed validation — 400 is for malformed requests, 422 is for semantically invalid data."

---

## Routing — The Address System

```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    resources :posts   # generates all 7 RESTful routes automatically
  end
end
```

`resources :posts` generates:

```
GET    /api/v1/posts          → posts#index
GET    /api/v1/posts/:id      → posts#show
POST   /api/v1/posts          → posts#create
PATCH  /api/v1/posts/:id      → posts#update
DELETE /api/v1/posts/:id      → posts#destroy
```

You can limit which routes exist with `only:` or `except:`:

```ruby
resources :posts, only: [:index, :show]   # read-only API
```

**Interview tip:** "I'd start with only the routes the feature needs, not all 7 by default."

---

## Example (pre-built): GET /api/v1/posts

Open `app/controllers/api/v1/posts_controller.rb` — the `index` action is already there.

Walk through it line by line:

```ruby
def index
  # 1. Query: fetch published posts, eager load associations, sort newest first
  posts = Post.published.includes(:user, :comments).recent

  # 2. Transform: shape the data we want to expose (not the raw model)
  render json: posts.map { |post|
    {
      id: post.id,
      title: post.title,
      body: post.body,
      status: post.status,
      author: post.user.name,        # works without N+1 because of includes(:user)
      comment_count: post.comments.size,
      created_at: post.created_at
    }
  }
end
```

Key decisions:

1. We return `author: post.user.name` not the raw `user_id` — shape for consumers
2. We use `.published` scope — don't leak draft posts
3. We use `includes(:user, :comments)` — Lesson 2 explains why this is critical
4. No explicit status code → defaults to 200, which is correct for GET

---

## Exercise 1: Add `show` (GET /api/v1/posts/:id)

**What to build:** A `show` action that returns a single post by ID. Add `:show` to the routes, then implement the action in the controller.

**Constraints:** Handle the case where the post doesn't exist. Return an appropriate error response.

**Guiding questions:**

1. What should happen when the ID doesn't exist — should Rails raise an exception or return nil? What's the difference between `find` and `find_by`?
2. What format should the error response be in, and which HTTP status code communicates "this resource doesn't exist"?
3. What fields should `show` return that `index` might not include (think: full body, comments list)?

---

## Exercise 2: Add `create` (POST /api/v1/posts)

**What to build:** A `create` action that creates a post owned by the current user. Return 201 on success, 422 on validation failure.

**Constraints:** The current user must be set as the owner server-side. The client should not be able to assign ownership to another user.

**Guiding questions:**

1. What fields should a user be allowed to set when creating a post? Which fields should the server control — and why would it be dangerous to accept those from the client?
2. What's the difference between building a record and saving it? Why might you want to build first?
3. How do you communicate validation errors back to the client so they know what went wrong?

**Interview tip:** "I use `current_user.posts.build` not `Post.new(user_id: ...)` — this way
the user_id is set by the server from the authenticated session, not from user input."

---

## Exercise 3: Add `update` (PATCH /api/v1/posts/:id)

**What to build:** An `update` action that allows the current user to update their own posts.

**Constraints:** A user must only be able to update their own posts. Handle both not-found and validation-failure cases.

**Guiding questions:**

1. What's the risk if you use `Post.find(params[:id])` instead of scoping the lookup to the current user? What information does an unscoped find leak to an attacker?
2. If the post exists but belongs to a different user, what response communicates the least information to a potential attacker?
3. What status code and response body do you return when the update fails validation?

---

## Exercise 4: Add `destroy` (DELETE /api/v1/posts/:id)

**What to build:** A `destroy` action that deletes a post owned by the current user.

**Constraints:** Apply the same ownership scoping as `update`. Handle not-found.

**Guiding questions:**

1. What status code does a successful delete return? Should it include a response body?
2. How do you send a status code with no body in Rails?
3. What should happen if the post ID exists but belongs to a different user?

---

## Putting It Together — Before Filters

Once you've implemented all 4 actions, look at your controller. What repeated code do you notice across `show`, `update`, and `destroy`?

Rails has a convention for extracting shared setup logic that runs before specific actions. What do you think it might be called, and how would you use it here?

---

## Test Your Work

After running `rails db:create db:migrate db:seed && rails server`, test with curl:

```bash
# Get alice's user ID from seed output, e.g. 1
curl -H "X-User-Id: 1" http://localhost:3000/api/v1/posts

# Show a post
curl -H "X-User-Id: 1" http://localhost:3000/api/v1/posts/1

# Create a post
curl -X POST -H "X-User-Id: 1" -H "Content-Type: application/json" \
  -d '{"post": {"title": "My Post", "body": "Hello!", "status": "draft"}}' \
  http://localhost:3000/api/v1/posts

# Update
curl -X PATCH -H "X-User-Id: 1" -H "Content-Type: application/json" \
  -d '{"post": {"status": "published"}}' \
  http://localhost:3000/api/v1/posts/1

# Delete
curl -X DELETE -H "X-User-Id: 1" http://localhost:3000/api/v1/posts/1
```

---

## Interview Checklist for CRUD/API

When talking through any API endpoint, cover these:

- [ ] What route + verb handles this?
- [ ] What does success look like? (status code + shape)
- [ ] What errors can happen? (not found, validation, unauthorized)
- [ ] Am I scoping to the current user where needed?
- [ ] Are my strong params tight — only permitting what's needed?

**When asked to build an endpoint in an interview:**

1. "Let me define the route first..." (write the route)
2. "The controller needs to handle success and two error cases..." (write action)
3. "I'd scope this to the current user to prevent unauthorized access..." (explain why)
4. "Strong params here would be..." (define them)

Move on to **Lesson 2** once your full CRUD is working and you can explain each decision.

---

## Reference — Check Your Work

Once you've attempted all exercises, compare your implementation against these patterns.

### Exercise 1: show

```ruby
def show
  post = Post.find(params[:id])   # raises ActiveRecord::RecordNotFound if missing
  render json: {
    id: post.id,
    title: post.title,
    body: post.body,
    status: post.status,
    author: post.user.name,
    comments: post.comments.map { |c| { body: c.body, author: c.author.name } },
    created_at: post.created_at
  }
rescue ActiveRecord::RecordNotFound
  render json: { error: 'Post not found' }, status: :not_found
end
```

### Exercise 2: create

**The strong params pattern** — this is a security boundary:

```ruby
def post_params
  params.require(:post).permit(:title, :body, :status)
end
```

Why does this matter? Without it, a client could send `{ post: { user_id: 999 } }` and
take ownership of posts. `permit` is your allowlist.

**The create pattern:**

```ruby
def create
  post = current_user.posts.build(post_params)  # builds, doesn't save yet
  if post.save
    render json: post, status: :created          # 201
  else
    render json: { errors: post.errors.full_messages }, status: :unprocessable_entity  # 422
  end
end
```

### Exercise 3: update

```ruby
# WRONG — anyone can update any post
post = Post.find(params[:id])

# RIGHT — user can only touch their own posts
post = current_user.posts.find(params[:id])
```

The second version raises `ActiveRecord::RecordNotFound` if the post doesn't belong to `current_user` — even if it exists. This is intentional: don't reveal that the resource exists.

```ruby
def update
  post = current_user.posts.find(params[:id])
  if post.update(post_params)
    render json: post
  else
    render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
  end
rescue ActiveRecord::RecordNotFound
  render json: { error: 'Post not found' }, status: :not_found
end
```

### Exercise 4: destroy

```ruby
def destroy
  post = current_user.posts.find(params[:id])
  post.destroy
  head :no_content   # 204, no body
rescue ActiveRecord::RecordNotFound
  render json: { error: 'Post not found' }, status: :not_found
end
```

**Interview tip:** "204 means success but no content to return. I use `head :no_content`
in Rails which sets the status code without a body."

### Putting It Together: before_action

```ruby
before_action :set_post, only: [:show, :update, :destroy]

private

def set_post
  @post = current_user.posts.find(params[:id])
rescue ActiveRecord::RecordNotFound
  render json: { error: 'Post not found' }, status: :not_found
end
```

This is the Rails convention — DRY up shared setup with `before_action`.

---

## Non-Obvious Pattern Shapes — Reference

These are patterns you can't guess from the method name alone. Memorize the shape, not the internals.

**Strong params — require then permit**

```ruby
params.require(:post).permit(:title, :body, :status)
# require(:post)       → "expect a 'post' key in the request body, blow up if missing"
# permit(:title, ...)  → "allowlist these fields, silently drop everything else"
# params itself        → inherited from ActionController::Base, available in every controller
```

**Build from association, not Post.new**

```ruby
current_user.posts.build(post_params)  # user_id set by server automatically
Post.new(post_params)                  # user_id must come from params — dangerous
```

**Scoped find for authorization**

```ruby
current_user.posts.find(params[:id])  # 404 if post exists but belongs to someone else
Post.find(params[:id])                # finds anyone's post — wrong for update/destroy
```

**Render with explicit status**

```ruby
render json: post, status: :created             # 201 — new resource created
render json: { errors: post.errors.full_messages }, status: :unprocessable_entity  # 422
render json: { error: 'not found' }, status: :not_found  # 404
head :no_content                                # 204 — success, no body (used for destroy)
```

**Inline rescue inside an action**

```ruby
def show
  post = Post.find(params[:id])   # raises if missing
  render json: post
rescue ActiveRecord::RecordNotFound
  render json: { error: 'not found' }, status: :not_found
end
# rescue inside a method only catches errors from that method — not a global handler
```

**before_action for shared setup**

```ruby
before_action :set_post, only: [:show, :update, :destroy]
# runs :set_post before each listed action
# if set_post calls render, the action itself is skipped entirely
```
