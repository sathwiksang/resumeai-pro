module AuthenticationHelpers
  def sign_in(user)
    session_record = user.sessions.create!(
      user_agent: "RSpec Test",
      ip_address: "127.0.0.1"
    )
    # Rack::Test doesn't support `cookies.signed`, so we use the
    # ActionDispatch secret to produce a signed cookie value.
    jar = ActionDispatch::Request.new(Rails.application.env_config.dup).cookie_jar
    jar.signed[:session_id] = { value: session_record.id, httponly: true }
    cookies[:session_id] = jar[:session_id]
    # Set tenant for acts_as_tenant
    ActsAsTenant.current_tenant = user.organization
  end
end

RSpec.configure do |config|
  config.include AuthenticationHelpers, type: :request
end
