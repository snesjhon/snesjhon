# Lesson 1: Domain Mapping
#
# Each noun from the requirements becomes a migration.
# Notice: no "Yogurt" table. It doesn't exist as data.
#
# Mental check before writing each migration:
#   "Does this thing have attributes that belong to IT specifically?"

class CreateSizes < ActiveRecord::Migration[7.0]
  def change
    create_table :sizes do |t|
      t.string  :name,       null: false        # "Small", "Medium", "Large"
      t.decimal :price,      null: false         # sizes have fixed prices
      t.decimal :max_weight, null: false         # orders have a max allowed weight

      t.timestamps
    end
  end
end

class CreateFlavors < ActiveRecord::Migration[7.0]
  def change
    create_table :flavors do |t|
      t.string :name, null: false               # "Original Tart", "Vanilla", etc.

      t.timestamps
    end
  end
end

class CreateToppings < ActiveRecord::Migration[7.0]
  def change
    create_table :toppings do |t|
      t.string  :name,             null: false  # "Strawberries", "Granola", etc.
      t.decimal :weight_per_scoop, null: false  # toppings have weights by scoop

      t.timestamps
    end
  end
end

class CreateOrders < ActiveRecord::Migration[7.0]
  def change
    create_table :orders do |t|
      t.integer :customer_id, null: false       # who placed the order
      t.string  :status,      null: false,
                              default: "pending" # employees update this

      # Foreign keys added in Lesson 2 — relationships come after nouns
      t.timestamps
    end
  end
end

# -----------------------------------------------------------------------------
# What's missing from orders? size_id and flavor_id.
# Those are RELATIONSHIPS, not attributes of the noun itself.
# We add them in the next lesson once we've mapped all the nouns.
# This is the discipline: nouns first, connections second.
# -----------------------------------------------------------------------------
