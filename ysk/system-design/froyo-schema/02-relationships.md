# Lesson 2: Relationships — Connect Entities One at a Time

## The Key Question for Every Relationship

> "Does the connection itself have data?"

This single question determines whether you use a foreign key or a junction table.

---

## Walk Each Relationship

**Order → Size**
- An order has one size. A size belongs to many orders.
- Does the connection have data? No.
- → Foreign key: `orders.size_id`

**Order → Flavor**
- An order has one flavor. A flavor belongs to many orders.
- Does the connection have data? No.
- → Foreign key: `orders.flavor_id`

**Order → Topping**
- An order can have many toppings. A topping can be on many orders.
- Does the connection have data? **YES — scoop_count**
- → Junction table: `order_toppings` with `scoop_count`

---

## Why scoop_count Is the Key Insight

Without `scoop_count` on the junction table you cannot:
- Calculate total weight (`weight_per_scoop * scoop_count`)
- Know how much of each topping is in the order
- Validate against `size.max_weight`

If you model it as a plain `has_and_belongs_to_many`, you lose this entirely.

---

## The Rails Signal

```ruby
# Plain many-to-many — no data on the join
has_and_belongs_to_many :toppings   # WRONG for this domain

# Many-to-many WITH data on the join
has_many :order_toppings
has_many :toppings, through: :order_toppings  # CORRECT
```

Whenever you reach for `has_many :through`, ask yourself what data lives on that through model.
If you can't answer, you may not need `:through`.
If you CAN answer, that data is the whole reason the junction table exists.

---

## Final Relationship Map

```
sizes ←──────────── orders ──────────→ flavors
                       │
                  order_toppings
                  (scoop_count)
                       │
                    toppings
```

See `02-relationships.rb` for the complete model and migration code.
