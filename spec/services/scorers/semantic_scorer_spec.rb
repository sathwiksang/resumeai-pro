require "rails_helper"

RSpec.describe Scorers::SemanticScorer do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }

  before { ActsAsTenant.current_tenant = organization }
  after { ActsAsTenant.current_tenant = nil }

  let(:embedding_a) { Array.new(768) { |i| Math.sin(i * 0.01) } }
  let(:embedding_b) { Array.new(768) { |i| Math.sin(i * 0.01 + 0.1) } } # Similar to A

  describe "#score" do
    context "with both embeddings present" do
      let(:resume) do
        create(:resume, :parsed, user: user, organization: organization,
          embedding: embedding_a,
          parsed_data: {
            "skills" => { "technical" => ["Ruby", "Rails", "PostgreSQL"] },
            "experience" => [{ "title" => "Software Engineer", "achievements" => ["Built APIs"] }],
            "education" => [{ "degree" => "BS Computer Science", "institution" => "MIT" }]
          })
      end

      let(:job_description) do
        create(:job_description, :ready, user: user, organization: organization,
          embedding: embedding_b,
          required_skills: ["Ruby", "Rails"],
          preferred_skills: ["React"],
          requirements: {
            "responsibilities" => ["Build web applications"],
            "qualifications" => ["3+ years Ruby experience"],
            "education_level" => "Bachelor's"
          })
      end

      it "returns a complete score hash" do
        result = described_class.new(resume, job_description).score

        expect(result).to include(:score, :overall_cosine, :section_scores)
      end

      it "returns score between 0 and 100" do
        result = described_class.new(resume, job_description).score

        expect(result[:score]).to be_between(0, 100)
      end

      it "calculates positive cosine similarity for similar embeddings" do
        result = described_class.new(resume, job_description).score

        expect(result[:overall_cosine]).to be > 0.5
      end

      it "includes section scores when parsed data available" do
        result = described_class.new(resume, job_description).score

        expect(result[:section_scores]).to be_a(Hash)
      end
    end

    context "with missing embeddings" do
      let(:resume) { create(:resume, user: user, organization: organization, embedding: nil) }
      let(:job_description) { create(:job_description, user: user, organization: organization, embedding: embedding_b) }

      it "returns zero score with details" do
        result = described_class.new(resume, job_description).score

        expect(result[:score]).to eq(0.0)
        expect(result[:details]).to eq("Missing embeddings")
      end
    end

    context "with orthogonal embeddings" do
      let(:embedding_orthogonal) { Array.new(768) { |i| Math.cos(i * 0.5 + 2.0) } }

      let(:resume) do
        create(:resume, :parsed, user: user, organization: organization, embedding: embedding_a)
      end

      let(:job_description) do
        create(:job_description, user: user, organization: organization, embedding: embedding_orthogonal)
      end

      it "returns lower similarity score" do
        similar_jd = create(:job_description, user: user, organization: organization, embedding: embedding_b)

        similar_score = described_class.new(resume, similar_jd).score[:score]
        dissimilar_score = described_class.new(resume, job_description).score[:score]

        expect(similar_score).to be > dissimilar_score
      end
    end
  end

  describe "cosine_similarity" do
    let(:mock_resume) { instance_double(Resume, embedding: nil, parsed_data: {}) }
    let(:mock_jd) { instance_double(JobDescription, embedding: nil, requirements: {}, required_skills: [], preferred_skills: []) }
    let(:scorer) { described_class.new(mock_resume, mock_jd) }

    it "returns 1.0 for identical vectors" do
      expect(scorer.send(:cosine_similarity, [1, 0, 0], [1, 0, 0])).to be_within(0.001).of(1.0)
    end

    it "returns 0.0 for orthogonal vectors" do
      expect(scorer.send(:cosine_similarity, [1, 0, 0], [0, 1, 0])).to be_within(0.001).of(0.0)
    end

    it "returns 0.0 for empty vectors" do
      expect(scorer.send(:cosine_similarity, [], [])).to eq(0.0)
    end

    it "returns 0.0 for nil vectors" do
      expect(scorer.send(:cosine_similarity, nil, [1, 0, 0])).to eq(0.0)
    end
  end

  describe "text_overlap_score" do
    let(:mock_resume) { instance_double(Resume, embedding: nil, parsed_data: {}) }
    let(:mock_jd) { instance_double(JobDescription, embedding: nil, requirements: {}, required_skills: [], preferred_skills: []) }
    let(:scorer) { described_class.new(mock_resume, mock_jd) }

    it "returns 100 for identical text" do
      expect(scorer.send(:text_overlap_score, "ruby rails react", "ruby rails react")).to eq(100.0)
    end

    it "returns partial score for partial overlap" do
      score = scorer.send(:text_overlap_score, "ruby rails react python", "ruby rails javascript angular")
      expect(score).to be_between(20, 60)
    end

    it "returns 0 for no overlap" do
      expect(scorer.send(:text_overlap_score, "ruby rails", "java spring")).to eq(0.0)
    end
  end
end
