# =============================================================================
# Level 1: API Style — REST vs GraphQL and Pagination Type
# =============================================================================
# Before running: ruby level-1-api-style.rb
# Goal: for each scenario, choose the right API style and pagination strategy.
#
# GraphQL wins when:
#   - Multiple clients need different data shapes from the same resource
#   - Deeply nested related data must arrive in one request
#   - Schema must evolve without versioning (React frontend)
#
# REST wins when:
#   - File uploads (multipart/form-data)
#   - External webhooks / inbound callbacks
#   - Simple public APIs where GraphQL tooling isn't available to consumers
#   - Infrastructure endpoints (health, metrics)
#
# Pagination:
#   :cursor -> stable for real-time or frequently-inserted feeds
#   :offset -> fine for static, sorted datasets that rarely change

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
# REST or GraphQL? Return :graphql or :rest
# -----------------------------------------------------------------------------
def api_style_for(scenario)
  raise NotImplementedError, "TODO"
end

test("React app fetching posts with author names -> graphql",
  api_style_for(:react_app_posts_with_authors),                     :graphql)

test("Stripe webhook hitting our endpoint -> rest",
  api_style_for(:stripe_webhook_inbound),                           :rest)

test("Mobile + web need different fields for same resource -> graphql",
  api_style_for(:mobile_and_web_different_data_needs),              :graphql)

test("POST /uploads for avatar image upload -> rest",
  api_style_for(:file_upload_avatar),                               :rest)

test("GET /healthz server health check -> rest",
  api_style_for(:health_check_endpoint),                            :rest)

test("Dashboard fetching user + posts + activity in one screen -> graphql",
  api_style_for(:dashboard_nested_data_one_request),                :graphql)

test("GitHub-style public developer API -> rest",
  api_style_for(:public_developer_api_third_party),                 :rest)

test("React admin panel, each page needs different fields -> graphql",
  api_style_for(:react_admin_panel_varied_fields),                  :graphql)

test("POST /webhooks/github receiving push events -> rest",
  api_style_for(:github_webhook_push_event),                        :rest)

# -----------------------------------------------------------------------------
# Exercise 2
# Cursor or offset pagination? Return :cursor or :offset
# -----------------------------------------------------------------------------
def pagination_type_for(scenario)
  raise NotImplementedError, "TODO"
end

test("Twitter-style home feed (new posts insert constantly) -> cursor",
  pagination_type_for(:twitter_home_feed),                          :cursor)

test("Admin user list, alphabetical, rarely changes -> offset",
  pagination_type_for(:admin_user_list_alphabetical),               :offset)

test("Notification stream (new notifications come in live) -> cursor",
  pagination_type_for(:notification_stream_live),                   :cursor)

test("Product catalog sorted by category, static data -> offset",
  pagination_type_for(:product_catalog_static),                     :offset)

test("Activity feed (events insert in real time) -> cursor",
  pagination_type_for(:activity_feed_real_time),                    :cursor)

test("Search results page (stable result set for a query) -> offset",
  pagination_type_for(:search_results_stable),                      :offset)

test("GraphQL posts feed in React app -> cursor",
  pagination_type_for(:graphql_posts_feed_react),                   :cursor)

# -----------------------------------------------------------------------------
# Exercise 3
# Identify the correct HTTP method for each REST operation.
# Return :get, :post, :put, :patch, or :delete
# -----------------------------------------------------------------------------
def http_method_for(operation)
  raise NotImplementedError, "TODO"
end

test("Fetch a single post -> get",
  http_method_for(:fetch_post_by_id),          :get)

test("Create a new post -> post",
  http_method_for(:create_new_post),           :post)

test("Update post title only (partial update) -> patch",
  http_method_for(:update_post_title_only),    :patch)

test("Replace entire post object -> put",
  http_method_for(:replace_entire_post),       :put)

test("Delete a post -> delete",
  http_method_for(:delete_post),               :delete)

test("List all posts -> get",
  http_method_for(:list_all_posts),            :get)

test("Upload a file -> post",
  http_method_for(:upload_file),               :post)
