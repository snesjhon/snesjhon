# =============================================================================
# Level 3: Input Types + GraphQL Security + Schema Evolution
# =============================================================================
# Before running: ruby level-3-strong-params-and-api.rb
# Goal: understand what input types protect against, how to design them
#       correctly, and how GraphQL handles schema changes over time.
#
# Stack context:
#   - Strong params (REST) are replaced by GraphQL input types
#   - The threat is identical: prevent mass assignment of fields the client
#     shouldn't control (role, user_id, admin, etc.)
#   - GraphQL input types reject undeclared fields at the schema level —
#     before your resolver even runs.

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
# Simulate what a GraphQL input type does: given a hash of submitted args and
# a list of declared arguments, return only the declared keys.
#
# This is what happens when GraphQL processes:
#   input CreatePostInput { title: String!, body: String!, published: Boolean }
#
# Any key NOT declared in the input type is rejected before reaching the resolver.
#
# Example:
#   submitted = { title: "Hello", body: "World", role: "admin", user_id: 99 }
#   declared  = [:title, :body, :published]
#   => { title: "Hello", body: "World" }
#   # role and user_id are rejected at the schema level
# -----------------------------------------------------------------------------
def simulate_input_type(submitted, declared_args)
  raise NotImplementedError, "TODO"
end

submitted_1 = { title: "Hello", body: "World", role: "admin", user_id: 99 }
test("input type: permits only title and body",
  simulate_input_type(submitted_1, [:title, :body]),
  { title: "Hello", body: "World" })

submitted_2 = { title: "Post", body: "Content", published: false, admin: true }
test("input type: permits title, body, published — drops admin",
  simulate_input_type(submitted_2, [:title, :body, :published]),
  { title: "Post", body: "Content", published: false })

submitted_3 = { name: "Alice", email: "a@b.com", password_digest: "hacked" }
test("input type: never include password_digest (use :password only)",
  simulate_input_type(submitted_3, [:name, :email, :password, :password_confirmation]),
  { name: "Alice", email: "a@b.com" })
# password_digest is the hashed column — declare :password in the input type,
# let has_secure_password handle hashing. Never expose the digest field.

# -----------------------------------------------------------------------------
# Exercise 2
# Identify the security vulnerability in each resolver snippet.
# Return a symbol describing the problem.
#
# Problems: :mass_assignment, :no_auth_scope, :no_input_type, :safe
# -----------------------------------------------------------------------------
def identify_vulnerability(snippet)
  raise NotImplementedError, "TODO"
end

test("raw args to model: mass assignment",       identify_vulnerability(:raw_args_to_model), :mass_assignment)
test("no input type: mass assignment risk",      identify_vulnerability(:no_input_type),     :no_input_type)
test("unscoped find: IDOR vulnerability",        identify_vulnerability(:unscoped_find),     :no_auth_scope)
test("correct scoped + typed usage: safe",       identify_vulnerability(:correct_usage),     :safe)

# -----------------------------------------------------------------------------
# Exercise 3
# GraphQL response structure — understanding what's in the body.
# Unlike REST (which uses HTTP status codes), GraphQL always returns HTTP 200.
# The structure of the JSON body tells you what happened.
#
# Given a scenario, return the response shape as a symbol.
#
# :success_with_data   -> { data: { createPost: { post: {...}, errors: [] } } }
# :payload_with_errors -> { data: { createPost: { post: nil, errors: ["..."] } } }
# :execution_error     -> { data: { createPost: nil }, errors: [{ message: "..." }] }
# -----------------------------------------------------------------------------
def graphql_response_shape(scenario)
  raise NotImplementedError, "TODO"
end

test("saved successfully -> success with data",
  graphql_response_shape(:mutation_saved_successfully), :success_with_data)
test("validation failed -> payload with errors",
  graphql_response_shape(:mutation_validation_failed),  :payload_with_errors)
test("not authenticated -> execution error",
  graphql_response_shape(:user_not_authenticated),      :execution_error)
test("not authorized -> execution error",
  graphql_response_shape(:user_not_authorized),         :execution_error)
test("record not found (handled) -> payload with errors",
  graphql_response_shape(:record_not_found_handled),    :payload_with_errors)

# -----------------------------------------------------------------------------
# Exercise 4
# GraphQL schema evolution — how do you change the API without breaking clients?
# In REST: breaking changes require a new /api/v2/ namespace.
# In GraphQL: the type system lets you evolve the schema more gracefully.
#
# Return :safe_to_add, :deprecate_then_remove, or :breaking_change
#
# Rules:
#   Adding a new nullable field to a type  -> safe (clients ignore unknown fields)
#   Adding a new optional argument         -> safe
#   Renaming a field                       -> breaking (clients reference old name)
#   Removing a field                       -> breaking (unless deprecated first)
#   Changing a field's type                -> breaking
#   Adding a new mutation or query         -> safe (additive)
# -----------------------------------------------------------------------------
def schema_change_impact(change)
  raise NotImplementedError, "TODO"
end

test("add nullable field: safe",
  schema_change_impact(:add_nullable_field_to_type),        :safe_to_add)
test("add optional argument: safe",
  schema_change_impact(:add_optional_argument_to_mutation), :safe_to_add)
test("add new mutation: safe (additive)",
  schema_change_impact(:add_new_mutation),                  :safe_to_add)
test("rename field: breaking change",
  schema_change_impact(:rename_existing_field),             :breaking_change)
test("remove field without deprecation: breaking",
  schema_change_impact(:remove_field_without_deprecation),  :breaking_change)
test("remove field after deprecation: correct approach",
  schema_change_impact(:remove_field_after_deprecation),    :deprecate_then_remove)
test("change field type: breaking",
  schema_change_impact(:change_field_type),                 :breaking_change)
