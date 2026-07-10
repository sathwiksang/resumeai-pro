require "rails_helper"

RSpec.describe OllamaService do
  let(:service) { described_class.new }

  describe "#embed" do
    it "returns an embedding vector" do
      stub_request(:post, "http://localhost:11434/api/embed")
        .with(body: hash_including("model" => "nomic-embed-text"))
        .to_return(
          status: 200,
          body: { embeddings: [Array.new(768) { rand(-1.0..1.0) }] }.to_json,
          headers: { "Content-Type" => "application/json" }
        )

      result = service.embed("Senior Ruby developer with 5 years experience")
      expect(result).to be_an(Array)
      expect(result.length).to eq(768)
    end

    it "truncates text exceeding MAX_EMBED_TEXT_LENGTH" do
      long_text = "x" * 50_000

      stub_request(:post, "http://localhost:11434/api/embed")
        .with { |req|
          body = JSON.parse(req.body)
          body["input"].length <= OllamaService::MAX_EMBED_TEXT_LENGTH
        }
        .to_return(
          status: 200,
          body: { embeddings: [Array.new(768) { 0.1 }] }.to_json,
          headers: { "Content-Type" => "application/json" }
        )

      result = service.embed(long_text)
      expect(result).to be_an(Array)
    end

    it "raises ModelError on non-success response" do
      stub_request(:post, "http://localhost:11434/api/embed")
        .to_return(status: 500, body: "Internal Server Error")

      expect {
        service.embed("test text")
      }.to raise_error(OllamaService::ModelError, /Embedding failed/)
    end

    it "raises ModelError when no embeddings returned" do
      stub_request(:post, "http://localhost:11434/api/embed")
        .to_return(
          status: 200,
          body: { embeddings: [] }.to_json,
          headers: { "Content-Type" => "application/json" }
        )

      expect {
        service.embed("test text")
      }.to raise_error(OllamaService::ModelError, /No embeddings returned/)
    end

    it "raises ConnectionError when Ollama is unreachable" do
      stub_request(:post, "http://localhost:11434/api/embed")
        .to_raise(Faraday::ConnectionFailed.new("Connection refused"))

      expect {
        service.embed("test text")
      }.to raise_error(OllamaService::ConnectionError, /Cannot connect to Ollama/)
    end

    it "raises ConnectionError on timeout" do
      stub_request(:post, "http://localhost:11434/api/embed")
        .to_raise(Faraday::TimeoutError)

      expect {
        service.embed("test text")
      }.to raise_error(OllamaService::ConnectionError)
    end
  end

  describe "#chat" do
    let(:chat_response) do
      {
        message: { content: '{"name": "John Doe"}' },
        model: "qwen2.5:3b",
        total_duration: 1_000_000,
        eval_count: 50,
        prompt_eval_count: 100,
      }.to_json
    end

    it "returns structured response with content" do
      stub_request(:post, "http://localhost:11434/api/chat")
        .to_return(
          status: 200,
          body: chat_response,
          headers: { "Content-Type" => "application/json" }
        )

      result = service.chat("Extract data", system: "You are a parser", format: "json")
      expect(result[:content]).to eq('{"name": "John Doe"}')
      expect(result[:model]).to eq("qwen2.5:3b")
      expect(result[:eval_count]).to eq(50)
    end

    it "sends system message when provided" do
      stub_request(:post, "http://localhost:11434/api/chat")
        .with { |req|
          body = JSON.parse(req.body)
          body["messages"].length == 2 &&
            body["messages"][0]["role"] == "system" &&
            body["messages"][1]["role"] == "user"
        }
        .to_return(status: 200, body: chat_response, headers: { "Content-Type" => "application/json" })

      service.chat("Hello", system: "Be helpful")
    end

    it "omits system message when not provided" do
      stub_request(:post, "http://localhost:11434/api/chat")
        .with { |req|
          body = JSON.parse(req.body)
          body["messages"].length == 1 && body["messages"][0]["role"] == "user"
        }
        .to_return(status: 200, body: chat_response, headers: { "Content-Type" => "application/json" })

      service.chat("Hello")
    end

    it "includes format when specified" do
      stub_request(:post, "http://localhost:11434/api/chat")
        .with { |req| JSON.parse(req.body)["format"] == "json" }
        .to_return(status: 200, body: chat_response, headers: { "Content-Type" => "application/json" })

      service.chat("Hello", format: "json")
    end

    it "raises ModelError on non-success response" do
      stub_request(:post, "http://localhost:11434/api/chat")
        .to_return(status: 404, body: "model not found")

      expect {
        service.chat("Hello")
      }.to raise_error(OllamaService::ModelError, /Chat failed/)
    end

    it "raises ConnectionError when Ollama is unreachable" do
      stub_request(:post, "http://localhost:11434/api/chat")
        .to_raise(Faraday::ConnectionFailed.new("Connection refused"))

      expect {
        service.chat("Hello")
      }.to raise_error(OllamaService::ConnectionError)
    end
  end

  describe "#available?" do
    it "returns status with model availability" do
      stub_request(:get, "http://localhost:11434/api/tags")
        .to_return(
          status: 200,
          body: {
            models: [
              { name: "nomic-embed-text:latest" },
              { name: "qwen2.5:3b" },
              { name: "llama3.2:3b" },
            ],
          }.to_json,
          headers: { "Content-Type" => "application/json" }
        )

      result = service.available?
      expect(result[:online]).to be true
      expect(result[:models]).to include("nomic-embed-text:latest")
      expect(result[:has_embed_model]).to be true
      expect(result[:has_chat_model]).to be true
    end

    it "reports missing models correctly" do
      stub_request(:get, "http://localhost:11434/api/tags")
        .to_return(
          status: 200,
          body: { models: [{ name: "llama3.2:3b" }] }.to_json,
          headers: { "Content-Type" => "application/json" }
        )

      result = service.available?
      expect(result[:online]).to be true
      expect(result[:has_embed_model]).to be false
      expect(result[:has_chat_model]).to be false
    end

    it "returns offline status when Ollama is unreachable" do
      stub_request(:get, "http://localhost:11434/api/tags")
        .to_raise(Faraday::ConnectionFailed.new("Connection refused"))

      result = service.available?
      expect(result[:online]).to be false
      expect(result[:models]).to eq([])
      expect(result[:has_embed_model]).to be false
      expect(result[:has_chat_model]).to be false
    end

    it "returns offline status on timeout" do
      stub_request(:get, "http://localhost:11434/api/tags")
        .to_raise(Faraday::TimeoutError)

      result = service.available?
      expect(result[:online]).to be false
    end
  end

  describe "class methods" do
    it ".embed delegates to instance" do
      stub_request(:post, "http://localhost:11434/api/embed")
        .to_return(
          status: 200,
          body: { embeddings: [Array.new(768) { 0.5 }] }.to_json,
          headers: { "Content-Type" => "application/json" }
        )

      result = OllamaService.embed("test")
      expect(result.length).to eq(768)
    end

    it ".chat delegates to instance" do
      stub_request(:post, "http://localhost:11434/api/chat")
        .to_return(
          status: 200,
          body: { message: { content: "hi" }, model: "qwen2.5:3b" }.to_json,
          headers: { "Content-Type" => "application/json" }
        )

      result = OllamaService.chat("hello")
      expect(result[:content]).to eq("hi")
    end

    it ".available? delegates to instance" do
      stub_request(:get, "http://localhost:11434/api/tags")
        .to_return(status: 200, body: { models: [] }.to_json, headers: { "Content-Type" => "application/json" })

      result = OllamaService.available?
      expect(result[:online]).to be true
    end
  end
end
