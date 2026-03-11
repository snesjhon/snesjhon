# frozen_string_literal: true

Rails.application.configure do
  config.eager_load = true
  config.cache_classes = true
  config.log_level = :info
  config.force_ssl = true
end
