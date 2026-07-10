# Permissions Policy — restrict browser features
# See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy

Rails.application.config.permissions_policy do |policy|
  policy.camera      :none
  policy.gyroscope   :none
  policy.magnetometer :none
  policy.microphone  :none
  policy.usb         :none
  policy.fullscreen  :self
end
