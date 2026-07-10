module Parsers
  class DocxParser
    def initialize(file_path)
      @file_path = file_path
    end

    def extract
      doc = Docx::Document.open(@file_path)

      parts = []

      doc.paragraphs.each do |paragraph|
        text = paragraph.text.strip
        next if text.blank?
        parts << text
      end

      # Also extract from tables if present
      doc.tables.each do |table|
        table.rows.each do |row|
          cells = row.cells.map { |cell| cell.text.strip }.reject(&:blank?)
          parts << cells.join(" | ") unless cells.empty?
        end
      end

      parts.join("\n")
    rescue StandardError => e
      Rails.logger.warn("[DocxParser] Failed to parse DOCX: #{e.message}")
      ""
    end
  end
end
