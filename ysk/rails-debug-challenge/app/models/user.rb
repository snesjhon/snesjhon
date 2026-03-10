# frozen_string_literal: true
# typed: true

class User < ApplicationRecord
  has_secure_password

  has_many :posts, dependent: :destroy
  has_many :comments

  validates :name,  presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :bio,   length: { maximum: 300 }

  def published_posts
    posts.where(published: true).order(:created_at)
  end

  def display_name
    name.split.map(&:capitalize).join(' ')
  end
end
