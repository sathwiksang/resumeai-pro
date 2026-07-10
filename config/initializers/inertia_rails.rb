InertiaRails.configure do |config|
  config.version = ViteRuby.digest
  # Opt in to the InertiaRails 4.0 behavior now (empty errors hash always
  # included) — adopts the future default and silences the deprecation
  # warning emitted on every response.
  config.always_include_errors_hash = true
end
