class Rack::Attack
  # === General Rate Limit ===
  throttle("req/ip", limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?("/assets", "/vite")
  end

  # === Login Throttle (by IP) ===
  throttle("logins/ip", limit: 5, period: 20.seconds) do |req|
    req.ip if req.path == "/session" && req.post?
  end

  # === Login Throttle (by email) ===
  throttle("logins/email", limit: 5, period: 1.minute) do |req|
    if req.path == "/session" && req.post?
      req.params.dig("email_address")&.downcase&.strip
    end
  end

  # === Registration Throttle ===
  throttle("registrations/ip", limit: 3, period: 1.hour) do |req|
    req.ip if req.path == "/registration" && req.post?
  end

  # === Webhook Throttle ===
  throttle("webhooks/ip", limit: 100, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/webhooks/")
  end

  # === Custom 429 Response ===
  self.throttled_responder = lambda do |matched, period, limit, req|
    now = Time.now.utc
    match_data = req.env["rack.attack.match_data"] || {}
    retry_after = (match_data[:period] || period) - (now.to_i % (match_data[:period] || period))

    headers = {
      "Content-Type" => "application/json",
      "Retry-After" => retry_after.to_s
    }

    body = {
      error: "Rate limit exceeded",
      retry_after: retry_after
    }.to_json

    [429, headers, [body]]
  end
end
