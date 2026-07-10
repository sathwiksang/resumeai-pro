require "rails_helper"

RSpec.describe OrganizationPolicy, type: :policy do
  let(:organization) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: organization) }
  let(:candidate) { create(:user, organization: organization) }
  let(:other_org_user) { create(:user, organization: create(:organization)) }

  describe "#show?" do
    it "allows members" do
      expect(described_class.new(candidate, organization).show?).to be true
    end

    it "allows admins" do
      expect(described_class.new(admin, organization).show?).to be true
    end
  end

  describe "#update?" do
    it "allows admins" do
      expect(described_class.new(admin, organization).update?).to be true
    end

    it "denies non-admin members" do
      expect(described_class.new(candidate, organization).update?).to be false
    end
  end

  describe "#destroy?" do
    it "is always false" do
      expect(described_class.new(admin, organization).destroy?).to be false
    end
  end

  describe "Scope" do
    it "limits to user's organization" do
      scope = described_class::Scope.new(candidate, Organization.all).resolve
      expect(scope).to include(organization)
      expect(scope).not_to include(other_org_user.organization)
    end
  end
end
