# frozen_string_literal: true

module Api
  module V1
    class PostsController < ApplicationController
      # ─── EXAMPLE (pre-built) ──────────────────────────────────────────────
      # GET /api/v1/posts
      # Returns all published posts with their author name and comment count.
      # Notice: includes(:user, :comments) prevents N+1 queries — Lesson 2 covers why.
      def index
        posts = if params[:status].present?
                  current_user.posts.by_status(status)
                else
                  Post.published
                end.includes(:user, :comments).recent

        render json: posts.map { |post|
          {
            id: post.id,
            title: post.title,
            body: post.body,
            status: post.status,
            author: post.user.name,
            comment_count: post.comments.size,
            created_at: post.created_at
          }
        }
      end

      # ─── YOUR TURN ────────────────────────────────────────────────────────
      # Lesson 1, Exercise 1: GET /api/v1/posts/:id
      # Should return a single post or 404 if not found.
      # Hint: Post.find raises ActiveRecord::RecordNotFound — rescue it.
      #
      def show
        post = Post.find(params[:id])
        comments = post.comments.includes(:author)

        render json: {
          id: post.id,
          title: post.title,
          body: post.body,
          status: post.status,
          author: post.user.name,
          comments: comments.map do |c|
            {
              body: c.body,
              author: c.author.name
            }
          end,
          created_at: post.created_at
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'not found' }, status: :not_found
      end

      # Lesson 1, Exercise 2: POST /api/v1/posts
      # Should create a post owned by current_user.
      # Hint: use current_user.posts.build(post_params), check .save, return 201 or 422.
      #
      def create
        post = current_user.posts.build(post_params)
        if post.save
          render json: post, status: 201
        else
          render json: { error: 'failed to save' }, status: 422
        end
      end

      # Lesson 1, Exercise 3: PATCH /api/v1/posts/:id
      # Should only allow the author to update their own post.
      # Hint: scope to current_user.posts.find(params[:id]) — not Post.find.
      #
      def update
        id = params[:id]
        post = current_user.posts.find(id)
        comments = post.comments.includes(:author)

        if post.update(post_params)
          render json: {
            id: post.id,
            title: post.title,
            body: post.body,
            status: post.status,
            author: post.user.name,
            comments: comments.map do |c|
              {
                body: c.body,
                author: c.author.name
              }
            end,
            created_at: post.created_at
          }
        else
          render json: { error: 'unable to post' }, status: 422
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'unable to find record' }, status: 402
      end

      # Lesson 1, Exercise 4: DELETE /api/v1/posts/:id
      # Should destroy the post and return 204 No Content.
      # Hint: same scoping as update — a user can only delete their own post.
      #
      def destroy
        id = params[:id]
        post = current_user.posts.find(id)
        post.destroy!
        head :no_content
      rescue ActiveRecord::RecordNotDestroyed
        render json: { error: 'unable to destroy record' }, status: :not_found
      end

      def commented_on
        posts = Post.joins(:comments).where({ comments: { user_id: current_user.id } })
                    .includes(:user).distinct

        render json: posts.map { |post|
          {
            body: post.body,
            id: post.id,
            title: post.title,
            author_name: post.user.name,
            status: post.status
          }
        }
      end

      def popular
        min_param = params[:min_comments]
        min_comments = min_param.nil? ? 1 : min_param.to_i

        posts = Post.left_joins(:comments)
                    .group('posts.id')
                    .having('COUNT(comments.id) >= ?', min_comments)
                    .select('posts.*,COUNT(comments.id ) as comment_count')
                    .includes(:user)

        render json: posts.map { |post|
          {
            id: post.id,
            title: post.title,
            author_name: post.user.name,
            comment_count: post.comment_count
          }
        }
      end

      def feed
        published_posts = Post.left_join(:comments)
                              .group('posts.id')
                              .published
                              .includes(:user)
                              .select('posts.*, COUNT(comment.id) as comment_count')

        render json: published_posts.map { |post|
          {
            id: post.id,
            title: post.title,
            author_name: post.user.name,
            commnet_count: post.comment_count
          }
        }
      end

      def by_engaged_users
        commented_posts = Post.published.joins(:user).includes(:user).merge(User.with_comments).recent

        render json: commented_posts.map { |post|
          {
            id: post.id,
            status: post.status,
            author: post.user.name,
            title: post.title
          }
        }
      end

      private

      # Lesson 1, Exercise 2 (part 2): Define strong params.
      # Which fields should a user be allowed to set? Which should they NOT?
      #
      def post_params
        params.require(:post).permit(:title, :body, :status)
      end
    end
  end
end
