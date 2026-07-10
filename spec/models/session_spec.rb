require "rails_helper"

RSpec.describe Session, type: :model do
  subject { build(:session) }

  # === Associations ===
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  # === Defaults ===
  describe "defaults" do
    it "sets default ip_address when nil" do
      session = build(:session, ip_address: nil)
      session.save!
      expect(session.ip_address).to eq("0.0.0.0")
    end

    it "preserves provided ip_address" do
      session = build(:session, ip_address: "192.168.1.1")
      session.save!
      expect(session.ip_address).to eq("192.168.1.1")
    end
  end
end
