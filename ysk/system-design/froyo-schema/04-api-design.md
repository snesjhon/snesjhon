# Lesson 4: API Design — Let the Schema Drive the Endpoints

## The Mental Model Flip

Most people design endpoints first and schema second. This is backwards.

> The schema is the truth. The API is just a window into it.

Once your schema is solid, the endpoints become obvious — you're just deciding
which tables to expose, to whom, and with what operations.

---

## Actors Drive the Route Split

From the requirements, two actors:
- **Customer** — places orders, views their own order status
- **Employee** — views all orders, updates order status

This maps directly to two concerns in your routes:

```
/api/               ← customer-facing (anyone)
/api/admin/         ← employee-facing (authenticated/role-gated)
```

---

## Schema → Endpoints

Walk each table and ask: "who needs to read or write this, and when?"

| Table | Customer | Employee |
|-------|----------|----------|
| sizes | GET (list) | — |
| flavors | GET (list) | — |
| toppings | GET (list) | — |
| orders | POST (create), GET (own order) | GET (all), PATCH (status) |

That's your full API surface. Nothing more.

---

## Endpoint List

```
# Reference data (read-only, powers the order form)
GET  /api/sizes
GET  /api/flavors
GET  /api/toppings

# Customer order flow
POST /api/orders
GET  /api/orders/:id

# Employee order management
GET   /api/admin/orders
PATCH /api/admin/orders/:id/status
```

---

## POST /api/orders — The Interesting One

The request body mirrors the schema exactly because the schema was designed correctly:

```json
{
  "size_id": 1,
  "flavor_id": 2,
  "toppings": [
    { "topping_id": 3, "scoop_count": 2 },
    { "topping_id": 5, "scoop_count": 1 }
  ]
}
```

Notice: `scoop_count` is in the request because it's on the junction table.
If you had modeled toppings as a plain array, you'd have no place to put it.

---

## Key Takeaway

> A clean schema makes the API shape obvious.
> A messy schema forces you to work around it in every controller.

See `04-api-design.rb` for the Rails routes and controller sketches.
