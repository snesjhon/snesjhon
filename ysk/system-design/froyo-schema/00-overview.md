# Frozen Yogurt Schema — Mental Model Series

A real interview problem used to build the habit of thinking about schema design correctly.

## The Problem

> Design a relational database for a frozen yogurt ordering system.
> Customers choose a size, one flavor, and any number of toppings (by scoops).
> Toppings have weights per scoop. Orders have a max allowed weight based on size.
> Employees can update order statuses. Customers can view order statuses.

## Where Most People Go Wrong

- Start listing relationships before identifying entities
- Try to model the physical object ("Yogurt") instead of the domain concept ("Order")
- Forget that many-to-many relationships can carry their own data
- Put business constraints in the wrong place

## The 4-Step Mental Model

| Step | Question to ask | Lesson |
|------|----------------|--------|
| 1. Domain Mapping | "What are the nouns?" | `01-domain-mapping` |
| 2. Relationships | "How do they connect, and does the connection have data?" | `02-relationships` |
| 3. Keys & Constraints | "Where do the rules live?" | `03-keys-and-constraints` |
| 4. API Shape | "How does the schema drive the endpoints?" | `04-api-design` |

## File Structure

```
froyo-schema/
  00-overview.md               ← you are here
  01-domain-mapping.md
  01-domain-mapping.rb         ← extracting tables from requirements
  02-relationships.md
  02-relationships.rb          ← Rails model associations
  03-keys-and-constraints.md
  03-keys-and-constraints.rb   ← migrations with constraints + validations
  04-api-design.md
  04-api-design.rb             ← routes + controller sketch
```
