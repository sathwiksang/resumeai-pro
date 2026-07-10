class OllamaService
  class ConnectionError < StandardError; end
  class ModelError < StandardError; end

  DEFAULT_BASE_URL = "http://localhost:11434"
  EMBED_MODEL = "nomic-embed-text"
  CHAT_MODEL = "qwen2.5:3b"
  FAST_MODEL = "llama3.2:3b"

  # Maximum text length for embeddings (nomic-embed-text supports 8192 tokens)
  MAX_EMBED_TEXT_LENGTH = 30_000 # characters

  def self.embed(text, model: EMBED_MODEL)
    new.embed(text, model: model)
  end

  def self.chat(prompt, system: nil, model: CHAT_MODEL, format: nil)
    new.chat(prompt, system: system, model: model, format: format)
  end

  def self.available?
    new.available?
  end

  def initialize(base_url: nil)
    @base_url = base_url || ENV.fetch("OLLAMA_BASE_URL", DEFAULT_BASE_URL)
    @conn = Faraday.new(url: @base_url) do |f|
      f.options.timeout = 120 # LLM responses can be slow
      f.options.open_timeout = 5
      f.adapter Faraday.default_adapter
    end
  end

  # Generate embedding vector for text
  def embed(text, model: EMBED_MODEL)
    truncated = text.to_s.truncate(MAX_EMBED_TEXT_LENGTH, omission: "")

    response = @conn.post("/api/embed") do |req|
      req.headers["Content-Type"] = "application/json"
      req.body = { model: model, input: truncated }.to_json
    end

    unless response.success?
      raise ModelError, "Embedding failed (#{response.status}): #{response.body}"
    end

    data = JSON.parse(response.body)
    embeddings = data["embeddings"]

    if embeddings.nil? || embeddings.empty?
      raise ModelError, "No embeddings returned from Ollama"
    end

    # Return the first embedding vector (768 dimensions for nomic-embed-text)
    embeddings.first
  rescue Faraday::ConnectionFailed, Faraday::TimeoutError => e
    raise ConnectionError, "Cannot connect to Ollama at #{@base_url}: #{e.message}"
  end

  # Chat completion with optional JSON format
  def chat(prompt, system: nil, model: CHAT_MODEL, format: nil)
    messages = []
    messages << { role: "system", content: system } if system.present?
    messages << { role: "user", content: prompt }

    body = { model: model, messages: messages, stream: false, options: { temperature: 0 } }
    body[:format] = format if format.present?

    response = @conn.post("/api/chat") do |req|
      req.headers["Content-Type"] = "application/json"
      req.body = body.to_json
    end

    unless response.success?
      raise ModelError, "Chat failed (#{response.status}): #{response.body}"
    end

    data = JSON.parse(response.body)

    {
      content: data.dig("message", "content"),
      model: data["model"],
      total_duration: data["total_duration"],
      eval_count: data["eval_count"],
      prompt_eval_count: data["prompt_eval_count"],
    }
  rescue Faraday::ConnectionFailed, Faraday::TimeoutError => e
    raise ConnectionError, "Cannot connect to Ollama at #{@base_url}: #{e.message}"
  end

  # Check if Ollama is running and the required models are available
  def available?
    response = @conn.get("/api/tags")
    return false unless response.success?

    data = JSON.parse(response.body)
    models = data["models"]&.map { |m| m["name"] } || []

    {
      online: true,
      models: models,
      has_embed_model: models.any? { |m| m.start_with?(EMBED_MODEL) },
      has_chat_model: models.any? { |m| m.start_with?(CHAT_MODEL) },
    }
  rescue Faraday::ConnectionFailed, Faraday::TimeoutError
    { online: false, models: [], has_embed_model: false, has_chat_model: false }
  end
end
