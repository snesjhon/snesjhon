# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'

Bundler.require(*Rails.groups)

module RailsDebugBasics
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
  end
end
