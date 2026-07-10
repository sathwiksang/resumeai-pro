require "rails_helper"

RSpec.describe ExpireInvitationsJob, type: :job do
  describe "#perform" do
    let(:org) { create(:organization) }
    let(:admin) { create(:user, :admin, organization: org) }

    it "expires pending invitations past their expiry date" do
      ActsAsTenant.with_tenant(org) do
        expired = create(:invitation, organization: org, invited_by: admin, expires_at: 1.day.ago, status: :pending)

        described_class.new.perform

        expect(expired.reload.status).to eq("expired")
      end
    end

    it "does not expire pending invitations still within expiry" do
      ActsAsTenant.with_tenant(org) do
        active = create(:invitation, organization: org, invited_by: admin, expires_at: 2.days.from_now, status: :pending)

        described_class.new.perform

        expect(active.reload.status).to eq("pending")
      end
    end

    it "does not change already accepted invitations" do
      ActsAsTenant.with_tenant(org) do
        accepted = create(:invitation, :accepted, organization: org, invited_by: admin, expires_at: 1.day.ago)

        described_class.new.perform

        expect(accepted.reload.status).to eq("accepted")
      end
    end

    it "handles multiple expired invitations" do
      ActsAsTenant.with_tenant(org) do
        inv1 = create(:invitation, organization: org, invited_by: admin, email: "a@test.com", expires_at: 2.days.ago, status: :pending)
        inv2 = create(:invitation, organization: org, invited_by: admin, email: "b@test.com", expires_at: 1.hour.ago, status: :pending)

        described_class.new.perform

        expect(inv1.reload.status).to eq("expired")
        expect(inv2.reload.status).to eq("expired")
      end
    end
  end
end
