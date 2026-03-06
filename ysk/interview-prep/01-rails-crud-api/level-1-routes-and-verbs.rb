# =============================================================================
# Level 1: GraphQL Operations — Query vs Mutation
# =============================================================================
# Before running: ruby level-1-routes-and-verbs.rb
# Goal: map user intents to the correct GraphQL operation type and name.
#
# Stack: Rails API-only + GraphQL + React
#   - One route: POST /graphql
#   - Two operation types: Query (reads, never changes data) and Mutation (writes)
#   - new/edit don't exist in Rails — React manages blank/pre-filled form state
#   - Every write returns: { resource: ..., errors: [] }

# =============================================================================
# Test harness (defined first so calls below work)
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
# Map each user intent to its GraphQL operation.
# Return [type, name] where type is :query or :mutation, and name is the
# operation name as it appears in the schema.
#
# Special case: :new_form and :edit_form don't exist as Rails operations.
# Return [:none, "react_state"] — React owns these entirely.
#
# Example:
#   operation_for(:list_posts)  => [:query,    "posts"]
#   operation_for(:create)      => [:mutation, "createPost"]
#   operation_for(:new_form)    => [:none,     "react_state"]
# -----------------------------------------------------------------------------

INTENT_BODY = {
  'list_posts' => [:query, 'posts'],
  'read_one' => [:query, 'post'],
  'new_form' => [:none, 'react_state'],
  'create' => [:mutation, 'createPost'],
  'edit_form' => [:none, 'react_state'],
  'update' => [:mutation, 'updatePost'],
  'delete' => [:mutation, 'deletePost']
}.freeze

def operation_for(intent)
  INTENT_BODY[intent.to_s]
end

test('list posts is a query',         operation_for(:list_posts), [:query,    'posts'])
test('read one post is a query',      operation_for(:read_one),   [:query,    'post'])
test('new form is React state',       operation_for(:new_form),   [:none,     'react_state'])
test('create is a mutation',          operation_for(:create),     [:mutation, 'createPost'])
test('edit form is React state',      operation_for(:edit_form),  [:none,     'react_state'])
test('update is a mutation',          operation_for(:update),     [:mutation, 'updatePost'])
test('delete is a mutation',          operation_for(:delete),     [:mutation, 'deletePost'])

# -----------------------------------------------------------------------------
# Exercise 2
# Does this resolver need to load a specific record by ID?
# In REST this was the `set_post` before_action question.
# In GraphQL: "does this resolver call current_user.posts.find(id)?"
#
# posts       -> no  (loads a collection, no specific ID needed)
# post        -> yes (Query.post(id:) -> Post.find(id))
# createPost  -> no  (builds a NEW record, nothing to look up)
# updatePost  -> yes (needs the existing record to update it)
# deletePost  -> yes (needs the existing record to destroy it)
# publishPost -> yes (custom mutation on a specific post)
# -----------------------------------------------------------------------------
def needs_record_lookup?(operation)
  raise NotImplementedError, 'TODO'
end

test('posts resolver: no lookup needed',       needs_record_lookup?('posts'),       false)
test('post resolver: lookup by id',            needs_record_lookup?('post'),        true)
test('createPost: no lookup (building new)',   needs_record_lookup?('createPost'),  false)
test('updatePost: lookup to modify it',        needs_record_lookup?('updatePost'),  true)
test('deletePost: lookup to destroy it',       needs_record_lookup?('deletePost'),  true)
test('publishPost: lookup the specific post',  needs_record_lookup?('publishPost'), true)

# -----------------------------------------------------------------------------
# Exercise 3
# Query or Mutation? Read or Write?
# Query: reads data, never changes server state. Safe to call multiple times.
# Mutation: changes data. Calling it twice has real effects.
#
# This maps to HTTP safety:
#   Query    -> safe    (can be retried freely, result is the same)
#   Mutation -> unsafe  (retrying could double-create or double-charge)
# -----------------------------------------------------------------------------
def operation_type(operation)
  raise NotImplementedError, 'TODO'
end

test('posts is a query (read)',           operation_type('posts'),         :query)
test('post is a query (read)',            operation_type('post'),          :query)
test('me is a query (read)',              operation_type('me'),            :query)
test('createPost is a mutation (write)',  operation_type('createPost'),    :mutation)
test('updatePost is a mutation (write)',  operation_type('updatePost'),    :mutation)
test('deletePost is a mutation (write)',  operation_type('deletePost'),    :mutation)
test('publishPost is a mutation (write)', operation_type('publishPost'),   :mutation)
test('createComment is a mutation',       operation_type('createComment'), :mutation)

# -----------------------------------------------------------------------------
# Exercise 4
# Does this operation need a parent ID as an argument?
# In REST this was "member vs collection route."
# In GraphQL, nested resources pass the parent ID as a mutation/query argument.
#
# createComment -> yes: createComment(postId: ID!, input: ...)
# deleteComment -> no:  deleteComment(id: ID!) — the comment's own ID is enough
# createPost    -> no:  posts are top-level, no parent
# comments      -> yes: Query.comments(postId: ID!) — scoped to a post
# posts         -> no:  top-level query, no parent
# -----------------------------------------------------------------------------
def needs_parent_id?(operation)
  raise NotImplementedError, 'TODO'
end

test('createComment needs postId',    needs_parent_id?('createComment'), true)
test('deleteComment needs only id',   needs_parent_id?('deleteComment'), false)
test('createPost: no parent',         needs_parent_id?('createPost'),    false)
test('deletePost: no parent needed',  needs_parent_id?('deletePost'),    false)
test('comments query needs postId',   needs_parent_id?('comments'),      true)
test('posts query: top-level',        needs_parent_id?('posts'),         false)
