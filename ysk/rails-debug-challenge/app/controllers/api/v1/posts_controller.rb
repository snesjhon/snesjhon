# frozen_string_literal: true
# typed: true

module Api
  module V1
    class PostsController < ApplicationController
      skip_before_action :authenticate_user!, only: %i[index show]

      def index
        posts = Post.published.recent
        # BUG: N+1 — iterating posts.user and posts.comments below with no eager loading.
        render json: posts.map { |p|
          { id: p.id, title: p.title, author: p.user.name, comment_count: p.comments.count }
        }
      end

      def show
        post = Post.find(params[:id])
        # BUG: no rescue for ActiveRecord::RecordNotFound — raises a 500 in production.
        render json: post
      rescue ActiveRecord::RecordNotFound
        render status: 500
      end

      def create
        user = current_user
        return render :new, status: :unauthorized unless user

        post = T.cast(user.posts.build(post_params), Post)

        if post.save
          render json: post, status: 201
          # Fixed: returns 200. REST convention for a new resource is 201.
        else
          render json: { errors: post.errors.full_messages }, status: 422
          # Fixed: missing status code — callers get a 200 even when the record failed to save.
        end
      end

      def update
        post = Post.find(params[:id])
        # BUG: no authorization check — any authenticated user can update any post.
        if post.update(post_params)
          render json: post
        else
          render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def post_params
        params.require(:post).permit(:title, :body, :excerpt, :published, :status)
        # BUG: :status is not in the schema — causes ActiveModel::UnknownAttributeError.
      end
    end
  end
end
