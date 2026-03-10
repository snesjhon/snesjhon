# frozen_string_literal: true
# typed: true

Rails.application.routes.draw do
  root 'posts#index'

  resources :posts do
    resources :comments, only: %i[create destroy]
  end

  resources :users, only: %i[show edit update]

  get '/dashboard', to: 'users#dashboard'
end
