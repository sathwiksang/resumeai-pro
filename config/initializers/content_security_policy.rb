# Content Security Policy (CSP) configuration
# See: https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :data
    policy.img_src     :self, :data, :https
    policy.object_src  :none
    policy.script_src  :self
    # The React/Inertia UI uses CSS-in-JS (framer-motion) which injects inline
    # style attributes that can't be nonced, so styles must allow inline.
    # Scripts stay nonce-strict (no unsafe-inline), which is where XSS bites.
    policy.style_src   :self, :unsafe_inline
    policy.style_src_attr :unsafe_inline
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

  # Nonce inline scripts only. style-src intentionally allows unsafe-inline
  # (CSS-in-JS) — if it were also in the nonce list the browser would ignore
  # unsafe-inline and block the injected styles.
  config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.base64(16) }
  config.content_security_policy_nonce_directives = %w[script-src]

  # Enforce in production; report-only elsewhere (keeps Vite HMR unblocked in
  # dev and avoids interfering with the test pipeline).
  config.content_security_policy_report_only = !Rails.env.production?
end
