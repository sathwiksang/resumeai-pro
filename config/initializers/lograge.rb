Rails.application.configure do
  config.lograge.enabled = Rails.env.production?
  config.lograge.base_controller_class = "ActionController::Base"

  config.lograge.custom_options = lambda do |event|
    options = {
      request_id: event.payload[:request_id],
      user_id: event.payload[:user_id],
      organization_id: event.payload[:organization_id],
    }
    options[:exception] = event.payload[:exception]&.first if event.payload[:exception]
    options.compact
  end
end
