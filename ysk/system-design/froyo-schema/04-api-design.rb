# Lesson 4: API Design
#
# The schema from Lessons 1-3 drives everything here.
# Routes map directly to actor needs, not to table names.

# --- config/routes.rb ---

Rails.application.routes.draw do
  namespace :api do
    # Reference data — powers the order form on the frontend
    resources :sizes,   only: [:index]
    resources :flavors, only: [:index]
    resources :toppings, only: [:index]

    # Customer order flow
    resources :orders, only: [:create, :show]

    # Employee order management — separate namespace, separate auth
    namespace :admin do
      resources :orders, only: [:index] do
        member do
          patch :status
        end
      end
    end
  end
end

# --- app/controllers/api/orders_controller.rb ---

class Api::OrdersController < ApplicationController
  def create
    order = Order.new(
      customer_id: current_customer.id,
      size_id:     order_params[:size_id],
      flavor_id:   order_params[:flavor_id]
    )

    # Build junction records from the toppings array in the request
    # This only works cleanly because order_toppings has scoop_count
    order_params[:toppings].each do |t|
      order.order_toppings.build(
        topping_id:  t[:topping_id],
        scoop_count: t[:scoop_count]
      )
    end

    if order.save  # weight validation fires here (Lesson 3)
      render json: order, status: :created
    else
      render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    order = Order.find(params[:id])
    render json: order.as_json(include: {
      size: {},
      flavor: {},
      order_toppings: { include: :topping }
    })
  end

  private

  def order_params
    params.require(:order).permit(
      :size_id,
      :flavor_id,
      toppings: [:topping_id, :scoop_count]
    )
  end
end

# --- app/controllers/api/admin/orders_controller.rb ---

class Api::Admin::OrdersController < ApplicationController
  before_action :require_employee!

  def index
    orders = Order.includes(:size, :flavor, :toppings).order(created_at: :desc)
    render json: orders
  end

  def status
    order = Order.find(params[:id])

    if order.update(status: params[:status])
      render json: order
    else
      render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
    end
  end
end

# --- What the request/response looks like ---

# POST /api/orders
# Body:
# {
#   "order": {
#     "size_id": 1,
#     "flavor_id": 2,
#     "toppings": [
#       { "topping_id": 3, "scoop_count": 2 },
#       { "topping_id": 5, "scoop_count": 1 }
#     ]
#   }
# }

# PATCH /api/admin/orders/42/status
# Body:
# { "status": "preparing" }

# Notice: the request body shape mirrors the schema.
# size_id, flavor_id as direct FKs.
# toppings as an array of objects because it's a junction table with data.
# This is the payoff of designing the schema correctly first.
