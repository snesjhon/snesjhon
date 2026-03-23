# Lesson 1: Domain Mapping — Nouns Before Anything Else

## The Trap You Fell Into

You tried to model "Yogurt" as a table because in real life, a yogurt is a thing you hold.
But in the domain, the Order *is* the yogurt. "Yogurt" is a business word, not a data concept.

> **Rule:** Not every word the business uses needs its own table.
> A noun needs a table only if it has data that doesn't already live somewhere else.

---

## The Process: Read Requirements, Underline Nouns

Go line by line. Ask: "is this a *thing* that needs its own row in a database?"

```
"Customers can choose a Yogurt size"
                              ^^^^
                              → Size is a thing. It has a name, price, max_weight.
                                Needs a table.

"Customers can choose from several base yogurt flavors"
                                              ^^^^^^^
                              → Flavor is a thing. It has a name.
                                Needs a table.

"Customers can add various toppings to their order"
                              ^^^^^^^^
                              → Topping is a thing. It has a name, weight_per_scoop.
                                Needs a table.

"Customers can place orders"
                    ^^^^^
                              → Order is a thing. It ties everything together.
                                Needs a table.

"Yogurt" ← appears throughout
                              → NOT a table. Fully described by an Order.
                                It's a domain word, not a data concept.
```

---

## The Test for Whether Something Needs a Table

Ask: "if I removed this table, would I lose data?"

```
Remove sizes?    → lose price and max_weight.  KEEP IT.
Remove flavors?  → lose flavor names.          KEEP IT.
Remove toppings? → lose weight_per_scoop.      KEEP IT.
Remove orders?   → lose the whole transaction. KEEP IT.
Remove yogurt?   → lose... nothing. It's just the order. DROP IT.
```

---

## Result: 4 Tables

```
sizes
flavors
toppings
orders
```

See `01-domain-mapping.rb` for how these become Rails migrations.
