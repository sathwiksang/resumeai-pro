Stripe.api_key = ENV.fetch("STRIPE_SECRET_KEY", Rails.application.credentials.dig(:stripe, :secret_key))
Stripe.api_version = "2024-12-18.acacia"
