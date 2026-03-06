# =============================================================================
# Level 3: Transactions — All or Nothing
# =============================================================================
# Before running: ruby level-3-transactions.rb
# Goal: understand when transactions are needed, why bang methods matter,
#       and what happens to data when a step fails.

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
# Simulate a transaction.
# Given a list of operations (as lambdas), run them in order.
# If any raises an exception, "roll back" by returning the original state.
# If all succeed, return the final state.
#
# This is how ActiveRecord::Base.transaction works under the hood.
# -----------------------------------------------------------------------------
def simulate_transaction(initial_state, operations)
  raise NotImplementedError, "TODO"
end

# All succeed
result = simulate_transaction(
  { sender: 500, receiver: 100 },
  [
    ->(s) { s.merge(sender:   s[:sender]   - 100) },
    ->(s) { s.merge(receiver: s[:receiver] + 100) }
  ]
)
test("all succeed: transfer completes",
  result, { sender: 400, receiver: 200 })

# Second op fails: everything rolls back
result = simulate_transaction(
  { sender: 500, receiver: 100 },
  [
    ->(s) { s.merge(sender: s[:sender] - 100) },
    ->(s) { raise "receiver account invalid" }
  ]
)
test("second op fails: rolls back to original",
  result, { sender: 500, receiver: 100 })

# First op fails: rolls back immediately
result = simulate_transaction(
  { sender: 500, receiver: 100 },
  [
    ->(s) { raise "sender has insufficient funds" },
    ->(s) { s.merge(receiver: s[:receiver] + 100) }
  ]
)
test("first op fails: receiver never touched",
  result, { sender: 500, receiver: 100 })

# -----------------------------------------------------------------------------
# Exercise 2
# save vs save! inside a transaction.
# save returns false on failure — does NOT trigger rollback.
# save! raises ActiveRecord::RecordInvalid — DOES trigger rollback.
#
# Given the method used, return whether the first record is saved or rolled back
# when the second operation fails.
# Return :saved or :rolled_back
# -----------------------------------------------------------------------------
def first_record_state_on_second_failure(save_method)
  raise NotImplementedError, "TODO"
end

test("save on failure: first record stays saved (no rollback)",
  first_record_state_on_second_failure(:save), :saved)

test("save! on failure: first record is rolled back",
  first_record_state_on_second_failure(:save_bang), :rolled_back)

# -----------------------------------------------------------------------------
# Exercise 3
# When do you NEED a transaction?
# Return :needs_transaction or :no_transaction_needed
#
# You need a transaction when:
# - Multiple writes must all succeed or all fail together
# - Creating a record and associated records that are meaningless without each other
# - Doing a "read-then-write" that must be atomic (check balance, then debit)
# -----------------------------------------------------------------------------
def needs_transaction?(scenario)
  raise NotImplementedError, "TODO"
end

test("single update: no transaction needed",
  needs_transaction?(:single_user_update), :no_transaction_needed)

test("fund transfer: needs transaction",
  needs_transaction?(:transfer_funds), :needs_transaction)

test("order + line items: needs transaction",
  needs_transaction?(:create_order_and_line_items), :needs_transaction)

test("save then email: no transaction (use after_commit + job)",
  needs_transaction?(:send_email_after_save), :no_transaction_needed)

test("inventory + order: needs transaction",
  needs_transaction?(:decrement_inventory_and_create_order), :needs_transaction)

# -----------------------------------------------------------------------------
# Exercise 4
# The after_create timing trap.
# after_create fires DURING the transaction (before commit).
# If you enqueue a job inside after_create, the job might run before
# the transaction commits — and Post.find(id) in the job returns RecordNotFound.
#
# Which callback is safe for enqueueing jobs?
# Return the safe callback name as a symbol.
# -----------------------------------------------------------------------------
def safe_callback_for_job_enqueueing
  raise NotImplementedError, "TODO"
end

test("safe callback for job enqueueing is after_commit",
  safe_callback_for_job_enqueueing, :after_commit)
