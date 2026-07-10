# Content Security Policy (CSP) configuration
# See: https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :data
    policy.img_src     :self, :data, :https
    policy.object_src  :none
    policy.script_src  :self
    policy.style_src   :self
    policy.connect_src :self
    policy.frame_ancestors :none
    policy.base_uri    :self
    policy.form_action :self

    # Allow Vite dev server in development
    if Rails.env.development?
      vite_host = "http://#{ViteRuby.config.host_with_port}"
      vite_ws   = "ws://#{ViteRuby.config.host_with_port}"

      policy.script_src  :self, :unsafe_eval, vite_host
      policy.style_src   :self, :unsafe_inline, vite_host
      policy.connect_src :self, vite_host, vite_ws
    end

    # Allow blob: for test environment (Capybara)
    policy.script_src(*policy.script_src, :blob) if Rails.env.test?
  end

  # Use nonces for inline scripts/styles
  config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
  config.content_security_policy_nonce_directives = %w[script-src style-src]

  # Report-only mode initially to avoid breaking things
  config.content_security_policy_report_only = true
end
