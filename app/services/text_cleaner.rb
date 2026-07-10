class TextCleaner
  # Normalizes extracted text from various document formats into clean, consistent output.
  def self.clean(text)
    return "" if text.nil?

    safe_text = text
      .dup
      .force_encoding("UTF-8")
      .encode("UTF-8", invalid: :replace, undef: :replace, replace: "")

    return "" if safe_text.blank?

    safe_text
      .then { |t| normalize_line_endings(t) }
      .then { |t| strip_null_bytes(t) }
      .then { |t| collapse_whitespace(t) }
      .then { |t| normalize_blank_lines(t) }
      .then { |t| strip_page_numbers(t) }
      .then { |t| normalize_bullets(t) }
      .then { |t| normalize_dashes(t) }
      .then { |t| normalize_quotes(t) }
      .strip
  end

  class << self
    private

    def normalize_line_endings(text)
      text.gsub(/\r\n/, "\n").gsub(/\r/, "\n")
    end

    def strip_null_bytes(text)
      text.gsub(/\x00/, "")
    end

    def collapse_whitespace(text)
      # Collapse multiple spaces/tabs within a line (but not newlines)
      text.gsub(/[^\S\n]+/, " ")
    end

    def normalize_blank_lines(text)
      # Collapse 3+ consecutive newlines into 2
      text.gsub(/\n{3,}/, "\n\n")
    end

    def strip_page_numbers(text)
      # Remove standalone page numbers like "Page 1 of 5", "- 3 -", etc.
      text.gsub(/^\s*(?:Page\s+)?\d+\s*(?:of\s+\d+)?\s*$/i, "")
         .gsub(/^\s*-\s*\d+\s*-\s*$/, "")
    end

    def normalize_bullets(text)
      # Normalize various bullet characters to a simple dash
      text.gsub(/^[\s]*[•●○◦▪▸►▶❖✦✓✔☑◆⬥∎]\s*/m, "- ")
    end

    def normalize_dashes(text)
      # Normalize em-dash, en-dash to regular dash
      text.gsub(/[—–]/, "-")
    end

    def normalize_quotes(text)
      # Normalize smart quotes to standard quotes
      text.gsub(/[\u201C\u201D]/, '"').gsub(/[\u2018\u2019]/, "'")
    end
  end
end
