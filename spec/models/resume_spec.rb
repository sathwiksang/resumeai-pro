require "rails_helper"

RSpec.describe Resume, type: :model do
  subject { build(:resume) }

  # === Associations ===
  describe "associations" do
    it { is_expected.to belong_to(:organization) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:resume_scores).dependent(:destroy) }
    it "has one attached document" do
      expect(Resume.new.document).to be_an_instance_of(ActiveStorage::Attached::One)
    end
  end

  # === Validations ===
  describe "validations" do
    it { is_expected.to validate_presence_of(:filename) }
  end

  # === Enums ===
  describe "enums" do
    it do
      is_expected.to define_enum_for(:status)
        .with_values(pending: 0, parsing: 1, parsed: 2, extracting: 3, ready: 4, error: 5)
    end
  end

  # === Scopes ===
  describe "scopes" do
    let(:org) { create(:organization) }
    let(:user) { create(:user, organization: org) }

    describe ".by_status" do
      before do
        create(:resume, organization: org, user: user, status: :pending)
        create(:resume, organization: org, user: user, status: :parsed)
        create(:resume, organization: org, user: user, status: :error)
      end

      it "filters by status" do
        expect(Resume.by_status(:pending).count).to eq(1)
        expect(Resume.by_status(:parsed).count).to eq(1)
      end
    end

    describe ".recent" do
      it "orders by created_at desc" do
        old = create(:resume, organization: org, user: user, created_at: 2.days.ago)
        new_resume = create(:resume, organization: org, user: user, created_at: 1.hour.ago)
        expect(Resume.recent.first).to eq(new_resume)
      end
    end
  end
end
