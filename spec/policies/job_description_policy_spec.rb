require "rails_helper"

RSpec.describe JobDescriptionPolicy, type: :model do
  let(:org) { create(:organization) }
  let(:candidate) { create(:user, organization: org, role: :candidate) }
  let(:recruiter) { create(:user, :recruiter, organization: org) }
  let(:admin) { create(:user, :admin, organization: org) }
  let(:jd) { create(:job_description, organization: org, user: recruiter) }

  describe "permissions" do
    context "as a candidate" do
      let(:policy) { described_class.new(candidate, jd) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "denies create" do
        expect(policy.create?).to be false
      end

      it "denies update" do
        expect(policy.update?).to be false
      end

      it "denies destroy" do
        expect(policy.destroy?).to be false
      end
    end

    context "as the JD owner (recruiter)" do
      let(:policy) { described_class.new(recruiter, jd) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "permits create" do
        expect(policy.create?).to be true
      end

      it "permits update" do
        expect(policy.update?).to be true
      end

      it "permits destroy" do
        expect(policy.destroy?).to be true
      end
    end

    context "as an admin" do
      let(:policy) { described_class.new(admin, jd) }

      it "permits show" do
        expect(policy.show?).to be true
      end

      it "permits create" do
        expect(policy.create?).to be true
      end

      it "permits update" do
        expect(policy.update?).to be true
      end

      it "permits destroy" do
        expect(policy.destroy?).to be true
      end
    end
  end
end
