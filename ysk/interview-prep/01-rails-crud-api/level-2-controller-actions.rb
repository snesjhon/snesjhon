# =============================================================================
# Level 2: GraphQL Resolver Response Patterns
# =============================================================================
# Before running: ruby level-2-controller-actions.rb
# Goal: understand how resolvers respond to success and failure.
#
# In REST:    redirect on success, render :new with 422 on failure.
# In GraphQL: always HTTP 200. Return a typed payload.
#   Success -> { post: post,  errors: [] }
#   Failure -> { post: nil,   errors: ["Title can't be blank"] }
#
# Two error channels:
#   Execution error -> top-level "errors" array  (auth failures, system errors)
#   Payload error   -> inside mutation result     (validation, business logic)

# =============================================================================
# Test harness
# =============================================================================
def test(desc, actual, expected)
  pass = actual == expected
  puts "#{pass ? 'PASS' : 'FAIL'} #{desc}"
  return if pass

  puts "  expected: #{expected.inspect}"
  puts "  received: #{actual.inspect}"
end

# -----------------------------------------------------------------------------
# Exercise 1
# What does a mutation payload look like on success vs failure?
# Return a hash with :post and :errors keys.
#
# Contract (every mutation follows this):
#   Success: { post: <record>,  errors: [] }
#   Failure: { post: nil,       errors: ["..."] }
#
# This is what React reads to decide: show success state or show inline errors.
# -----------------------------------------------------------------------------
def mutation_payload(saved_successfully, record)
  raise NotImplementedError, "TODO"
end

fake_post = { id: 1, title: 'Hello' }

test('success payload has post and empty errors',
     mutation_payload(true, fake_post),
     { post: fake_post, errors: [] })

test('failure payload has nil post and error messages',
     mutation_payload(false, nil),
     { post: nil, errors: ["Title can't be blank"] })

# -----------------------------------------------------------------------------
# Exercise 2
# Which error channel for each type of failure?
# Return :execution_error or :payload_error
#
# :execution_error -> raise GraphQL::ExecutionError
#   Goes into the top-level "errors" array in the response.
#   React treats the whole operation as broken.
#   Use for: auth failures, permission errors, schema violations.
#
# :payload_error -> return { post: nil, errors: ["message"] }
#   Stays inside the mutation's data field.
#   React reads errors[] and shows them inline next to the form.
#   Use for: validation failures, record-not-found, business logic errors.
# -----------------------------------------------------------------------------
def error_channel_for(failure_type)
  raise NotImplementedError, "TODO"
end

test('not authenticated -> execution error (raise)',
     error_channel_for(:not_authenticated),    :execution_error)
test('not authorized -> execution error (raise)',
     error_channel_for(:not_authorized),       :execution_error)
test('validation failed -> payload error (return in payload)',
     error_channel_for(:validation_failed),    :payload_error)
test('blank title -> payload error',
     error_channel_for(:title_blank),          :payload_error)
test('record not found -> payload error',
     error_channel_for(:record_not_found),     :payload_error)
test('unexpected exception -> execution error',
     error_channel_for(:unexpected_exception), :execution_error)

# -----------------------------------------------------------------------------
# Exercise 3
# For each scenario, what does the resolver return or raise?
# Return :return_payload_success, :return_payload_failure, or :raise_execution_error
#
# The key question: "Is this a business logic problem (payload) or a system problem (raise)?"
# -----------------------------------------------------------------------------
def resolver_response(scenario)
  raise NotImplementedError, "TODO"
end

test('post saves ok -> success payload',
     resolver_response(:post_saves_successfully),  :return_payload_success)
test('validation failure -> failure payload',
     resolver_response(:post_fails_validation),    :return_payload_failure)
test('no current_user -> raise execution error',
     resolver_response(:no_current_user),          :raise_execution_error)
test('wrong owner -> raise execution error',
     resolver_response(:current_user_wrong_owner), :raise_execution_error)
test('record not found -> failure payload',
     resolver_response(:post_not_found),           :return_payload_failure)
test('post destroyed -> success payload',
     resolver_response(:post_destroyed_ok),        :return_payload_success)

# -----------------------------------------------------------------------------
# Exercise 4
# What HTTP status does GraphQL always return?
# This surprises people — even failed mutations return 200.
# The errors live INSIDE the JSON body, not in the HTTP status.
#
# Exceptions: 500 for unhandled server crashes, 400 for malformed JSON body.
# But for all normal operation outcomes (success, validation, auth): 200.
# -----------------------------------------------------------------------------
def graphql_http_status_for(outcome)
  raise NotImplementedError, "TODO"
end

test('mutation success: HTTP 200', graphql_http_status_for(:mutation_success), 200)
test('validation failure: still HTTP 200', graphql_http_status_for(:mutation_validation), 200)
test('not authenticated: still HTTP 200', graphql_http_status_for(:not_authenticated),   200)
test('not authorized: still HTTP 200',    graphql_http_status_for(:not_authorized),      200)
test('server crash: 500',                 graphql_http_status_for(:unhandled_server_crash), 500)

# -----------------------------------------------------------------------------
# Exercise 5
# Which operations need to load a specific record before running?
# In REST: before_action :set_post, only: %i[show edit update destroy]
# In GraphQL: each resolver that needs the record calls:
#   post = context[:current_user].posts.find(id)
#
# Note: always scope to current_user — prevents IDOR
# (Insecure Direct Object Reference: user A accessing user B's posts by ID)
# -----------------------------------------------------------------------------
def resolver_needs_record_load?(operation)
  raise NotImplementedError, "TODO"
end

test('Query.post needs record load',       resolver_needs_record_load?('post'),        true)
test('Mutation.updatePost needs load',     resolver_needs_record_load?('updatePost'),  true)
test('Mutation.deletePost needs load',     resolver_needs_record_load?('deletePost'),  true)
test('Mutation.publishPost needs load',    resolver_needs_record_load?('publishPost'), true)
test('Query.posts does NOT need load',     resolver_needs_record_load?('posts'),       false)
test('Mutation.createPost does NOT load',  resolver_needs_record_load?('createPost'),  false)
