require "rails_helper"

RSpec.describe RecommendationEngine do
  describe ".generate" do
    let(:keyword_result) do
      {
        score: 45.0,
        required_match_rate: 66.7,
        matched: [
          { term: "ruby", field: :skills, weight: 1.8 },
          { term: "rails", field: :skills, weight: 1.8 }
        ],
        missing: ["kubernetes", "terraform", "docker", "aws"],
        partial: [],
        match_rate: 33.3,
        total_keywords: 6
      }
    end

    let(:semantic_result) do
      { score: 60.0, overall_cosine: 0.6, section_scores: {} }
    end

    let(:llm_result) do
      {
        "skills_match" => {
          "score" => 55,
          "matched_skills" => ["Ruby", "Rails"],
          "missing_critical" => ["Kubernetes", "Terraform"],
          "transferable" => ["Docker Compose"]
        },
        "experience_relevance" => {
          "score" => 40,
          "role_alignment" => "weak",
          "years_relevant" => 2,
          "years_required" => 5
        },
        "education_fit" => { "score" => 80, "evidence" => "Meets requirements" },
        "format_quality" => { "score" => 60, "issues" => ["Too many pages", "Inconsistent bullet styles"] },
        "content_quality" => {
          "score" => 50,
          "has_quantified_achievements" => false,
          "action_verb_usage" => "weak",
          "issues" => ["Lacks metrics", "Repetitive descriptions"]
        },
        "overall_score" => 50.0
      }
    end

    it "generates recommendations sorted by priority" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      expect(recs).to be_an(Array)
      expect(recs.first[:priority]).to eq("critical")
    end

    it "includes missing critical skills recommendation" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      skill_rec = recs.find { |r| r[:category] == "missing_skill" && r[:priority] == "critical" }
      expect(skill_rec).to be_present
      expect(skill_rec[:description]).to include("Kubernetes")
    end

    it "includes keyword coverage recommendation" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      keyword_rec = recs.find { |r| r[:category] == "keyword" }
      expect(keyword_rec).to be_present
    end

    it "includes experience gap recommendation" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      exp_rec = recs.find { |r| r[:category] == "weak_experience" }
      expect(exp_rec).to be_present
    end

    it "includes quantified achievements recommendation" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      content_rec = recs.find { |r| r[:category] == "achievement" && r[:title].include?("quantified") }
      expect(content_rec).to be_present
    end

    it "includes formatting recommendation when score is low" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      format_rec = recs.find { |r| r[:category] == "formatting" }
      expect(format_rec).to be_present
    end

    it "caps recommendations at 10" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      expect(recs.size).to be <= 10
    end

    it "each recommendation has required fields" do
      recs = described_class.generate(keyword_result, semantic_result, llm_result)

      recs.each do |rec|
        expect(rec).to include(:priority, :category, :title, :description, :action_items, :estimated_effort, :impact_score)
        expect(rec[:action_items]).to be_an(Array)
        expect(rec[:impact_score]).to be_between(1, 10)
      end
    end

    context "with a strong candidate (few issues)" do
      let(:keyword_result) do
        { score: 90.0, required_match_rate: 100.0, matched: [], missing: [], partial: [], match_rate: 95.0, total_keywords: 5 }
      end

      let(:llm_result) do
        {
          "skills_match" => { "score" => 90, "matched_skills" => ["Ruby", "Rails"], "missing_critical" => [], "transferable" => [] },
          "experience_relevance" => { "score" => 85, "role_alignment" => "strong" },
          "education_fit" => { "score" => 90 },
          "format_quality" => { "score" => 85, "issues" => [] },
          "content_quality" => { "score" => 80, "has_quantified_achievements" => true, "action_verb_usage" => "strong", "issues" => [] },
          "overall_score" => 87.0
        }
      end

      it "generates fewer recommendations" do
        recs = described_class.generate(keyword_result, semantic_result, llm_result)

        expect(recs.size).to be < 3
      end
    end
  end
end
