require "rails_helper"

RSpec.describe Parsers::TextParser do
  let(:fixture_path) { Rails.root.join("spec/fixtures/files/sample_resume.txt") }

  describe "#extract" do
    it "reads the full file content" do
      parser = described_class.new(fixture_path.to_s)
      text = parser.extract

      expect(text).to include("John Doe")
      expect(text).to include("john.doe@email.com")
      expect(text).to include("Senior Software Engineer")
      expect(text).to include("Stanford University")
    end

    it "returns empty string for non-existent file" do
      parser = described_class.new("/tmp/nonexistent_file.txt")
      expect(parser.extract).to eq("")
    end
  end
end
