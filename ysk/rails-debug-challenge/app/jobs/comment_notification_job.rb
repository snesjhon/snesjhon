# frozen_string_literal: true
# typed: true

class CommentNotificationJob < ApplicationJob
  queue_as :default
  # BUG: no retry_on or discard_on configured — failed jobs retry forever.

  def perform(comment)
    # BUG: receiving an ActiveRecord object directly instead of an ID.
    # If the comment is deleted between enqueue and execution, this raises ActiveJob::DeserializationError.

    PostMailer.new_comment(comment).deliver_now
    # BUG: deliver_now blocks the Sidekiq worker thread for the duration of the SMTP call.
  end
end
