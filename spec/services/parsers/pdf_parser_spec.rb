require "rails_helper"

RSpec.describe Parsers::PdfParser do
  describe "#extract" do
    context "when pdf-reader extracts sufficient text" do
      it "returns the extracted text" do
        parser = described_class.new("/tmp/test.pdf")
        mock_reader = instance_double(PDF::Reader)
        mock_page = instance_double(PDF::Reader::Page, text: "John Doe - Software Engineer with 5 years experience in Ruby on Rails and React")

        allow(PDF::Reader).to receive(:new).and_return(mock_reader)
        allow(mock_reader).to receive(:pages).and_return([mock_page])

        result = parser.extract
        expect(result).to include("John Doe")
        expect(result.length).to be >= Parsers::PdfParser::MIN_TEXT_THRESHOLD
      end
    end

    context "when pdf-reader returns insufficient text" do
      it "falls back to pdftotext" do
        parser = described_class.new("/tmp/test.pdf")

        # pdf-reader returns too little text
        mock_reader = instance_double(PDF::Reader)
        mock_page = instance_double(PDF::Reader::Page, text: "short")
        allow(PDF::Reader).to receive(:new).and_return(mock_reader)
        allow(mock_reader).to receive(:pages).and_return([mock_page])

        # pdftotext returns good text
        allow(parser).to receive(:pdftotext_available?).and_return(true)
        allow(parser).to receive(:extract_with_pdftotext).and_return(
          "Full resume text extracted with pdftotext from the PDF document"
        )

        result = parser.extract
        expect(result).to include("Full resume text")
      end
    end

    context "when pdf-reader raises MalformedPDFError" do
      it "handles the error gracefully and tries fallbacks" do
        parser = described_class.new("/tmp/test.pdf")

        allow(PDF::Reader).to receive(:new).and_raise(PDF::Reader::MalformedPDFError)
        allow(parser).to receive(:pdftotext_available?).and_return(false)
        allow(parser).to receive(:tesseract_available?).and_return(false)

        result = parser.extract
        expect(result).to eq("")
      end
    end
  end
end
