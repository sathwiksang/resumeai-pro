require "rails_helper"

RSpec.describe BillingEvent, type: :model do
  subject { build(:billing_event) }

  describe "associations" do
    it { is_expected.to belong_to(:organization) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:stripe_event_id) }
    it { is_expected.to validate_uniqueness_of(:stripe_event_id) }
    it { is_expected.to validate_presence_of(:event_type) }
  end

  describe ".recent scope" do
    it "returns events ordered by created_at desc" do
      org = create(:organization)
      old = create(:billing_event, organization: org, created_at: 2.days.ago)
      recent = create(:billing_event, organization: org, created_at: 1.hour.ago)

      expect(BillingEvent.recent.first).to eq(recent)
    end
  end
end
