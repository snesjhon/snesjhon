# =============================================================================
# Level 2: includes vs joins — Choosing the Right Tool
# =============================================================================
# Before running: ruby level-2-includes-vs-joins.rb
# Goal: given a requirement, choose includes, joins, or both.
#
# The one question: "Do I need to ACCESS the association data in Ruby?"
#   Yes -> includes (loads the data into memory)
#   No, just filtering -> joins (SQL JOIN, no Ruby loading)
#   Both -> joins + includes

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
# Choose the correct method given the requirement.
# Return :includes, :joins, or :both
#
# Read each requirement carefully:
#   "Show each post with its author's name" -> you'll ACCESS author in Ruby -> includes
#   "Only show posts by active users" -> just FILTERING, no need to access user -> joins
#   "Show posts by active users, display their author name" -> FILTER + ACCESS -> both
# -----------------------------------------------------------------------------
def choose_method(requirement)
  raise NotImplementedError, "TODO"
end

test("show posts with author name needs includes",
  choose_method(:show_posts_with_author_name), :includes)

test("filter by active users needs joins",
  choose_method(:filter_posts_by_active_users), :joins)

test("filter + display author name needs both",
  choose_method(:filter_active_users_show_author_name), :both)

test("showing comment count in view needs includes",
  choose_method(:count_comments_per_post), :includes)

test("only posts with comments needs joins",
  choose_method(:find_posts_with_at_least_one_comment), :joins)

# -----------------------------------------------------------------------------
# Exercise 2
# After using joins, is the association available without extra queries?
# Return true if post.user works without firing an extra query, false if it fires one.
# -----------------------------------------------------------------------------
def association_loaded_after?(method)
  raise NotImplementedError, "TODO"
end

test("includes loads association",     association_loaded_after?(:includes),    true)
test("joins does NOT load association",association_loaded_after?(:joins),       false)
test("eager_load loads association",   association_loaded_after?(:eager_load),  true)
test("preload loads association",      association_loaded_after?(:preload),     true)

# -----------------------------------------------------------------------------
# Exercise 3
# The trap: joins for filtering + accessing the association in a loop.
# Identify what query count this results in.
# n = number of records returned.
#
# Post.joins(:user).where(users: { active: true }) -> returns n posts
# Then in view: post.user.name for each post -> n extra queries (N+1!)
# -----------------------------------------------------------------------------
def query_count_joins_trap(n)
  raise NotImplementedError, "TODO"
end

def query_count_joins_with_includes(n)
  raise NotImplementedError, "TODO"
end

test("joins trap with 10 records: 11 queries",
  query_count_joins_trap(10), 11)

test("joins + includes with 10 records: 2 queries",
  query_count_joins_with_includes(10), 2)

test("joins trap with 100 records: 101 queries",
  query_count_joins_trap(100), 101)

test("joins + includes with 100 records: still 2 queries",
  query_count_joins_with_includes(100), 2)

# -----------------------------------------------------------------------------
# Exercise 4
# Which scope of query does each method produce?
# Return :inner_join, :left_outer_join, or :separate_queries
#
# This matters because:
#   INNER JOIN (joins) -> only returns posts that HAVE a user (excludes orphans)
#   LEFT OUTER JOIN (eager_load) -> returns ALL posts, user is nil if missing
#   Separate queries (preload/includes without WHERE) -> returns all posts + all matching users
# -----------------------------------------------------------------------------
def sql_strategy(method)
  raise NotImplementedError, "TODO"
end

test("joins uses INNER JOIN",         sql_strategy(:joins),      :inner_join)
test("eager_load uses LEFT JOIN",     sql_strategy(:eager_load), :left_outer_join)
test("preload uses 2 queries",        sql_strategy(:preload),    :separate_queries)
test("includes is smart (delegates)", sql_strategy(:includes),   :smart)
