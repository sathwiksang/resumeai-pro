require "rails_helper"

RSpec.describe Parsers::DocxParser do
  describe "#extract" do
    context "with a valid DOCX-like structure" do
      it "extracts paragraph text" do
        parser = described_class.new("/tmp/test.docx")

        mock_doc = instance_double(Docx::Document)
        mock_paragraph1 = instance_double("Paragraph", text: "John Doe")
        mock_paragraph2 = instance_double("Paragraph", text: "Software Engineer")
        mock_paragraph3 = instance_double("Paragraph", text: "")

        allow(Docx::Document).to receive(:open).and_return(mock_doc)
        allow(mock_doc).to receive(:paragraphs).and_return([mock_paragraph1, mock_paragraph2, mock_paragraph3])
        allow(mock_doc).to receive(:tables).and_return([])

        result = parser.extract
        expect(result).to include("John Doe")
        expect(result).to include("Software Engineer")
        expect(result).not_to be_blank
      end
    end

    context "when DOCX parsing fails" do
      it "returns empty string" do
        parser = described_class.new("/tmp/invalid.docx")
        allow(Docx::Document).to receive(:open).and_raise(StandardError, "Invalid file")

        expect(parser.extract).to eq("")
      end
    end
  end
end
