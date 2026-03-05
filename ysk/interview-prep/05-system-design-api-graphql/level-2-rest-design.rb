# =============================================================================
# Level 2: REST API Design Decisions
# =============================================================================
# Before running: ruby level-2-rest-design.rb
# Goal: make the right call on pagination type, versioning, status codes,
#       and resource naming for a given scenario.

# -----------------------------------------------------------------------------
# Exercise 1
# Choose cursor or offset pagination for each scenario.
# Return :cursor or :offset
#
# Offset pagination: simple, works for static data.
#   Problem: if new records are inserted, page 2 returns items already seen.
#
# Cursor pagination: stable for moving feeds.
#   The cursor is an opaque pointer to "where I left off."
#   Insertions before the cursor don't affect subsequent pages.
# -----------------------------------------------------------------------------
def pagination_type_for(scenario)
  case scenario
  when :twitter_home_feed
    # New tweets arrive constantly. Offset would cause duplicates.
    :cursor

  when :admin_user_list_alphabetical
    # Static, sorted by name, rarely changes. Offset is fine.
    :offset

  when :instagram_explore_feed
    # Real-time, personalized. Cursor.
    :cursor

  when :paginated_search_results
    # Search results are relatively stable for a query session. Offset fine.
    :offset

  when :notification_stream
    # New notifications arrive constantly. Cursor.
    :cursor

  when :product_catalog_by_category
    # Catalog changes slowly, sorted by price or name. Offset is fine.
    :offset
  end
end

test("twitter feed -> cursor",           pagination_type_for(:twitter_home_feed),          :cursor)
test("admin user list -> offset",        pagination_type_for(:admin_user_list_alphabetical),:offset)
test("instagram feed -> cursor",         pagination_type_for(:instagram_explore_feed),      :cursor)
test("search results -> offset",         pagination_type_for(:paginated_search_results),    :offset)
test("notification stream -> cursor",    pagination_type_for(:notification_stream),         :cursor)
test("product catalog -> offset",        pagination_type_for(:product_catalog_by_category), :offset)

# -----------------------------------------------------------------------------
# Exercise 2
# Is this a breaking change that requires a new API version?
# Return :breaking or :backwards_compatible
#
# Breaking changes (require v2):
#   - Removing a field clients depend on
#   - Renaming a field
#   - Changing a field's type
#   - Changing the shape of the response
#
# Backwards-compatible (can add to v1):
#   - Adding a new optional field
#   - Adding a new endpoint
#   - Adding a new optional query parameter
# -----------------------------------------------------------------------------
def version_impact(change)
  case change
  when :remove_field_from_response
    :breaking

  when :rename_field_in_response
    :breaking

  when :add_new_optional_field
    :backwards_compatible

  when :add_new_endpoint
    :backwards_compatible

  when :change_field_type_from_string_to_int
    :breaking

  when :add_optional_query_parameter
    :backwards_compatible

  when :require_previously_optional_field
    :breaking
  end
end

test("remove field -> breaking",              version_impact(:remove_field_from_response),        :breaking)
test("rename field -> breaking",              version_impact(:rename_field_in_response),          :breaking)
test("add optional field -> compat",          version_impact(:add_new_optional_field),            :backwards_compatible)
test("add endpoint -> compat",                version_impact(:add_new_endpoint),                  :backwards_compatible)
test("change field type -> breaking",         version_impact(:change_field_type_from_string_to_int), :breaking)
test("add optional param -> compat",          version_impact(:add_optional_query_parameter),      :backwards_compatible)
test("make optional required -> breaking",    version_impact(:require_previously_optional_field), :breaking)

# -----------------------------------------------------------------------------
# Exercise 3
# Design the correct URL shape for each resource action.
# Return the [verb, path] pair.
#
# Rules:
#   - Nouns in paths, not verbs
#   - Nested resources for tight relationships
#   - Custom actions as sub-resources on the member
# -----------------------------------------------------------------------------
def api_route(action)
  case action
  when :list_all_posts
    ["GET", "/api/v1/posts"]

  when :get_one_post
    ["GET", "/api/v1/posts/:id"]

  when :create_post
    ["POST", "/api/v1/posts"]

  when :update_post
    ["PATCH", "/api/v1/posts/:id"]

  when :delete_post
    ["DELETE", "/api/v1/posts/:id"]

  when :list_comments_for_post
    ["GET", "/api/v1/posts/:post_id/comments"]

  when :create_comment_on_post
    ["POST", "/api/v1/posts/:post_id/comments"]

  when :publish_a_post
    # Custom action on a specific post — member route
    ["PATCH", "/api/v1/posts/:id/publish"]

  when :search_all_posts
    # Collection-level action
    ["GET", "/api/v1/posts/search"]
  end
end

test("list posts",        api_route(:list_all_posts),           ["GET",    "/api/v1/posts"])
test("get one post",      api_route(:get_one_post),             ["GET",    "/api/v1/posts/:id"])
test("create post",       api_route(:create_post),              ["POST",   "/api/v1/posts"])
test("update post",       api_route(:update_post),              ["PATCH",  "/api/v1/posts/:id"])
test("delete post",       api_route(:delete_post),              ["DELETE", "/api/v1/posts/:id"])
test("list comments",     api_route(:list_comments_for_post),   ["GET",    "/api/v1/posts/:post_id/comments"])
test("create comment",    api_route(:create_comment_on_post),   ["POST",   "/api/v1/posts/:post_id/comments"])
test("publish post",      api_route(:publish_a_post),           ["PATCH",  "/api/v1/posts/:id/publish"])
test("search posts",      api_route(:search_all_posts),         ["GET",    "/api/v1/posts/search"])

# -----------------------------------------------------------------------------
# Exercise 4
# Rate limiting: given a request's metadata, decide if it should be allowed.
# Returns :allow or :deny
#
# Rule: each user gets 1000 requests per hour.
# The counter resets at the top of each hour.
# -----------------------------------------------------------------------------
RATE_LIMIT = 1000

def rate_limit_decision(request_count_this_hour)
  request_count_this_hour <= RATE_LIMIT ? :allow : :deny
end

test("0 requests -> allow",        rate_limit_decision(0),    :allow)
test("999 requests -> allow",      rate_limit_decision(999),  :allow)
test("1000 requests -> allow",     rate_limit_decision(1000), :allow)
test("1001 requests -> deny",      rate_limit_decision(1001), :deny)
test("5000 requests -> deny",      rate_limit_decision(5000), :deny)

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
