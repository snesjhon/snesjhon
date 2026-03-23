# Lesson 3: Keys & Constraints — Where Do the Rules Live?

## Two Types of Rules

| Type | What it is | Where it lives |
|------|-----------|----------------|
| Structural | "this column cannot be null", "this must be unique" | DB constraint / migration |
| Business | "total weight must not exceed size max" | Application layer (model validation) |

Most schema mistakes come from not knowing which type a rule is, or putting it in the wrong place.

---

## The Weight Rule

The requirement: toppings contribute to a max allowed weight per order.

```
total_weight = SUM(topping.weight_per_scoop * order_topping.scoop_count)
total_weight <= size.max_weight
```

This spans multiple tables. A SQL CHECK constraint can't express this cleanly.
It belongs in the **model validation** — but the schema must make it *possible*:

- `sizes.max_weight` — the cap lives on the size (not on the order)
- `toppings.weight_per_scoop` — the per-unit weight lives on the topping
- `order_toppings.scoop_count` — the quantity lives on the junction

If any of these are missing, the rule becomes unenforceable.

---

## Key Decisions

**Why `max_weight` on `sizes` and not `orders`?**

Putting it on orders would mean repeating the value for every order of that size.
If the large cup's max weight changes, you'd have to update every existing order.
The rule belongs to the size — orders just reference it.

**Why a composite unique index on `order_toppings`?**

```sql
UNIQUE (order_id, topping_id)
```

Without this, you could add granola twice to the same order as two separate rows.
The DB enforces "one row per topping per order" — scoops stack on that row.

**Why `NOT NULL` on foreign keys?**

An order without a size or flavor is not a valid order. The DB should reject it,
not your application code guessing about nil values.

---

## The Constraint Checklist

For each column, ask:
1. Can this be null? → add `null: false` if not
2. Must this be unique? → add a unique index
3. Does this reference another table? → add a foreign key
4. Is there a business rule tied to this value? → add a model validation

See `03-keys-and-constraints.rb` for all of these applied to the froyo schema.
