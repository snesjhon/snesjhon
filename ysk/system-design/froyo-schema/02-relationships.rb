# Lesson 2: Relationships
#
# Two things happen here:
#   1. Foreign keys get added to orders (size_id, flavor_id)
#   2. The junction table order_toppings is created with scoop_count
#
# The discipline: we didn't put these in Lesson 1 because
# relationships are a separate pass from entity identification.

# --- Migrations ---

class AddRelationshipsToOrders < ActiveRecord::Migration[7.0]
  def change
    add_reference :orders, :size,   null: false, foreign_key: true
    add_reference :orders, :flavor, null: false, foreign_key: true
  end
end

class CreateOrderToppings < ActiveRecord::Migration[7.0]
  def change
    create_table :order_toppings do |t|
      t.references :order,   null: false, foreign_key: true
      t.references :topping, null: false, foreign_key: true
      t.integer    :scoop_count, null: false, default: 1

      t.timestamps
    end

    # Prevent the same topping from being added twice to one order
    add_index :order_toppings, [:order_id, :topping_id], unique: true
  end
end

# --- Models ---

class Size < ApplicationRecord
  has_many :orders
end

class Flavor < ApplicationRecord
  has_many :orders
end

class Topping < ApplicationRecord
  has_many :order_toppings
  has_many :orders, through: :order_toppings
end

class Order < ApplicationRecord
  belongs_to :size
  belongs_to :flavor

  has_many :order_toppings
  has_many :toppings, through: :order_toppings
end

class OrderTopping < ApplicationRecord
  belongs_to :order
  belongs_to :topping

  # The data that justifies this junction table's existence:
  # scoop_count is why we use has_many :through instead of habtm
end

# --- Usage examples ---

# Correct: access scoop_count through the join model
order = Order.find(1)
order.order_toppings.each do |ot|
  puts "#{ot.topping.name}: #{ot.scoop_count} scoops"
end

# Wrong: this loses scoop_count entirely
# order.toppings  ← only gives you Topping records, not the scoop data
