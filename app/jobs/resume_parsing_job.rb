class ResumeParsingJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  def perform(resume_id)
    resume = Resume.find(resume_id)
    resume.update!(status: :parsing)

    # Download from ActiveStorage to a tempfile
    tempfile = download_to_tempfile(resume.document)

    # Parse document to extract raw text
    result = DocumentParser.parse(
      tempfile.path,
      content_type: resume.document.content_type
    )

    # Generate embedding via Ollama
    embedding = generate_embedding(result[:raw_text])

    resume.update!(
      raw_text: result[:raw_text],
      content_digest: result[:content_digest],
      embedding: embedding,
      status: :parsed
    )

    # Chain to structured extraction job
    ResumeExtractionJob.perform_later(resume_id)

  rescue DocumentParser::UnsupportedFormatError,
         DocumentParser::FileTooLargeError,
         DocumentParser::ParseError => e
    resume.update!(status: :error, error_message: e.message)
  rescue OllamaService::ConnectionError => e
    # Ollama down — mark parsed without embedding, don't fail
    Rails.logger.warn("[ResumeParsingJob] Ollama unavailable, skipping embedding: #{e.message}")
    resume.update!(
      raw_text: result[:raw_text],
      content_digest: result[:content_digest],
      status: :parsed
    )
    ResumeExtractionJob.perform_later(resume_id)
  ensure
    tempfile&.close
    tempfile&.unlink
  end

  private

  def download_to_tempfile(attachment)
    ext = File.extname(attachment.filename.to_s)
    tempfile = Tempfile.new(["resume", ext])
    tempfile.binmode
    attachment.download { |chunk| tempfile.write(chunk) }
    tempfile.rewind
    tempfile
  end

  def generate_embedding(text)
    OllamaService.embed(text)
  rescue OllamaService::ConnectionError, OllamaService::ModelError => e
    Rails.logger.warn("[ResumeParsingJob] Embedding generation failed: #{e.message}")
    nil
  end
end
