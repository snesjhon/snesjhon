# frozen_string_literal: true

class PostPublishService
  def initialize(post, user)
    @post = post
    @user = user
  end

  def call
    raise ArgumentError, 'Not authorized' unless @post.user == @user

    ActiveRecord::Base.transaction do
      @post.update!(status: 'published')
    end

    true
  rescue ActiveRecord::RecordInvalid
    false
  end
end
