# =============================================================================
# Level 1: Routes and HTTP Verbs
# =============================================================================
# Before running: ruby level-1-routes-and-verbs.rb
# Goal: map user intents to the correct HTTP verb + path + Rails action.
#
# Key rule: `resources :posts` generates 7 routes.
# Every route is a (verb, path) pair that maps to one controller action.

# -----------------------------------------------------------------------------
# Exercise 1
# Given a user intent, return [verb, path, action] for a posts resource.
#
# Intents: :list, :read_one, :new_form, :create, :edit_form, :update, :delete
#
# Example:
#   route_for(:list)       => ["GET",    "/posts",          "index"]
#   route_for(:read_one)   => ["GET",    "/posts/:id",      "show"]
#   route_for(:new_form)   => ["GET",    "/posts/new",      "new"]
#   route_for(:create)     => ["POST",   "/posts",          "create"]
#   route_for(:edit_form)  => ["GET",    "/posts/:id/edit", "edit"]
#   route_for(:update)     => ["PATCH",  "/posts/:id",      "update"]
#   route_for(:delete)     => ["DELETE", "/posts/:id",      "destroy"]
# -----------------------------------------------------------------------------
def route_for(intent)
  case intent
  when :list      then ["GET",    "/posts",          "index"]
  when :read_one  then ["GET",    "/posts/:id",      "show"]
  when :new_form  then ["GET",    "/posts/new",      "new"]
  when :create    then ["POST",   "/posts",          "create"]
  when :edit_form then ["GET",    "/posts/:id/edit", "edit"]
  when :update    then ["PATCH",  "/posts/:id",      "update"]
  when :delete    then ["DELETE", "/posts/:id",      "destroy"]
  end
end

test("list posts",        route_for(:list),      ["GET",    "/posts",          "index"])
test("read one post",     route_for(:read_one),  ["GET",    "/posts/:id",      "show"])
test("new post form",     route_for(:new_form),  ["GET",    "/posts/new",      "new"])
test("create a post",     route_for(:create),    ["POST",   "/posts",          "create"])
test("edit post form",    route_for(:edit_form), ["GET",    "/posts/:id/edit", "edit"])
test("update a post",     route_for(:update),    ["PATCH",  "/posts/:id",      "update"])
test("delete a post",     route_for(:delete),    ["DELETE", "/posts/:id",      "destroy"])

# -----------------------------------------------------------------------------
# Exercise 2
# Which actions need `set_post` to run first?
# `set_post` loads @post = Post.find(params[:id]).
# It only makes sense for actions that operate on a specific post.
#
# Return true if the action needs set_post, false if not.
#
# Hint: ask "does this action need to know which specific post we're working with?"
# index  -> no  (working with the collection, not one post)
# new    -> no  (building a brand new post, no existing post)
# create -> no  (building a new post from params, no existing post)
# show   -> yes (need the post to display it)
# edit   -> yes (need the post to pre-fill the form)
# update -> yes (need the post to modify it)
# destroy-> yes (need the post to delete it)
# -----------------------------------------------------------------------------
def needs_set_post?(action)
  case action
  when "index", "new", "create" then false
  when "show", "edit", "update", "destroy" then true
  end
end

test("index does not need set_post",   needs_set_post?("index"),   false)
test("new does not need set_post",     needs_set_post?("new"),     false)
test("create does not need set_post",  needs_set_post?("create"),  false)
test("show needs set_post",            needs_set_post?("show"),    true)
test("edit needs set_post",            needs_set_post?("edit"),    true)
test("update needs set_post",          needs_set_post?("update"),  true)
test("destroy needs set_post",         needs_set_post?("destroy"), true)

# -----------------------------------------------------------------------------
# Exercise 3
# Classify each action: does it read from the DB, write to the DB, or both?
# Return :read, :write, or :read_write
#
# This maps to HTTP safety:
#   GET actions -> :read  (safe, browser can cache)
#   POST/PATCH/DELETE -> :write or :read_write
#
# Note: create and update read params then write to DB -> :write is fine.
# The point is: GET never writes.
# -----------------------------------------------------------------------------
def db_operation(action)
  case action
  when "index", "show", "new", "edit" then :read
  when "create", "update", "destroy"  then :write
  end
end

test("index reads",   db_operation("index"),   :read)
test("show reads",    db_operation("show"),    :read)
test("new reads",     db_operation("new"),     :read)
test("edit reads",    db_operation("edit"),    :read)
test("create writes", db_operation("create"),  :write)
test("update writes", db_operation("update"),  :write)
test("destroy writes",db_operation("destroy"), :write)

# -----------------------------------------------------------------------------
# Exercise 4
# Member vs Collection routes.
# A `member` route operates on a single resource (has :id).
# A `collection` route operates on the whole set (no :id).
#
# Given a route description, return :member or :collection.
# -----------------------------------------------------------------------------
def route_type(description)
  case description
  when "publish one post"           then :member      # PATCH /posts/:id/publish
  when "list all draft posts"       then :collection  # GET /posts/drafts
  when "bulk delete selected posts" then :collection  # DELETE /posts/bulk_destroy
  when "archive one post"           then :member      # PATCH /posts/:id/archive
  when "search all posts"           then :collection  # GET /posts/search
  end
end

test("publish one post is member",          route_type("publish one post"),           :member)
test("list drafts is collection",           route_type("list all draft posts"),       :collection)
test("bulk delete is collection",           route_type("bulk delete selected posts"), :collection)
test("archive one post is member",          route_type("archive one post"),           :member)
test("search all posts is collection",      route_type("search all posts"),           :collection)

# =============================================================================
# Test harness
# =============================================================================
def test(desc, actual, expected)
  pass = actual == expected
  puts "#{pass ? 'PASS' : 'FAIL'} #{desc}"
  unless pass
    puts "  expected: #{expected.inspect}"
    puts "  received: #{actual.inspect}"
  end
end
