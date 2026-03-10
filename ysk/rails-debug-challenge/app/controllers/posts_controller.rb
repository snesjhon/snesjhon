# frozen_string_literal: true
# typed: true

class PostsController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[index show]
  before_action :set_post, only: %i[show edit update destroy]

  def index
    @posts = Post.published.recent.includes(:user, :comments)
  end

  def show
    @comments = @post.comments
  end

  def new
    @post = Post.new
  end

  def create
    @post = T.must(current_user).posts.build(post_params)
    if @post.save
      redirect_to @post, notice: 'Post created!'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit; end

  def update
    if @post.update(post_params)
      redirect_to @post, notice: 'Post updated!'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_path, notice: 'Post deleted.'
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  sig { returns(ActionController::Parameters) }
  def post_params
    params.require(:post).permit(:title, :body, :excerpt, :published)
  end
end
