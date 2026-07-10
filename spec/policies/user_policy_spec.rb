require "rails_helper"

RSpec.describe UserPolicy, type: :model do
  let(:org) { create(:organization) }
  let(:candidate) { create(:user, organization: org, role: :candidate) }
  let(:admin) { create(:user, :admin, organization: org) }
  let(:other_user) { create(:user, organization: org) }

  describe "permissions" do
    context "as the user themselves" do
      let(:policy) { described_class.new(candidate, candidate) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "permits update" do
        expect(policy.update?).to be true
      end

      it "denies create" do
        expect(policy.create?).to be false
      end

      it "denies destroy of self" do
        expect(policy.destroy?).to be false
      end
    end

    context "as another non-admin user" do
      let(:policy) { described_class.new(candidate, other_user) }

      it "denies show" do
        expect(policy.show?).to be false
      end

      it "denies update" do
        expect(policy.update?).to be false
      end

      it "denies destroy" do
        expect(policy.destroy?).to be false
      end
    end

    context "as an admin" do
      let(:policy) { described_class.new(admin, other_user) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "permits create" do
        expect(policy.create?).to be true
      end

      it "permits update" do
        expect(policy.update?).to be true
      end

      it "permits destroy of other users" do
        expect(policy.destroy?).to be true
      end
    end

    context "admin cannot delete themselves" do
      let(:policy) { described_class.new(admin, admin) }

      it "denies destroy" do
        expect(policy.destroy?).to be false
      end
    end

    context "as an admin acting on a user in another organization" do
      let(:other_org) { create(:organization) }
      let(:foreign_user) { create(:user, organization: other_org) }
      let(:policy) { described_class.new(admin, foreign_user) }

      it "denies show, update, and destroy across tenants" do
        expect(policy.show?).to be false
        expect(policy.update?).to be false
        expect(policy.destroy?).to be false
      end
    end
  end

  describe "scope" do
    before do
      # Ensure users exist
      candidate
      admin
    end

    it "shows only self for non-admins" do
      scope = described_class::Scope.new(candidate, User).resolve
      expect(scope.pluck(:id)).to eq([candidate.id])
    end

    it "shows all users in the admin's org for admins" do
      scope = described_class::Scope.new(admin, User).resolve
      expect(scope.count).to be >= 2
    end

    it "excludes users from other organizations for admins" do
      other_org = create(:organization)
      foreign = create(:user, organization: other_org)
      scope = described_class::Scope.new(admin, User).resolve
      expect(scope.pluck(:id)).not_to include(foreign.id)
    end
  end
end
