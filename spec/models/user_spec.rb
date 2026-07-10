require "rails_helper"

RSpec.describe User, type: :model do
  subject { build(:user) }

  # === Associations ===
  describe "associations" do
    it { is_expected.to belong_to(:organization) }
    it { is_expected.to have_many(:sessions).dependent(:destroy) }
    it { is_expected.to have_many(:resumes).dependent(:destroy) }
    it { is_expected.to have_many(:job_descriptions).dependent(:destroy) }
    it { is_expected.to have_many(:resume_scores).dependent(:destroy) }
  end

  # === Validations ===
  describe "validations" do
    it { is_expected.to validate_presence_of(:email_address) }
    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }
    it { is_expected.to have_secure_password }

    describe "email uniqueness scoped to organization" do
      let(:org) { create(:organization) }
      let!(:existing_user) { create(:user, organization: org, email_address: "test@example.com") }

      it "rejects duplicate email within same organization" do
        new_user = build(:user, organization: org, email_address: "test@example.com")
        expect(new_user).not_to be_valid
      end

      it "allows same email in different organization" do
        other_org = create(:organization)
        new_user = build(:user, organization: other_org, email_address: "test@example.com")
        expect(new_user).to be_valid
      end
    end

    describe "email format" do
      it "rejects invalid emails" do
        subject.email_address = "not-an-email"
        expect(subject).not_to be_valid
      end

      it "accepts valid emails" do
        subject.email_address = "user@example.com"
        expect(subject).to be_valid
      end
    end

    describe "password length" do
      it "rejects passwords shorter than 8 characters" do
        subject.password = "short"
        expect(subject).not_to be_valid
      end

      it "accepts passwords of 8+ characters" do
        subject.password = "longpassword"
        expect(subject).to be_valid
      end
    end
  end

  # === Enums ===
  describe "roles" do
    it { is_expected.to define_enum_for(:role).with_values(candidate: 0, recruiter: 1, admin: 2) }
  end

  # === Normalizations ===
  describe "email normalization" do
    it "downcases and strips email" do
      user = build(:user, email_address: "  John@EXAMPLE.com  ")
      user.valid?
      expect(user.email_address).to eq("john@example.com")
    end
  end

  # === Methods ===
  describe "#full_name" do
    it "returns first and last name" do
      user = build(:user, first_name: "Jane", last_name: "Doe")
      expect(user.full_name).to eq("Jane Doe")
    end
  end
end
