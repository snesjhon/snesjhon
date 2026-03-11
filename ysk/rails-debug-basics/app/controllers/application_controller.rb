# frozen_string_literal: true

class ApplicationController < ActionController::API
  before_action :require_login!

  private

  # Reads X-User-Id from request headers to identify the current user.
  # In a real app this would be a JWT or session token — kept simple here
  # so we can focus on CRUD patterns rather than auth mechanics.
  def current_user
    @current_user ||= User.find_by(id: request.headers['X-User-Id'])
  end

  def require_login!
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
  end
end
