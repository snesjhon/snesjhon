# Lesson 3: Keys & Constraints
#
# Two layers:
#   - DB layer: null constraints, foreign keys, unique indexes (in migrations)
#   - App layer: business rules that span multiple tables (in models)

# --- Final migrations with all constraints ---

class CreateSizes < ActiveRecord::Migration[7.0]
  def change
    create_table :sizes do |t|
      t.string  :name,       null: false
      t.decimal :price,      null: false, precision: 8, scale: 2
      t.decimal :max_weight, null: false, precision: 8, scale: 2
      t.timestamps
    end
    add_index :sizes, :name, unique: true   # "Small" should only exist once
  end
end

class CreateFlavors < ActiveRecord::Migration[7.0]
  def change
    create_table :flavors do |t|
      t.string :name, null: false
      t.timestamps
    end
    add_index :flavors, :name, unique: true
  end
end

class CreateToppings < ActiveRecord::Migration[7.0]
  def change
    create_table :toppings do |t|
      t.string  :name,             null: false
      t.decimal :weight_per_scoop, null: false, precision: 8, scale: 2
      t.timestamps
    end
    add_index :toppings, :name, unique: true
  end
end

class CreateOrders < ActiveRecord::Migration[7.0]
  STATUSES = %w[pending preparing ready completed].freeze

  def change
    create_table :orders do |t|
      t.integer :customer_id, null: false
      t.references :size,     null: false, foreign_key: true
      t.references :flavor,   null: false, foreign_key: true
      t.string  :status,      null: false, default: "pending"
      t.timestamps
    end
  end
end

class CreateOrderToppings < ActiveRecord::Migration[7.0]
  def change
    create_table :order_toppings do |t|
      t.references :order,   null: false, foreign_key: true
      t.references :topping, null: false, foreign_key: true
      t.integer    :scoop_count, null: false
      t.timestamps
    end
    # Structural rule: one row per topping per order
    add_index :order_toppings, [:order_id, :topping_id], unique: true
  end
end

# --- Models with business rule validations ---

class Order < ApplicationRecord
  STATUSES = %w[pending preparing ready completed].freeze

  belongs_to :size
  belongs_to :flavor
  has_many :order_toppings
  has_many :toppings, through: :order_toppings

  validates :status, inclusion: { in: STATUSES }

  # Business rule: total topping weight cannot exceed size's max_weight
  # This spans 3 tables — it belongs here, not in a DB CHECK constraint
  validate :weight_within_limit

  def total_weight
    order_toppings.sum { |ot| ot.topping.weight_per_scoop * ot.scoop_count }
  end

  private

  def weight_within_limit
    return unless size  # size presence is validated by belongs_to

    if total_weight > size.max_weight
      errors.add(:base, "Total topping weight exceeds the #{size.name} size limit")
    end
  end
end

class OrderTopping < ApplicationRecord
  belongs_to :order
  belongs_to :topping

  validates :scoop_count, numericality: { greater_than: 0 }
end

# --- The rule in action ---

# When a customer places an order:
order = Order.new(size: Size.find_by(name: "Small"), flavor: Flavor.first)
order.order_toppings.build(topping: Topping.find_by(name: "Granola"), scoop_count: 10)

order.valid?
# => false
# order.errors.full_messages
# => ["Total topping weight exceeds the Small size limit"]
