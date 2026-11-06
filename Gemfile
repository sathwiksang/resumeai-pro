source "https://rubygems.org"

# === Core Framework ===
gem "rails", "~> 8.1.2"
gem "pg", "~> 1.7"
gem "puma", ">= 6.0"
gem "propshaft"
gem "bootsnap", require: false

# === Rails 8 Solid Trifecta ===
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# === Deployment ===
gem "kamal", require: false
gem "thruster", require: false

# === Frontend (Inertia + React) ===
gem "inertia_rails", "~> 3.23"
gem "vite_rails"

# === Authentication & Authorization ===
gem "bcrypt", "~> 3.1"
gem "pundit", "~> 2.4"

# === Multi-tenancy ===
gem "acts_as_tenant", "~> 1.0"

# === AI / LLM ===
gem "ruby_llm"
gem "neighbor"                    # pgvector integration
gem "faraday"                     # HTTP client for Ollama

# === Document Parsing ===
gem "pdf-reader", "~> 2.16"
gem "docx", "~> 0.13"
gem "rtesseract"                  # OCR fallback

# === Image Processing (ActiveStorage) ===
gem "image_processing", "~> 2.2"

# === Billing ===
gem "stripe", "~> 13.5"

# === Utilities ===
gem "rack-attack", "~> 6.7"
gem "pagy", "~> 43.8"            # Pagination

# === Monitoring ===
gem "mission_control-jobs"
gem "sentry-ruby"
gem "sentry-rails"
gem "lograge"

# === Platform ===
gem "tzinfo-data", platforms: %i[windows jruby]

group :development, :test do
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"
  gem "rspec-rails", "~> 8.0"
  gem "factory_bot_rails"
  gem "faker"
  gem "rubocop-rails-omakase", require: false
  gem "brakeman", require: false
  gem "bundler-audit", require: false
  gem "bullet"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "webmock"
  gem "shoulda-matchers"
  gem "simplecov", require: false
end

group :development do
  gem "web-console"
end
