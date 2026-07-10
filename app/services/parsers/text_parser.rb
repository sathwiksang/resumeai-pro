module Parsers
  class TextParser
    def initialize(file_path)
      @file_path = file_path
    end

    def extract
      content = File.read(@file_path)

      # Handle various encodings
      unless content.valid_encoding?
        content = content.encode("UTF-8", "binary", invalid: :replace, undef: :replace, replace: "")
      end

      content
    rescue StandardError => e
      Rails.logger.warn("[TextParser] Failed to read text file: #{e.message}")
      ""
    end
  end
end
