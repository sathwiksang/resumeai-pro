require "rails_helper"

RSpec.describe ResumeScorePolicy, type: :model do
  let(:org) { create(:organization) }
  let(:candidate) { create(:user, organization: org, role: :candidate) }
  let(:recruiter) { create(:user, :recruiter, organization: org) }
  let(:admin) { create(:user, :admin, organization: org) }
  let(:other_candidate) { create(:user, organization: org, role: :candidate) }
  let(:resume) { create(:resume, organization: org, user: candidate) }
  let(:jd) { create(:job_description, organization: org, user: recruiter) }
  let(:score) { create(:resume_score, organization: org, resume: resume, job_description: jd, user: candidate) }

  describe "permissions" do
    context "as the score owner (candidate)" do
      let(:policy) { described_class.new(candidate, score) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "denies destroy" do
        expect(policy.destroy?).to be false
      end
    end

    context "as another candidate" do
      let(:policy) { described_class.new(other_candidate, score) }

      it "denies show" do
        expect(policy.show?).to be false
      end

      it "denies destroy" do
        expect(policy.destroy?).to be false
      end
    end

    context "as a recruiter" do
      let(:policy) { described_class.new(recruiter, score) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "denies destroy" do
        expect(policy.destroy?).to be false
      end
    end

    context "as an admin" do
      let(:policy) { described_class.new(admin, score) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "permits destroy" do
        expect(policy.destroy?).to be true
      end
    end
  end

  describe "#create?" do
    context "when organization can analyze" do
      let(:score_new) { build(:resume_score, organization: org, resume: resume, job_description: jd, user: candidate) }

      it "permits creation" do
        policy = described_class.new(candidate, score_new)
        expect(policy.create?).to be true
      end
    end

    context "when organization is at limit" do
      let(:limited_org) { create(:organization, :at_limit) }
      let(:limited_user) { create(:user, organization: limited_org) }
      let(:limited_resume) { create(:resume, organization: limited_org, user: limited_user) }
      let(:limited_jd) { create(:job_description, organization: limited_org, user: limited_user) }
      let(:score_new) { build(:resume_score, organization: limited_org, resume: limited_resume, job_description: limited_jd, user: limited_user) }

      it "denies creation" do
        policy = described_class.new(limited_user, score_new)
        expect(policy.create?).to be false
      end
    end
  end

  describe "scope" do
    let!(:candidate_score) { create(:resume_score, organization: org, resume: resume, job_description: jd, user: candidate) }
    let!(:other_resume) { create(:resume, organization: org, user: other_candidate) }
    let!(:other_jd) { create(:job_description, organization: org, user: recruiter) }
    let!(:other_score) { create(:resume_score, organization: org, resume: other_resume, job_description: other_jd, user: other_candidate) }

    it "shows only own scores for candidates" do
      scope = described_class::Scope.new(candidate, ResumeScore).resolve
      expect(scope).to include(candidate_score)
      expect(scope).not_to include(other_score)
    end

    it "shows all scores for recruiters" do
      scope = described_class::Scope.new(recruiter, ResumeScore).resolve
      expect(scope).to include(candidate_score, other_score)
    end

    it "shows all scores for admins" do
      scope = described_class::Scope.new(admin, ResumeScore).resolve
      expect(scope).to include(candidate_score, other_score)
    end
  end
end
