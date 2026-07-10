class DocumentParser
  class UnsupportedFormatError < StandardError; end
  class FileTooLargeError < StandardError; end
  class ParseError < StandardError; end

  SUPPORTED_TYPES = %w[
    application/pdf
    application/vnd.openxmlformats-officedocument.wordprocessingml.document
    text/plain
    text/rtf
  ].freeze

  MAX_FILE_SIZE = 10.megabytes

  def self.parse(file_path, content_type:)
    new(file_path, content_type).parse
  end

  def initialize(file_path, content_type)
    @file_path = file_path
    @content_type = content_type
  end

  def parse
    validate!
    text = extract_text
    cleaned = TextCleaner.clean(text)

    {
      raw_text: cleaned,
      word_count: cleaned.split.size,
      content_digest: Digest::SHA256.hexdigest(cleaned),
      parsed_at: Time.current,
    }
  end

  private

  def validate!
    unless File.exist?(@file_path)
      raise ParseError, "File not found: #{@file_path}"
    end

    file_size = File.size(@file_path)
    if file_size > MAX_FILE_SIZE
      raise FileTooLargeError, "File exceeds #{MAX_FILE_SIZE / 1.megabyte}MB limit (#{(file_size / 1.megabyte.to_f).round(1)}MB)"
    end

    unless SUPPORTED_TYPES.any? { |type| @content_type&.match?(type.gsub(".", "\\.")) }
      raise UnsupportedFormatError, "Unsupported content type: #{@content_type}"
    end
  end

  def extract_text
    text = case @content_type
           when "application/pdf"
             Parsers::PdfParser.new(@file_path).extract
           when /wordprocessingml/, /msword/
             Parsers::DocxParser.new(@file_path).extract
           when "text/plain", "text/rtf"
             Parsers::TextParser.new(@file_path).extract
           else
             raise UnsupportedFormatError, "No parser for: #{@content_type}"
           end

    if text.blank?
      raise ParseError, "Could not extract any text from the document"
    end

    text
  end
end
