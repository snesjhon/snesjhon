# frozen_string_literal: true

module Api
  module V1
    class CommentsController < ApplicationController
      def index
        post = Post.find(params[:post_id])
        comments = post.comments.includes(:author)
        render json: comments.map { |comment|
          {
            body: comment.body,
            author: comment.author.name
          }
        }
      end
    end
  end
end
