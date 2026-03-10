# frozen_string_literal: true
# typed: true

class Post < ApplicationRecord
  belongs_to :user
  has_many :comments, dependent: :destroy

  validates :title,  presence: true, length: { maximum: 100 }
  validates :body,   presence: true
  validates :status, inclusion: { in: %w[draft published archived] }

  scope :published, -> { where(published: true) }
  scope :recent,    -> { order(created_at: :desc) }
  scope :by_author, ->(user) { where(user: user) }

  def summary
    excerpt.presence || body.truncate(150)
  end
end
