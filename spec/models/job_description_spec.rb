require "rails_helper"

RSpec.describe JobDescription, type: :model do
  subject { build(:job_description) }

  # === Associations ===
  describe "associations" do
    it { is_expected.to belong_to(:organization) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:resume_scores).dependent(:destroy) }
  end

  # === Validations ===
  describe "validations" do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:description) }
  end

  # === Enums ===
  describe "enums" do
    it do
      is_expected.to define_enum_for(:status)
        .with_values(pending: 0, extracting: 1, ready: 2, error: 3)
    end
  end

  # === Scopes ===
  describe "scopes" do
    let(:org) { create(:organization) }
    let(:user) { create(:user, organization: org) }

    describe ".by_status" do
      before do
        create(:job_description, organization: org, user: user, status: :pending)
        create(:job_description, organization: org, user: user, status: :ready)
      end

      it "filters by status" do
        expect(JobDescription.by_status(:ready).count).to eq(1)
      end
    end

    describe ".recent" do
      it "orders by created_at desc" do
        old = create(:job_description, organization: org, user: user, created_at: 2.days.ago)
        new_jd = create(:job_description, organization: org, user: user, created_at: 1.hour.ago)
        expect(JobDescription.recent.first).to eq(new_jd)
      end
    end
  end
end
