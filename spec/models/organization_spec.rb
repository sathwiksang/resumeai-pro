require "rails_helper"

RSpec.describe Organization, type: :model do
  subject { build(:organization) }

  # === Associations ===
  describe "associations" do
    it { is_expected.to have_many(:users).dependent(:destroy) }
    it { is_expected.to have_many(:resumes).dependent(:destroy) }
    it { is_expected.to have_many(:job_descriptions).dependent(:destroy) }
    it { is_expected.to have_many(:resume_scores).dependent(:destroy) }
    it { is_expected.to have_many(:invitations).dependent(:destroy) }
    it { is_expected.to have_many(:billing_events).dependent(:destroy) }
  end

  # === Validations ===
  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:subdomain) }
    it { is_expected.to validate_uniqueness_of(:subdomain) }
    it { is_expected.to validate_inclusion_of(:plan).in_array(%w[free pro enterprise]) }
    it { is_expected.to validate_numericality_of(:monthly_analysis_limit).is_greater_than_or_equal_to(0) }

    describe "subdomain format" do
      it "allows lowercase letters, numbers, and hyphens" do
        subject.subdomain = "my-org-123"
        expect(subject).to be_valid
      end

      it "rejects uppercase letters" do
        subject.subdomain = "MyOrg"
        expect(subject).not_to be_valid
      end

      it "rejects spaces" do
        subject.subdomain = "my org"
        expect(subject).not_to be_valid
      end

      it "rejects reserved subdomains" do
        %w[www api admin app resume].each do |reserved|
          subject.subdomain = reserved
          expect(subject).not_to be_valid, "expected #{reserved.inspect} to be reserved"
          expect(subject.errors[:subdomain]).to include("is reserved and can't be used")
        end
      end
    end
  end

  # === Business Logic ===
  describe "#can_analyze?" do
    context "with enterprise plan" do
      let(:org) { build(:organization, :enterprise) }

      it "always returns true" do
        org.analyses_used_this_month = 999
        expect(org.can_analyze?).to be true
      end
    end

    context "with free plan" do
      let(:org) { build(:organization, plan: "free", monthly_analysis_limit: 10) }

      it "returns true when under limit" do
        org.analyses_used_this_month = 5
        expect(org.can_analyze?).to be true
      end

      it "returns false when at limit" do
        org.analyses_used_this_month = 10
        expect(org.can_analyze?).to be false
      end

      it "returns false when over limit" do
        org.analyses_used_this_month = 15
        expect(org.can_analyze?).to be false
      end
    end
  end

  describe "#increment_analysis_count!" do
    let(:org) { create(:organization, analyses_used_this_month: 3) }

    it "increments the counter by 1" do
      expect { org.increment_analysis_count! }.to change { org.reload.analyses_used_this_month }.from(3).to(4)
    end
  end

  describe "#reset_monthly_usage!" do
    let(:org) { create(:organization, analyses_used_this_month: 15) }

    it "resets to zero" do
      expect { org.reset_monthly_usage! }.to change { org.reload.analyses_used_this_month }.from(15).to(0)
    end
  end

  describe "#plan_limits" do
    it "returns correct limits for free plan" do
      org = build(:organization, plan: "free")
      expect(org.plan_limits).to eq(analyses: 10, resumes: 5, jds: 3, members: 2)
    end

    it "returns correct limits for pro plan" do
      org = build(:organization, plan: "pro")
      expect(org.plan_limits).to eq(analyses: 200, resumes: 100, jds: 50, members: 5)
    end

    it "returns correct limits for enterprise plan" do
      org = build(:organization, plan: "enterprise")
      limits = org.plan_limits
      expect(limits[:analyses]).to eq(Float::INFINITY)
      expect(limits[:members]).to eq(25)
    end
  end

  describe "#can_add_resume?" do
    it "returns true when under limit" do
      org = build(:organization, plan: "free", resumes_count: 2)
      expect(org.can_add_resume?).to be true
    end

    it "returns false when at limit" do
      org = build(:organization, plan: "free", resumes_count: 5)
      expect(org.can_add_resume?).to be false
    end

    it "returns true for enterprise regardless of count" do
      org = build(:organization, :enterprise, resumes_count: 9999)
      expect(org.can_add_resume?).to be true
    end
  end

  describe "#can_add_job_description?" do
    it "returns true when under limit" do
      org = build(:organization, plan: "free", job_descriptions_count: 1)
      expect(org.can_add_job_description?).to be true
    end

    it "returns false when at limit" do
      org = build(:organization, plan: "free", job_descriptions_count: 3)
      expect(org.can_add_job_description?).to be false
    end
  end

  describe "#can_add_member?" do
    it "returns true when under limit" do
      org = build(:organization, plan: "free", users_count: 1)
      expect(org.can_add_member?).to be true
    end

    it "returns false when at limit" do
      org = build(:organization, plan: "free", users_count: 2)
      expect(org.can_add_member?).to be false
    end
  end

  describe "#usage_summary" do
    it "returns all 4 resource categories" do
      org = build(:organization, plan: "free", resumes_count: 2, job_descriptions_count: 1, users_count: 1, analyses_used_this_month: 3)
      summary = org.usage_summary

      expect(summary[:resumes]).to eq(used: 2, limit: 5)
      expect(summary[:job_descriptions]).to eq(used: 1, limit: 3)
      expect(summary[:members]).to eq(used: 1, limit: 2)
      expect(summary[:analyses]).to eq(used: 3, limit: 10)
    end

    it "serializes unlimited (enterprise) limits as -1, never Infinity" do
      org = build(:organization, plan: "enterprise")
      summary = org.usage_summary
      expect(summary[:analyses][:limit]).to eq(-1)
      expect(summary[:resumes][:limit]).to eq(-1)
      expect(summary.values.map { |v| v[:limit] }).not_to include(Float::INFINITY)
    end
  end

  describe "#effective_analysis_limit" do
    it "returns the numeric limit for metered plans" do
      expect(build(:organization, plan: "free").effective_analysis_limit).to eq(10)
      expect(build(:organization, plan: "pro").effective_analysis_limit).to eq(200)
    end

    it "returns -1 (unlimited) for enterprise, not the raw 0 column" do
      org = build(:organization, plan: "enterprise", monthly_analysis_limit: 0)
      expect(org.effective_analysis_limit).to eq(-1)
    end
  end

  describe "#upgrade_plan!" do
    let(:org) { create(:organization, plan: "free", monthly_analysis_limit: 10) }

    it "upgrades to pro" do
      org.upgrade_plan!("pro")
      expect(org.reload.plan).to eq("pro")
      expect(org.monthly_analysis_limit).to eq(200)
    end

    it "downgrades to free" do
      org.update!(plan: "pro", monthly_analysis_limit: 200)
      org.upgrade_plan!("free")
      expect(org.reload.plan).to eq("free")
      expect(org.monthly_analysis_limit).to eq(10)
    end
  end
end
