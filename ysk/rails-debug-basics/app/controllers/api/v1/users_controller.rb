module Api
  module V1
    class UsersController < ApplicationController
      def stats
        id = params[:id]
        posts = Post.by_author(id)
        total_comments = posts.joins(:comments).count
        render json: {
          total_posts: posts.count,
          publish_posts: posts.published.count,
          draft_posts: posts.by_status('draft').count,
          total_comments_received: total_comments
        }
      end
    end
  end
end
