# =============================================================================
# Level 3: N+1 Query Detection and Prevention in GraphQL Resolvers
# =============================================================================
# Before running: ruby level-3-n-plus-one.rb
# Goal: detect N+1 risk in a schema, calculate query counts,
#       and choose the correct fix.
#
# N+1 in GraphQL:
#   A list query loads N records.
#   Each record's type has a field that calls an association resolver.
#   That resolver fires ONE query per record.
#   Total: 1 + N queries.
#
# Fixes:
#   :includes_in_collection   -> add .includes(:association) to the list query resolver
#   :dataloader               -> use a batch loader (graphql-batch pattern)
#   :no_fix_needed            -> no association is loaded per record; no N+1

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
# Does this resolver pattern have N+1 risk?
# Return :n_plus_one or :no_risk
#
# N+1 risk exists when:
#   A resolver is called once per item in a list AND it loads from the DB.
#
# No risk when:
#   The field is a scalar computed from data already on the object
#   OR the association was pre-loaded before the resolver ran.
# -----------------------------------------------------------------------------
def n_plus_one_risk?(resolver_description)
  raise NotImplementedError, "TODO"
end

test("PostType#author calls object.user (not pre-loaded) in a posts list -> n_plus_one",
  n_plus_one_risk?(:post_author_not_preloaded),                    :n_plus_one)

test("PostType#title returns object.title (scalar, no query) -> no_risk",
  n_plus_one_risk?(:post_title_scalar),                            :no_risk)

test("CommentType#post calls object.post (not pre-loaded) in a comments list -> n_plus_one",
  n_plus_one_risk?(:comment_post_not_preloaded),                   :n_plus_one)

test("PostType#author when Post.includes(:user) in collection resolver -> no_risk",
  n_plus_one_risk?(:post_author_preloaded_with_includes),          :no_risk)

test("UserType#organization calls object.org per user in users list -> n_plus_one",
  n_plus_one_risk?(:user_organization_not_preloaded),              :n_plus_one)

test("PostType#published_at returns object.published_at (scalar) -> no_risk",
  n_plus_one_risk?(:post_published_at_scalar),                     :no_risk)

# -----------------------------------------------------------------------------
# Exercise 2
# Calculate total DB queries for a GraphQL request.
# Given: number of records in the list, and whether the association is pre-loaded.
# Return an Integer.
#
# Not pre-loaded: 1 (list query) + N (one per record) = N + 1
# Pre-loaded with includes: 1 (list query) + 1 (eager load query) = 2
# DataLoader batched: 1 (list query) + 1 (batch query) = 2
# Scalar only: 1 (list query) = 1
# -----------------------------------------------------------------------------
def total_db_queries(num_records, association_strategy)
  raise NotImplementedError, "TODO"
end

test("50 posts, author not preloaded -> 51 queries",
  total_db_queries(50, :not_preloaded),     51)

test("50 posts, author with includes -> 2 queries",
  total_db_queries(50, :includes),          2)

test("50 posts, author with dataloader -> 2 queries",
  total_db_queries(50, :dataloader),        2)

test("50 posts, title scalar only -> 1 query",
  total_db_queries(50, :scalar_only),       1)

test("100 comments, post not preloaded -> 101 queries",
  total_db_queries(100, :not_preloaded),    101)

test("100 comments, post with dataloader -> 2 queries",
  total_db_queries(100, :dataloader),       2)

# -----------------------------------------------------------------------------
# Exercise 3
# Choose the right fix for each N+1 scenario.
# Return :includes_in_collection, :dataloader, or :no_fix_needed
#
# includes_in_collection:
#   Works for one-level associations where you control the collection query.
#   posts { author { name } } -> Post.includes(:user) in the posts resolver.
#
# dataloader:
#   Required for two+ levels of nesting, conditional loading, or when
#   you don't control where the collection comes from.
#   posts { author { organization { name } } } -> DataLoader for user AND org
#
# no_fix_needed:
#   When there's no association loading at all per record.
# -----------------------------------------------------------------------------
def n_plus_one_fix(scenario)
  raise NotImplementedError, "TODO"
end

test("posts list with author { name } -> includes_in_collection",
  n_plus_one_fix(:posts_with_author_name),                               :includes_in_collection)

test("posts list with author { organization { name } } -> dataloader",
  n_plus_one_fix(:posts_with_author_organization_name),                  :dataloader)

test("posts list with only title and body (scalars) -> no_fix_needed",
  n_plus_one_fix(:posts_scalars_only),                                   :no_fix_needed)

test("users list with posts { title } (has_many) -> includes_in_collection",
  n_plus_one_fix(:users_with_post_titles),                               :includes_in_collection)

test("comments with post { author { name } } (three levels) -> dataloader",
  n_plus_one_fix(:comments_with_post_author_name),                       :dataloader)

test("post with tags (small array, pre-loaded) -> no_fix_needed",
  n_plus_one_fix(:post_tags_preloaded),                                  :no_fix_needed)

# -----------------------------------------------------------------------------
# Exercise 4
# DataLoader batch efficiency.
# A DataLoader collects all IDs for a given type in one execution tick,
# then fires ONE query.
#
# Given: N parent records each requesting a belongs_to association.
# How many DB queries does DataLoader fire for that association?
# Return an Integer.
#
# Answer: always 1 (the batch query), regardless of N.
# This is the entire point of DataLoader.
# -----------------------------------------------------------------------------
def dataloader_queries_for(num_parents)
  raise NotImplementedError, "TODO"
end

test("1 post requesting author via DataLoader -> 1 batch query",
  dataloader_queries_for(1),       1)

test("50 posts requesting author via DataLoader -> 1 batch query",
  dataloader_queries_for(50),      1)

test("1000 posts requesting author via DataLoader -> 1 batch query",
  dataloader_queries_for(1_000),   1)

test("10000 posts requesting author via DataLoader -> 1 batch query",
  dataloader_queries_for(10_000),  1)
