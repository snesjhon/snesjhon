# Level 2: Idempotency — Making Jobs Safe to Run Multiple Times

> **Goal**: Identify whether a job is naturally idempotent, choose the right idempotency strategy, and understand what goes wrong on double execution.
>
> **Builds on Level 1**: You know which operations go async. Now make those async operations safe to retry.

---

## The core concept

**Idempotent**: calling the operation N times produces the same result as calling it once.

Background jobs are retried on failure. Without idempotency, a retry can cause double-sends, double-charges, or corrupted counts. Every background job needs a deliberate idempotency story.

---

## Exercise 1: Is this operation naturally idempotent?

**Naturally idempotent**: SET a value, mark a flag, upsert by unique key.
**Not idempotent**: INCREMENT, SEND (email/SMS/push), CHARGE, APPEND to a list.

| Operation | Naturally idempotent or not? | Why? |
|-----------|------------------------------|------|
| Set `user.email_verified = true` | | |
| Increment user login count | | |
| Send welcome email | | |
| Update `user.last_seen_at = now` | | |
| Charge a payment method | | |
| Mark a post as published | | |
| Send a push notification | | |
| Upsert a record by unique key | | |

**Insight**: Why is `update last_seen_at = now` idempotent but `increment login_count` is not? They both write to the user record.

> _Your answer:_

---

## Exercise 2: Choose the idempotency strategy

When an operation isn't naturally idempotent, you need a guard.

- **Naturally idempotent**: No extra work needed — the operation is safe by design.
- **Redis NX key**: Set a key with `SET NX` (set only if not exists). Fast, short-lived. Acceptable if re-execution after the key TTL expires is OK.
- **DB upsert**: `INSERT ... ON CONFLICT DO NOTHING` with a unique constraint. Durable, permanent guard. Use for financial operations or when you need an audit trail.

| Job description | Strategy |
|-----------------|----------|
| Set `email_verified` flag | |
| Send welcome email (must not send twice) | |
| Charge a payment (must not double-charge, need audit trail) | |
| Re-index a post in Elasticsearch | |
| Send a Slack notification once per event | |
| Record a payment refund (must not refund twice, need ledger) | |
| Soft-delete a post (mark as deleted) | |

**Key question**: Why does a payment charge need a DB upsert instead of a Redis NX key?

> _Your answer:_

---

## Exercise 3: What's the risk of double execution?

If this job runs twice, what's the concrete harm?

- **duplicate_send**: User receives the same message twice
- **double_charge**: User is charged twice for the same thing
- **double_increment**: A counter is wrong (too high)
- **harmless**: Running twice produces the same final state

| Job type | Double-execution risk |
|----------|-----------------------|
| Send order confirmation email | |
| Charge credit card for subscription renewal | |
| Increment daily active user count | |
| Update `user.last_active_at` timestamp | |
| Send password reset SMS | |
| Re-generate search index for a post | |

**Scenario**: Your payment job has a Redis NX key with a 24-hour TTL as its idempotency guard. The job fails permanently and goes to the dead letter queue. You manually re-run it 25 hours later. What happens?

> _Your answer:_

---

## Putting it together

Design the idempotency story for a `SendInvoiceEmailJob`:

1. What makes this job non-idempotent?
2. Which strategy would you use?
3. What is the idempotency key?
4. What happens if the job fails on the 3rd retry?

> _Your answer:_

---

<details>
<summary>Answer key</summary>

**Exercise 1**
| Operation | Answer |
|-----------|--------|
| Set email_verified = true | idempotent |
| Increment login count | not_idempotent |
| Send welcome email | not_idempotent |
| Update last_seen_at = now | idempotent |
| Charge payment method | not_idempotent |
| Mark post as published | idempotent |
| Send push notification | not_idempotent |
| Upsert by unique key | idempotent |

**Exercise 2**
| Job | Strategy |
|-----|----------|
| Set email_verified | naturally_idempotent |
| Send welcome email, once | redis_nx_key |
| Charge payment, audit trail | db_upsert |
| Re-index Elasticsearch | naturally_idempotent |
| Slack notify, once per event | redis_nx_key |
| Record payment refund | db_upsert |
| Soft-delete post | naturally_idempotent |

**Exercise 3**
| Job | Risk |
|-----|------|
| Order confirmation email | duplicate_send |
| Subscription charge | double_charge |
| DAU counter increment | double_increment |
| Update last_active_at | harmless |
| Password reset SMS | duplicate_send |
| Regenerate search index | harmless |

</details>
