require "rails_helper"

RSpec.describe InvitationPolicy, type: :policy do
  let(:org) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: org) }
  let(:recruiter) { create(:user, :recruiter, organization: org) }
  let(:candidate) { create(:user, organization: org) }
  let(:invitation) { create(:invitation, organization: org, invited_by: admin) }

  before { ActsAsTenant.current_tenant = org }

  describe "#create?" do
    it "allows admin" do
      expect(described_class.new(admin, invitation).create?).to be true
    end

    it "allows recruiter" do
      expect(described_class.new(recruiter, invitation).create?).to be true
    end

    it "denies candidate" do
      expect(described_class.new(candidate, invitation).create?).to be false
    end
  end

  describe "#destroy?" do
    it "allows admin" do
      expect(described_class.new(admin, invitation).destroy?).to be true
    end

    it "denies recruiter" do
      expect(described_class.new(recruiter, invitation).destroy?).to be false
    end

    it "denies candidate" do
      expect(described_class.new(candidate, invitation).destroy?).to be false
    end
  end

  describe "#resend?" do
    it "allows admin" do
      expect(described_class.new(admin, invitation).resend?).to be true
    end

    it "allows recruiter" do
      expect(described_class.new(recruiter, invitation).resend?).to be true
    end

    it "denies candidate" do
      expect(described_class.new(candidate, invitation).resend?).to be false
    end
  end
end
