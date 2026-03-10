# frozen_string_literal: true
# typed: true

class Comment < ApplicationRecord
  belongs_to :post
  belongs_to :author, class_name: 'User', foreign_key: 'user_id'

  validates :body, presence: true, length: { minimum: 2, maximum: 1000 }

  after_create :notify_post_author

  private

  def notify_post_author
    PostMailer.new_comment(self).deliver_later
  end
end
