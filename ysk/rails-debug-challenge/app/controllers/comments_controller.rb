# frozen_string_literal: true
# typed: true

class CommentsController < ApplicationController
  extend T::Sig

  def create
    @post = Post.find(params[:post_id])
    @comment = @post.comments.build(comment_params)
    @comment.user_id = T.must(current_user).id

    if @comment.save
      redirect_to @post, notice: 'Comment added!'
    else
      redirect_to @post, alert: @comment.errors.full_messages.to_sentence
    end
  end

  def destroy
    @comment = Comment.find(params[:id])
    @comment.destroy
    redirect_to @comment.post, notice: 'Comment removed.'
  end

  private

  sig { returns(ActionController::Parameters) }
  def comment_params
    params.require(:comment).permit(:body)
  end
end
