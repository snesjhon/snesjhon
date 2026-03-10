# frozen_string_literal: true
# typed: true

# Called via: PostPublishService.new(post, current_user).call
class PostPublishService
  def initialize(post, user)
    @post = post
    @user = user
  end

  def call
    # BUG: no transaction — if anything below raises, @post is already published with no rollback.
    @post.update!(published: true)

    ActivityLog.create!(
      user: @user,
      action: "publish",
      target_type: "Post",
      target_id: @post.id
    )
    # BUG: ActivityLog model doesn't exist — raises NameError after @post is already published.

    CommentNotificationJob.perform_now(@post)
    # BUG: passing an AR object instead of an ID.
    # BUG: perform_now is synchronous — blocks the request.
    # BUG: wrong job — this job handles new comments, not publish events.
  end
end
