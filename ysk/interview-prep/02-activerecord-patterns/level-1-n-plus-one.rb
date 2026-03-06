# =============================================================================
# Level 1: Spotting and Fixing N+1 Queries
# =============================================================================
# Before running: ruby level-1-n-plus-one.rb
# Goal: identify whether a code pattern causes N+1 queries and know the fix.
#
# The signal: an association accessed inside a loop without includes.
# The fix: add .includes(:association) to the initial query.

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

# -----------------------------------------------------------------------------
# Exercise 1
# Count the number of DB queries a code pattern fires.
# n = number of records in the collection.
#
# Pattern A: Post.all (no includes), then access post.user in a loop
#   -> 1 query for posts + N queries for users = 1 + N total
#
# Pattern B: Post.includes(:user), then access post.user in a loop
#   -> 1 query for posts + 1 query for all users = 2 total (regardless of N)
#
# Pattern C: Post.all, but you never access post.user
#   -> 1 query for posts only = 1 total
# -----------------------------------------------------------------------------
def query_count(pattern, n)
  raise NotImplementedError, "TODO"
end

test("no includes, 1 record: 1+1=2 queries",   query_count(:no_includes_access_user, 1),   2)
test("no includes, 5 records: 1+5=6 queries",  query_count(:no_includes_access_user, 5),   6)
test("no includes, 100 records: 101 queries",  query_count(:no_includes_access_user, 100), 101)
test("includes, 1 record: always 2 queries",   query_count(:includes_access_user, 1),      2)
test("includes, 100 records: always 2 queries",query_count(:includes_access_user, 100),    2)
test("no access to user: 1 query",             query_count(:no_includes_no_access, 50),    1)

# -----------------------------------------------------------------------------
# Exercise 2
# Given a code snippet description, identify whether it has an N+1.
# Return :n_plus_one or :efficient
#
# The question to ask yourself: "Is there an association accessed inside
# a loop, and was it eager-loaded before the loop?"
# -----------------------------------------------------------------------------
def has_n_plus_one?(snippet)
  raise NotImplementedError, "TODO"
end

test("Post.all + user in loop = N+1",
  has_n_plus_one?(:posts_all_access_user_in_loop), :n_plus_one)

test("Post.includes(:user) + user in loop = efficient",
  has_n_plus_one?(:posts_includes_user_access_in_loop), :efficient)

test("Post.all + no association access = efficient",
  has_n_plus_one?(:posts_all_no_loop_access), :efficient)

test("includes(:user) but accesses comments = N+1 on comments",
  has_n_plus_one?(:posts_includes_but_accesses_comments_too), :n_plus_one)

test("includes(:user, :comments) = efficient",
  has_n_plus_one?(:posts_includes_user_and_comments), :efficient)

# -----------------------------------------------------------------------------
# Exercise 3
# Fix the N+1 by returning the correct .includes() chain.
# Given what associations are accessed in the resolver or GraphQL type field,
# return the includes list needed in the collection resolver.
#
# Example:
#   type field accesses: post.user.name
#   -> needs: [:user]
#
#   type field accesses: post.user.name AND post.comments.each
#   -> needs: [:user, :comments]
#
#   type field accesses: post.user.name AND post.comments.first.user.email
#   -> needs: [{ user: [] }, { comments: [:user] }]
#   (comments' user needs to be included too — use DataLoader for deep nesting)
# -----------------------------------------------------------------------------
def required_includes(view_accesses)
  raise NotImplementedError, "TODO"
end

test("accessing post.user.name needs [:user]",
  required_includes(:post_user_name),
  [:user])

test("accessing user.name and comments needs [:user, :comments]",
  required_includes(:post_user_name_and_comments),
  [:user, :comments])

test("accessing comment.user needs nested includes",
  required_includes(:post_user_and_comments_with_comment_user),
  [:user, { comments: [:user] }])

test("no association access needs no includes",
  required_includes(:post_only_title),
  [])
