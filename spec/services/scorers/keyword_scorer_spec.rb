require "rails_helper"

RSpec.describe Scorers::KeywordScorer do
  let(:resume_data) do
    {
      "skills" => {
        "technical" => ["Ruby", "Rails", "PostgreSQL", "JavaScript", "React"],
        "soft" => ["Leadership", "Communication"],
        "tools" => ["Docker", "AWS", "Git"],
        "certifications" => ["AWS Solutions Architect"]
      },
      "summary" => "Senior software engineer with 5 years experience in web development",
      "experience" => [
        {
          "title" => "Senior Software Engineer",
          "company" => "TechCorp",
          "achievements" => ["Led team of 5 engineers", "Increased performance by 40%"]
        },
        {
          "title" => "Software Developer",
          "company" => "StartupCo",
          "achievements" => ["Built REST API from scratch", "Implemented CI/CD pipeline"]
        }
      ],
      "education" => [
        { "degree" => "BS Computer Science", "institution" => "Stanford University" }
      ]
    }
  end

  let(:jd_data) do
    {
      "required_skills" => ["Ruby", "Rails", "PostgreSQL"],
      "preferred_skills" => ["React", "Docker", "Kubernetes"],
      "requirements" => {},
      "responsibilities" => [],
      "qualifications" => []
    }
  end

  describe "#score" do
    it "returns a complete score hash" do
      result = described_class.new(resume_data, jd_data).score

      expect(result).to include(:score, :required_match_rate, :matched, :missing, :partial,
                                :keyword_density, :total_keywords, :match_rate)
    end

    it "identifies exact matches" do
      result = described_class.new(resume_data, jd_data).score

      matched_terms = result[:matched].map { |m| m[:term] }
      expect(matched_terms).to include("ruby", "rails", "postgresql")
    end

    it "identifies missing skills" do
      result = described_class.new(resume_data, jd_data).score

      expect(result[:missing]).to include("kubernetes")
    end

    it "calculates required match rate correctly" do
      result = described_class.new(resume_data, jd_data).score

      # All 3 required skills (Ruby, Rails, PostgreSQL) are present
      expect(result[:required_match_rate]).to eq(100.0)
    end

    it "returns score between 0 and 100" do
      result = described_class.new(resume_data, jd_data).score

      expect(result[:score]).to be_between(0, 100)
    end

    it "assigns higher weights to skills field matches" do
      result = described_class.new(resume_data, jd_data).score

      skills_matches = result[:matched].select { |m| m[:field] == :skills }
      experience_matches = result[:matched].select { |m| m[:field] == :experience }

      if skills_matches.any? && experience_matches.any?
        # Skills field should have higher weights
        avg_skills_weight = skills_matches.sum { |m| m[:weight] } / skills_matches.size
        avg_exp_weight = experience_matches.sum { |m| m[:weight] } / experience_matches.size
        expect(avg_skills_weight).to be >= avg_exp_weight
      end
    end

    context "with no matching skills" do
      let(:jd_data) do
        {
          "required_skills" => ["Scala", "Haskell", "Erlang"],
          "preferred_skills" => ["Elixir"]
        }
      end

      it "returns low score with all terms missing" do
        result = described_class.new(resume_data, jd_data).score

        expect(result[:score]).to be < 20
        expect(result[:required_match_rate]).to eq(0.0)
        expect(result[:missing].size).to be >= 3
      end
    end

    context "with empty JD data" do
      it "returns zero score" do
        result = described_class.new(resume_data, {}).score

        expect(result[:score]).to eq(0.0)
        expect(result[:matched]).to be_empty
      end
    end

    context "with empty resume data" do
      it "returns zero matches" do
        result = described_class.new({}, jd_data).score

        expect(result[:matched]).to be_empty
        expect(result[:missing].size).to be > 0
      end
    end

    context "with fuzzy matching" do
      let(:resume_data) do
        {
          "skills" => { "technical" => ["JavaScript", "TypeScript", "PostgreSQL"] }
        }
      end

      let(:jd_data) do
        { "required_skills" => ["Javascript", "Typescript"] }
      end

      it "matches similar terms via Jaro-Winkler" do
        result = described_class.new(resume_data, jd_data).score

        all_found = result[:matched].map { |m| m[:term] } + result[:partial].map { |p| p[:term] }
        expect(all_found).to include("javascript")
      end
    end

    context "with symbol keys in data" do
      let(:resume_data) do
        {
          skills: { technical: ["Ruby", "Python"], soft: ["Leadership"] },
          experience: [{ title: "Developer", company: "Acme", achievements: ["Built APIs"] }],
          education: [{ degree: "BS CS", institution: "MIT" }]
        }
      end

      let(:jd_data) do
        { required_skills: ["Ruby", "Python"] }
      end

      it "handles symbol keys correctly" do
        result = described_class.new(resume_data, jd_data).score

        expect(result[:matched].size).to be >= 2
        expect(result[:required_match_rate]).to eq(100.0)
      end
    end
  end

  describe "Jaro-Winkler implementation" do
    let(:scorer) { described_class.new({}, {}) }

    it "returns 1.0 for identical strings" do
      expect(scorer.send(:jaro_winkler, "ruby", "ruby")).to eq(1.0)
    end

    it "returns 0.0 for empty strings" do
      expect(scorer.send(:jaro_winkler, "", "ruby")).to eq(0.0)
      expect(scorer.send(:jaro_winkler, "ruby", "")).to eq(0.0)
    end

    it "returns high similarity for similar strings" do
      expect(scorer.send(:jaro_winkler, "postgresql", "postgres")).to be > 0.85
    end

    it "returns low similarity for dissimilar strings" do
      expect(scorer.send(:jaro_winkler, "ruby", "java")).to be < 0.7
    end
  end
end
