# The app talks to the model through its own OllamaService (Faraday) and does
# not use RubyLLM's acts_as_* model integration. Opt into the new acts_as API
# so the gem doesn't emit its legacy-API deprecation warning at boot.
RubyLLM.configure do |config|
  config.use_new_acts_as = true
end
