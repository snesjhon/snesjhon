# =============================================================================
# Level 2: Schema Design Decisions
# =============================================================================
# Before running: ruby level-2-schema-decisions.rb
# Goal: make correct schema design choices — breaking vs backwards-compatible
#       changes, mutation structure, and connection vs raw array.
#
# Breaking changes (require migration or versioning):
#   - Removing a field
#   - Renaming a field
#   - Changing a field's type
#   - Making an optional argument required
#
# Backwards-compatible changes (safe to ship):
#   - Adding a new optional field to a type
#   - Adding a new query or mutation
#   - Adding a new optional argument
#   - Deprecating (but keeping) an existing field

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
# Breaking or backwards-compatible schema change?
# Return :breaking or :backwards_compatible
# -----------------------------------------------------------------------------
def schema_change_impact(change)
  raise NotImplementedError, "TODO"
end

test("remove field from type -> breaking",
  schema_change_impact(:remove_field_from_type),                        :breaking)

test("add new optional field to type -> backwards_compatible",
  schema_change_impact(:add_optional_field_to_type),                    :backwards_compatible)

test("rename field (username -> handle) -> breaking",
  schema_change_impact(:rename_field),                                  :breaking)

test("add new query -> backwards_compatible",
  schema_change_impact(:add_new_query_to_schema),                       :backwards_compatible)

test("change field type String -> Int -> breaking",
  schema_change_impact(:change_field_type),                             :breaking)

test("add new optional argument to existing query -> backwards_compatible",
  schema_change_impact(:add_optional_argument_to_query),                :backwards_compatible)

test("make optional argument required -> breaking",
  schema_change_impact(:make_optional_argument_required),               :breaking)

test("add @deprecated to existing field (still serving it) -> backwards_compatible",
  schema_change_impact(:deprecate_field_still_serving),                 :backwards_compatible)

test("add new mutation -> backwards_compatible",
  schema_change_impact(:add_new_mutation),                              :backwards_compatible)

test("remove nullable field clients might query -> breaking",
  schema_change_impact(:remove_nullable_field),                         :breaking)

# -----------------------------------------------------------------------------
# Exercise 2
# Mutation argument structure: should this use an input object or inline args?
# Return :input_object or :inline_args
#
# Rule: always use input objects for mutations.
#   Input objects allow new optional fields to be added without changing the mutation signature.
#   Inline args cannot be extended without changing the signature (which breaks clients).
#
# The only case for inline args: single-field mutations like deletePost(id: ID!)
# where there's only one meaningful argument and it will never grow.
# -----------------------------------------------------------------------------
def mutation_arg_structure(mutation_scenario)
  raise NotImplementedError, "TODO"
end

test("createPost with title, body, published, tags -> input_object",
  mutation_arg_structure(:create_post_multiple_fields),               :input_object)

test("deletePost (only needs id, will never grow) -> inline_args",
  mutation_arg_structure(:delete_post_id_only),                       :inline_args)

test("updateUser with name, bio, avatar_url -> input_object",
  mutation_arg_structure(:update_user_multiple_fields),               :input_object)

test("publishPost (only needs post id) -> inline_args",
  mutation_arg_structure(:publish_post_toggle),                       :inline_args)

test("inviteTeamMember with email, role, team_id, message -> input_object",
  mutation_arg_structure(:invite_team_member_complex),                :input_object)

# -----------------------------------------------------------------------------
# Exercise 3
# Connection pattern or raw array?
# Return :connection or :raw_array
#
# Use Connection when:
#   - The collection can grow unboundedly
#   - Real-time inserts can happen (cursor needed)
#   - Clients will paginate through it
#   - Total count or pageInfo is useful
#
# Raw array is fine when:
#   - Collection is always small and bounded (< 10 items, predictably)
#   - No pagination ever needed (e.g., post.tags where a post has 3-5 tags)
# -----------------------------------------------------------------------------
def collection_type(scenario)
  raise NotImplementedError, "TODO"
end

test("all posts for a user (unbounded, grows over time) -> connection",
  collection_type(:user_posts_unbounded),                :connection)

test("tags on a post (always 2-8 tags) -> raw_array",
  collection_type(:post_tags_small_bounded),             :raw_array)

test("notifications for a user (stream, real-time) -> connection",
  collection_type(:user_notifications_stream),           :connection)

test("roles on a user (admin/member/viewer, always < 5) -> raw_array",
  collection_type(:user_roles_small_set),                :raw_array)

test("comments on a post (can be thousands) -> connection",
  collection_type(:post_comments_unbounded),             :connection)

test("images in a post carousel (max 10, bounded by product) -> raw_array",
  collection_type(:post_carousel_images_max_10),         :raw_array)

# -----------------------------------------------------------------------------
# Exercise 4
# Does this mutation payload have the correct structure?
# Return :correct or :missing_errors
#
# Every mutation payload must include errors: [String!]! because GraphQL returns
# HTTP 200 even when business logic fails. Without errors, the client cannot
# distinguish success from failure.
# -----------------------------------------------------------------------------
def mutation_payload_valid?(payload_fields)
  raise NotImplementedError, "TODO"
end

test("{ post: Post, errors: [String] } -> correct",
  mutation_payload_valid?({ post: :Post, errors: :string_array }),       :correct)

test("{ user: User, errors: [String] } -> correct",
  mutation_payload_valid?({ user: :User, errors: :string_array }),       :correct)

test("{ post: Post } (no errors field) -> missing_errors",
  mutation_payload_valid?({ post: :Post }),                              :missing_errors)

test("{ success: Boolean } (no errors) -> missing_errors",
  mutation_payload_valid?({ success: :Boolean }),                       :missing_errors)

test("{ comment: Comment, errors: [String], post: Post } -> correct",
  mutation_payload_valid?({ comment: :Comment, errors: :string_array, post: :Post }), :correct)
