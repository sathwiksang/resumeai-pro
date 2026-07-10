module Parsers
  class PdfParser
    MIN_TEXT_THRESHOLD = 50 # chars — below this, try fallback extraction

    def initialize(file_path)
      @file_path = file_path
    end

    def extract
      # Strategy 1: pdf-reader gem (fast, native text extraction)
      text = extract_with_pdf_reader
      return text if text.length >= MIN_TEXT_THRESHOLD

      # Strategy 2: pdftotext via poppler (handles more PDF variants)
      text = extract_with_pdftotext
      return text if text.length >= MIN_TEXT_THRESHOLD

      # Strategy 3: OCR via Tesseract (for scanned/image PDFs)
      text = extract_with_ocr
      return text if text.length >= MIN_TEXT_THRESHOLD

      # Return whatever we got (may be empty, caller handles that)
      text
    end

    private

    def extract_with_pdf_reader
      reader = PDF::Reader.new(@file_path)
      reader.pages.map(&:text).join("\n\n")
    rescue PDF::Reader::MalformedPDFError, PDF::Reader::UnsupportedFeatureError => e
      Rails.logger.warn("[PdfParser] pdf-reader failed: #{e.message}")
      ""
    rescue StandardError => e
      Rails.logger.warn("[PdfParser] pdf-reader unexpected error: #{e.class} - #{e.message}")
      ""
    end

    def extract_with_pdftotext
      return "" unless pdftotext_available?

      output = nil
      Tempfile.create(["pdftext", ".txt"]) do |tmpfile|
        system("pdftotext", "-layout", @file_path, tmpfile.path, out: File::NULL, err: File::NULL)
        output = File.read(tmpfile.path)
      end
      output || ""
    rescue StandardError => e
      Rails.logger.warn("[PdfParser] pdftotext failed: #{e.message}")
      ""
    end

    def extract_with_ocr
      return "" unless tesseract_available?

      RTesseract.new(@file_path, lang: "eng").to_s
    rescue StandardError => e
      Rails.logger.warn("[PdfParser] OCR failed: #{e.message}")
      ""
    end

    def pdftotext_available?
      @pdftotext_available ||= system("which", "pdftotext", out: File::NULL, err: File::NULL)
    end

    def tesseract_available?
      @tesseract_available ||= system("which", "tesseract", out: File::NULL, err: File::NULL)
    end
  end
end
