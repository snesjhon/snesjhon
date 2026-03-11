# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Lesson 1 — CRUD + API Building
      # The index route is pre-built as your first example.
      # You will add :show, :create, :update, :destroy as you work through Lesson 1.
      # resources :posts, only: [:index]

      # Lesson 2 — ActiveRecord (uncomment as you progress)
      #
      # resources :posts, only: [:index, :show, :create, :update, :destroy] do
      #   resources :comments, only: [:create, :destroy]
      # end
      resources :posts, only: %i[index show create update destroy] do
        resources :comments, only: %i[create destroy]
      end
    end
  end
end
