# frozen_string_literal: true
# typed: true

class UsersController < ApplicationController
  extend T::Sig

  def show
    @user = User.find(params[:id])
    @posts = @user.published_posts
  end

  def dashboard
    user = T.must(current_user)
    @posts = user.posts.recent
    @stats = {
      total: user.posts.count,
      published: user.posts.published.count,
      comments: user.comments.count
    }
  end

  def edit
    @user = T.must(current_user)
  end

  def update
    @user = T.must(current_user)
    if @user.update(user_params)
      redirect_to @user, notice: 'Profile updated!'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  sig { returns(ActionController::Parameters) }
  def user_params
    params.require(:user).permit(:name, :email, :bio, :password, :password_confirmation)
  end
end
