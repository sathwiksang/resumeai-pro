require "rails_helper"

RSpec.describe ResumeScore, type: :model do
  subject { build(:resume_score) }

  # === Associations ===
  describe "associations" do
    it { is_expected.to belong_to(:organization) }
    it { is_expected.to belong_to(:resume) }
    it { is_expected.to belong_to(:job_description) }
    it { is_expected.to belong_to(:user) }
  end

  # === Validations ===
  describe "validations" do
    it { is_expected.to validate_uniqueness_of(:resume_id).scoped_to(:job_description_id) }
  end

  # === Enums ===
  describe "enums" do
    it do
      is_expected.to define_enum_for(:status)
        .with_values(queued: 0, analyzing: 1, completed: 2, error: 3)
    end
  end

  # === Scopes ===
  describe "scopes" do
    let(:org) { create(:organization) }
    let(:user) { create(:user, organization: org) }
    let(:resume) { create(:resume, organization: org, user: user) }
    let(:jd) { create(:job_description, organization: org, user: user) }

    describe ".completed" do
      it "returns only completed scores" do
        completed = create(:resume_score, organization: org, user: user,
                           resume: resume, job_description: jd, status: :completed)
        create(:resume_score, organization: org, user: user,
               resume: create(:resume, organization: org, user: user),
               job_description: jd, status: :queued)
        expect(ResumeScore.completed).to eq([completed])
      end
    end
  end

  # === Class Methods ===
  describe ".grade_for" do
    it "returns A+ for 90-100" do
      expect(ResumeScore.grade_for(95)).to eq("A+")
      expect(ResumeScore.grade_for(90)).to eq("A+")
    end

    it "returns A for 85-89" do
      expect(ResumeScore.grade_for(87)).to eq("A")
    end

    it "returns B+ for 80-84" do
      expect(ResumeScore.grade_for(82)).to eq("B+")
    end

    it "returns B for 75-79" do
      expect(ResumeScore.grade_for(77)).to eq("B")
    end

    it "returns C+ for 70-74" do
      expect(ResumeScore.grade_for(72)).to eq("C+")
    end

    it "returns C for 65-69" do
      expect(ResumeScore.grade_for(67)).to eq("C")
    end

    it "returns D for 55-64" do
      expect(ResumeScore.grade_for(60)).to eq("D")
    end

    it "returns F for below 55" do
      expect(ResumeScore.grade_for(40)).to eq("F")
      expect(ResumeScore.grade_for(0)).to eq("F")
    end
  end
end
