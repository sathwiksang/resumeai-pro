require "rails_helper"

RSpec.describe Invitation, type: :model do
  subject { build(:invitation) }

  describe "associations" do
    it { is_expected.to belong_to(:organization) }
    it { is_expected.to belong_to(:invited_by).class_name("User") }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_presence_of(:role) }

    it "validates email format" do
      invitation = build(:invitation, email: "not-an-email")
      expect(invitation).not_to be_valid
    end

    it "validates token uniqueness" do
      org = create(:organization)
      admin = create(:user, :admin, organization: org)
      ActsAsTenant.with_tenant(org) do
        existing = create(:invitation, organization: org, invited_by: admin, token: "unique-token-123")
        duplicate = build(:invitation, organization: org, invited_by: admin, token: "unique-token-123")
        expect(duplicate).not_to be_valid
      end
    end
  end

  describe "callbacks" do
    it "generates a token before validation on create" do
      invitation = build(:invitation, token: nil)
      invitation.valid?
      expect(invitation.token).to be_present
    end

    it "sets expiry before validation on create" do
      invitation = build(:invitation, expires_at: nil)
      invitation.valid?
      expect(invitation.expires_at).to be_within(1.minute).of(7.days.from_now)
    end
  end

  describe "#past_expiry?" do
    it "returns true when expires_at is in the past" do
      invitation = build(:invitation, expires_at: 1.day.ago)
      expect(invitation.past_expiry?).to be true
    end

    it "returns false when expires_at is in the future" do
      invitation = build(:invitation, expires_at: 1.day.from_now)
      expect(invitation.past_expiry?).to be false
    end
  end

  describe "#accept!" do
    let(:org) { create(:organization) }
    let(:admin) { create(:user, :admin, organization: org) }
    let(:invitation) { create(:invitation, organization: org, invited_by: admin) }
    let(:user) { create(:user, organization: org) }

    it "marks the invitation as accepted" do
      ActsAsTenant.with_tenant(org) do
        invitation.accept!(user)
        expect(invitation.reload.status).to eq("accepted")
        expect(invitation.accepted_at).to be_present
      end
    end

    it "links the user to the invitation" do
      ActsAsTenant.with_tenant(org) do
        invitation.accept!(user)
        expect(user.reload.invitation).to eq(invitation)
      end
    end
  end

  describe "#decline!" do
    let(:org) { create(:organization) }
    let(:admin) { create(:user, :admin, organization: org) }
    let(:invitation) { create(:invitation, organization: org, invited_by: admin) }

    it "marks the invitation as declined" do
      ActsAsTenant.with_tenant(org) do
        invitation.decline!
        expect(invitation.reload.status).to eq("declined")
      end
    end
  end

  describe ".active scope" do
    let(:org) { create(:organization) }
    let(:admin) { create(:user, :admin, organization: org) }

    it "returns only pending and non-expired invitations" do
      ActsAsTenant.with_tenant(org) do
        active = create(:invitation, organization: org, invited_by: admin, status: :pending, expires_at: 2.days.from_now)
        create(:invitation, organization: org, invited_by: admin, email: "expired@test.com", status: :pending, expires_at: 1.day.ago)
        create(:invitation, organization: org, invited_by: admin, email: "accepted@test.com", status: :accepted)

        expect(Invitation.active).to contain_exactly(active)
      end
    end
  end

  describe "email normalization" do
    it "downcases and strips whitespace from email" do
      invitation = build(:invitation, email: "  John@Example.COM  ")
      invitation.valid?
      expect(invitation.email).to eq("john@example.com")
    end
  end
end
