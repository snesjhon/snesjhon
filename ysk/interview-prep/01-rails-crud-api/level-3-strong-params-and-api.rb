# =============================================================================
# Level 3: Strong Parameters + API Design Decisions
# =============================================================================
# Before running: ruby level-3-strong-params-and-api.rb
# Goal: understand what strong params protect against, how to design them
#       correctly, and what HTTP status codes a JSON API should return.

# -----------------------------------------------------------------------------
# Exercise 1
# Simulate what params.permit does: given a hash of submitted params and
# a permitted list, return only the permitted keys.
#
# This is what happens under the hood when you call:
#   params.require(:post).permit(:title, :body)
#
# Example:
#   submitted = { title: "Hello", body: "World", admin: true, user_id: 99 }
#   permitted = [:title, :body]
#   => { title: "Hello", body: "World" }
#   # admin and user_id are silently dropped
# -----------------------------------------------------------------------------
def simulate_permit(submitted, permitted_keys)
  submitted.select { |k, _| permitted_keys.include?(k) }
end

submitted_1 = { title: "Hello", body: "World", admin: true, user_id: 99 }
test("permits only title and body",
  simulate_permit(submitted_1, [:title, :body]),
  { title: "Hello", body: "World" })

submitted_2 = { title: "Post", body: "Content", published: false, role: "admin" }
test("permits title, body, published — drops role",
  simulate_permit(submitted_2, [:title, :body, :published]),
  { title: "Post", body: "Content", published: false })

submitted_3 = { name: "Alice", email: "a@b.com", password_digest: "hacked" }
test("user params: never permit password_digest directly",
  simulate_permit(submitted_3, [:name, :email, :password, :password_confirmation]),
  { name: "Alice", email: "a@b.com" })
# password_digest is the hashed column — you only permit the raw :password
# and let has_secure_password handle the hashing

# -----------------------------------------------------------------------------
# Exercise 2
# Identify the security vulnerability in each controller snippet.
# Return a symbol describing the problem.
#
# Problems: :mass_assignment, :no_auth_scope, :permits_everything, :safe
# -----------------------------------------------------------------------------
def identify_vulnerability(snippet)
  case snippet
  when :raw_params
    # Post.new(params[:post])
    :mass_assignment

  when :permit_bang
    # params.require(:post).permit!
    :permits_everything

  when :unscoped_find
    # @post = Post.find(params[:id])   # in an API that should be user-scoped
    :no_auth_scope

  when :correct_usage
    # @post = current_user.posts.find(params[:id])
    # params.require(:post).permit(:title, :body)
    :safe
  end
end

test("raw params is mass assignment",       identify_vulnerability(:raw_params),     :mass_assignment)
test("permit! allows everything",           identify_vulnerability(:permit_bang),    :permits_everything)
test("unscoped find exposes other users",   identify_vulnerability(:unscoped_find),  :no_auth_scope)
test("correct usage is safe",              identify_vulnerability(:correct_usage),  :safe)

# -----------------------------------------------------------------------------
# Exercise 3
# What HTTP status code should a JSON API return for each outcome?
# Return the integer status code.
#
# Key codes:
#   200 OK             - successful GET or PATCH
#   201 Created        - successful POST (resource was created)
#   204 No Content     - successful DELETE (nothing to return)
#   401 Unauthorized   - not authenticated (no valid token/session)
#   403 Forbidden      - authenticated but not authorized (wrong user)
#   404 Not Found      - resource doesn't exist
#   422 Unprocessable  - validation errors (submitted data was invalid)
# -----------------------------------------------------------------------------
def api_status_code(outcome)
  case outcome
  when :get_success        then 200
  when :post_success       then 201
  when :patch_success      then 200
  when :delete_success     then 204
  when :not_authenticated  then 401
  when :not_authorized     then 403
  when :record_not_found   then 404
  when :validation_errors  then 422
  end
end

test("GET success is 200",             api_status_code(:get_success),       200)
test("POST success is 201 Created",    api_status_code(:post_success),      201)
test("PATCH success is 200",           api_status_code(:patch_success),     200)
test("DELETE success is 204",          api_status_code(:delete_success),    204)
test("no token is 401",                api_status_code(:not_authenticated), 401)
test("wrong user is 403",              api_status_code(:not_authorized),    403)
test("missing record is 404",          api_status_code(:record_not_found),  404)
test("invalid data is 422",            api_status_code(:validation_errors), 422)

# -----------------------------------------------------------------------------
# Exercise 4
# API versioning: what does namespacing buy you?
#
# If you need a breaking change (rename a field, remove an endpoint),
# you add /api/v2/... without touching /api/v1/...
# Existing clients keep working. New clients use v2.
#
# Given two route paths, return which version is newer.
# Return :v1 or :v2 (whichever is higher)
# -----------------------------------------------------------------------------
def newer_version(path_a, path_b)
  version = ->(path) { path.match(/\/v(\d+)\//)[1].to_i }
  version.call(path_a) > version.call(path_b) ? :v2 : :v1
end

test("v2 is newer than v1",
  newer_version("/api/v2/posts", "/api/v1/posts"), :v2)

test("v1 vs v2 returns v2",
  newer_version("/api/v1/posts", "/api/v2/posts"), :v2)

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
