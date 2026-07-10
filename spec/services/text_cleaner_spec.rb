require "rails_helper"

RSpec.describe TextCleaner do
  describe ".clean" do
    it "returns empty string for nil" do
      expect(TextCleaner.clean(nil)).to eq("")
    end

    it "returns empty string for blank" do
      expect(TextCleaner.clean("")).to eq("")
      expect(TextCleaner.clean("   ")).to eq("")
    end

    it "normalizes Windows line endings" do
      expect(TextCleaner.clean("hello\r\nworld")).to eq("hello\nworld")
    end

    it "normalizes old Mac line endings" do
      expect(TextCleaner.clean("hello\rworld")).to eq("hello\nworld")
    end

    it "collapses excessive blank lines" do
      input = "hello\n\n\n\n\nworld"
      expect(TextCleaner.clean(input)).to eq("hello\n\nworld")
    end

    it "collapses multiple spaces within lines" do
      expect(TextCleaner.clean("hello    world")).to eq("hello world")
    end

    it "preserves single newlines" do
      expect(TextCleaner.clean("line1\nline2")).to eq("line1\nline2")
    end

    it "strips page numbers" do
      input = "Content here\nPage 1 of 5\nMore content"
      cleaned = TextCleaner.clean(input)
      expect(cleaned).not_to include("Page 1 of 5")
      expect(cleaned).to include("Content here")
      expect(cleaned).to include("More content")
    end

    it "strips dash-style page numbers" do
      input = "Content\n- 3 -\nMore"
      cleaned = TextCleaner.clean(input)
      expect(cleaned).not_to include("- 3 -")
    end

    it "normalizes bullet characters to dashes" do
      input = "• Item one\n● Item two\n○ Item three"
      cleaned = TextCleaner.clean(input)
      expect(cleaned).to include("- Item one")
      expect(cleaned).to include("- Item two")
      expect(cleaned).to include("- Item three")
    end

    it "normalizes em-dashes and en-dashes" do
      expect(TextCleaner.clean("2020—2023")).to eq("2020-2023")
      expect(TextCleaner.clean("2020–2023")).to eq("2020-2023")
    end

    it "normalizes smart quotes" do
      expect(TextCleaner.clean("\u201CHello\u201D")).to eq('"Hello"')
      expect(TextCleaner.clean("\u2018it\u2019s\u2019")).to eq("'it's'")
    end

    it "strips null bytes" do
      expect(TextCleaner.clean("hello\x00world")).to eq("helloworld")
    end

    it "handles invalid UTF-8" do
      input = "hello \xFF world"
      result = TextCleaner.clean(input)
      expect(result).to be_a(String)
      expect(result.valid_encoding?).to be true
    end

    it "strips leading and trailing whitespace" do
      expect(TextCleaner.clean("  hello  ")).to eq("hello")
    end
  end
end
