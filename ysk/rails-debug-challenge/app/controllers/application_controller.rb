# frozen_string_literal: true
# typed: true

class ApplicationController < ActionController::Base
  extend T::Sig

  before_action :authenticate_user!

  private

  sig { void }
  def authenticate_user!
    return if current_user

    redirect_to login_path, alert: 'You must be logged in.'
  end

  sig { returns(T.nilable(User)) }
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
  helper_method :current_user
end
