# =============================================================================
# Level 2: REST Concepts + GraphQL Design Decisions
# =============================================================================
# Before running: ruby level-2-rest-design.rb
# Goal: understand REST deeply enough to justify GraphQL, then apply the
#       same concepts (pagination, schema changes, rate limiting) in GraphQL terms.
#
# Stack context: Rails + GraphQL + React
#   - Primary API: GraphQL (POST /graphql)
#   - REST knowledge matters because: interviewers ask "why GraphQL over REST?"
#     and many REST concepts (cursor pagination, breaking changes) translate
#     directly into GraphQL design decisions.

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
# Choose cursor or offset pagination for each scenario.
# Return :cursor or :offset
#
# This applies equally to REST (?page=2) and GraphQL (first: 25, after: "cursor").
# The choice is about data stability, not the API style.
#
# Offset pagination: simple, works for static data.
#   Problem: if new records are inserted, page 2 returns items already seen.
#
# Cursor pagination: stable for moving feeds.
#   The cursor is an opaque pointer to "where I left off."
#   Insertions before the cursor don't affect subsequent pages.
#   In GraphQL: Query { posts(first: 25, after: "cursor") { edges { node } pageInfo } }
# -----------------------------------------------------------------------------
def pagination_type_for(scenario)
  raise NotImplementedError, "TODO"
end

test("twitter feed -> cursor",              pagination_type_for(:twitter_home_feed),          :cursor)
test("admin user list -> offset",           pagination_type_for(:admin_user_list_alphabetical),:offset)
test("our GraphQL posts feed -> cursor",    pagination_type_for(:graphql_posts_feed_react),    :cursor)
test("search results -> offset",           pagination_type_for(:paginated_search_results),    :offset)
test("notification stream -> cursor",      pagination_type_for(:notification_stream),         :cursor)
test("product catalog -> offset",          pagination_type_for(:product_catalog_by_category), :offset)

# -----------------------------------------------------------------------------
# Exercise 2
# Is this a breaking change?
# Return :breaking or :backwards_compatible
#
# This applies to BOTH REST and GraphQL — the rules are nearly identical.
#   REST:    breaking changes require /api/v2/ namespace
#   GraphQL: breaking changes require @deprecated + migration period, or a new schema
#
# Breaking:
#   - Removing a field clients depend on
#   - Renaming a field
#   - Changing a field's type
#   - Making an optional argument required
#
# Backwards-compatible (can add without versioning):
#   - Adding a new optional field
#   - Adding a new operation/endpoint
#   - Adding a new optional argument
# -----------------------------------------------------------------------------
def version_impact(change)
  raise NotImplementedError, "TODO"
end

test("remove field -> breaking",                  version_impact(:remove_field_from_response),       :breaking)
test("rename field -> breaking",                  version_impact(:rename_field_in_response),         :breaking)
test("add optional field -> compat",              version_impact(:add_new_optional_field),           :backwards_compatible)
test("add new operation/endpoint -> compat",      version_impact(:add_new_operation),                :backwards_compatible)
test("change field type -> breaking",             version_impact(:change_field_type),                :breaking)
test("add optional argument -> compat",           version_impact(:add_optional_argument),            :backwards_compatible)
test("make optional required -> breaking",        version_impact(:require_previously_optional_field),:breaking)
test("add nullable field to type -> compat",      version_impact(:add_new_nullable_type_field),      :backwards_compatible)

# -----------------------------------------------------------------------------
# Exercise 3
# GraphQL vs REST: which API style fits each scenario?
# Return :graphql or :rest
#
# Our stack uses GraphQL as the primary API (React frontend).
# REST is still the right tool for certain specific cases.
# -----------------------------------------------------------------------------
def api_style_for(scenario)
  raise NotImplementedError, "TODO"
end

test("React fetching post data -> GraphQL",
  api_style_for(:react_component_fetches_post_data),            :graphql)
test("file upload -> REST endpoint",
  api_style_for(:file_upload_from_react),                       :rest)
test("Stripe webhook -> REST",
  api_style_for(:stripe_webhook_callback),                      :rest)
test("mobile + web with different fields -> GraphQL",
  api_style_for(:mobile_app_needs_different_fields_than_web),   :graphql)
test("health check -> REST",
  api_style_for(:simple_health_check_endpoint),                 :rest)
test("nested post/comments/likes -> GraphQL",
  api_style_for(:complex_nested_data_post_comments_likes),      :graphql)

# -----------------------------------------------------------------------------
# Exercise 4
# Rate limiting applies to GraphQL too — but it's per-IP or per-user token,
# not per endpoint (since there's only one: POST /graphql).
# In GraphQL, you might also limit by query complexity or depth.
#
# Given a request's metadata, decide if it should be allowed.
# Returns :allow or :deny
#
# Rule: each user gets 1000 requests per hour.
# -----------------------------------------------------------------------------
RATE_LIMIT = 1000

def rate_limit_decision(request_count_this_hour)
  raise NotImplementedError, "TODO"
end

test("0 requests -> allow",    rate_limit_decision(0),    :allow)
test("999 requests -> allow",  rate_limit_decision(999),  :allow)
test("1000 requests -> allow", rate_limit_decision(1000), :allow)
test("1001 requests -> deny",  rate_limit_decision(1001), :deny)
test("5000 requests -> deny",  rate_limit_decision(5000), :deny)
