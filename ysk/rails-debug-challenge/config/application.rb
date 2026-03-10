# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'

Bundler.require(*Rails.groups)

module RailsDebugChallenge
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = false
  end
end
