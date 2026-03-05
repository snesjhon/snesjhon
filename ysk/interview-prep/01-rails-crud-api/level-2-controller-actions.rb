# =============================================================================
# Level 2: Controller Action Anatomy
# =============================================================================
# Before running: ruby level-2-controller-actions.rb
# Goal: understand what each controller action does and why it responds the way it does.
#
# The pattern for create/update is always:
#   1. Build/find the record
#   2. Try to save
#   3. Success: redirect (because the work is done — GET the result)
#   4. Failure: re-render the form (because the user needs to see errors)

# -----------------------------------------------------------------------------
# Exercise 1
# After a create/update action, what should happen on success vs failure?
# Return :redirect or :render
#
# Why redirect on success?
#   The POST/PATCH is done. If you re-render, the browser still has the POST in
#   history — refreshing submits the form again (double submission). Redirect
#   issues a GET to the new resource, which is safe to refresh.
#
# Why re-render on failure?
#   @post still has its error messages on the object. If you redirect, you lose
#   @post and can't show errors. Re-render keeps @post alive for the view.
# -----------------------------------------------------------------------------
def after_save(saved_successfully)
  saved_successfully ? :redirect : :render
end

test("successful save -> redirect", after_save(true),  :redirect)
test("failed save -> re-render",    after_save(false), :render)

# -----------------------------------------------------------------------------
# Exercise 2
# What HTTP status should accompany re-rendering a form on failure?
# Return the status symbol.
#
# Why :unprocessable_entity (422)?
#   In Rails 7 with Turbo, if you render a form without a non-2xx status,
#   Turbo assumes success and does nothing with the response. The error form
#   silently disappears. Status 422 tells Turbo "this is a form error — replace
#   the current form with this new response."
# -----------------------------------------------------------------------------
def render_status_on_failure
  :unprocessable_entity
end

test("re-render uses 422", render_status_on_failure, :unprocessable_entity)

# -----------------------------------------------------------------------------
# Exercise 3
# For each scenario, return the right response action as a symbol.
#
# Scenarios:
#   :new_form       -> Just show a blank form. No save. What do you do?
#   :show_one       -> Display a post. No save. What do you do?
#   :create_success -> Post saved. What do you do?
#   :create_failure -> Post invalid. What do you do?
#   :update_success -> Post updated. What do you do?
#   :update_failure -> Post invalid. What do you do?
#   :destroy_done   -> Post deleted. What do you do?
#
# Possible responses: :render_new, :render_show, :redirect_to_post,
#                     :redirect_to_index, :render_new_with_errors,
#                     :render_edit_with_errors
# -----------------------------------------------------------------------------
def controller_response(scenario)
  case scenario
  when :new_form        then :render_new
  when :show_one        then :render_show
  when :create_success  then :redirect_to_post
  when :create_failure  then :render_new_with_errors
  when :update_success  then :redirect_to_post
  when :update_failure  then :render_edit_with_errors
  when :destroy_done    then :redirect_to_index
  end
end

test("new form renders blank form",          controller_response(:new_form),        :render_new)
test("show renders the post",                controller_response(:show_one),        :render_show)
test("create success redirects to post",     controller_response(:create_success),  :redirect_to_post)
test("create failure re-renders form",       controller_response(:create_failure),  :render_new_with_errors)
test("update success redirects to post",     controller_response(:update_success),  :redirect_to_post)
test("update failure re-renders edit form",  controller_response(:update_failure),  :render_edit_with_errors)
test("destroy redirects to index",           controller_response(:destroy_done),    :redirect_to_index)

# -----------------------------------------------------------------------------
# Exercise 4
# `set_post` uses Post.find(params[:id]).
# find raises ActiveRecord::RecordNotFound if the record doesn't exist.
# This is INTENTIONAL — it becomes a 404 automatically.
#
# Contrast with find_by which returns nil.
# Return what happens for each method when the record is missing.
# Return :raises_not_found or :returns_nil
# -----------------------------------------------------------------------------
def missing_record_behavior(method)
  case method
  when :find    then :raises_not_found
  when :find_by then :returns_nil
  end
end

test("find raises RecordNotFound",  missing_record_behavior(:find),    :raises_not_found)
test("find_by returns nil",         missing_record_behavior(:find_by), :returns_nil)

# -----------------------------------------------------------------------------
# Exercise 5
# The before_action hook. What is it for and when should it run?
#
# Before actions run BEFORE the controller action.
# Common uses:
#   authenticate_user! -> runs before EVERY action (no :only)
#   set_post           -> runs only before actions that need @post
#
# For each combination, return true if before_action should apply.
# before_action :set_post, only: %i[show edit update destroy]
# -----------------------------------------------------------------------------
SET_POST_ACTIONS = %w[show edit update destroy].freeze

def set_post_applies?(action)
  SET_POST_ACTIONS.include?(action)
end

test("set_post applies to show",    set_post_applies?("show"),    true)
test("set_post applies to edit",    set_post_applies?("edit"),    true)
test("set_post applies to update",  set_post_applies?("update"),  true)
test("set_post applies to destroy", set_post_applies?("destroy"), true)
test("set_post skips index",        set_post_applies?("index"),   false)
test("set_post skips new",          set_post_applies?("new"),     false)
test("set_post skips create",       set_post_applies?("create"),  false)

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
