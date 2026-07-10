require "rails_helper"

RSpec.describe SkillTaxonomy, type: :model do
  subject { build(:skill_taxonomy) }

  # === Validations ===
  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
    it { is_expected.to validate_inclusion_of(:category).in_array(%w[technical soft tool certification]).allow_nil }
  end

  # === Scopes ===
  describe "scopes" do
    before do
      create(:skill_taxonomy, name: "Ruby", category: "technical")
      create(:skill_taxonomy, name: "Leadership", category: "soft")
      create(:skill_taxonomy, name: "Docker", category: "tool")
      create(:skill_taxonomy, name: "AWS Solutions Architect", category: "certification")
    end

    it ".technical returns only technical skills" do
      expect(SkillTaxonomy.technical.count).to eq(1)
      expect(SkillTaxonomy.technical.first.name).to eq("Ruby")
    end

    it ".soft returns only soft skills" do
      expect(SkillTaxonomy.soft.count).to eq(1)
    end

    it ".tools returns only tool skills" do
      expect(SkillTaxonomy.tools.count).to eq(1)
    end

    it ".certifications returns only certifications" do
      expect(SkillTaxonomy.certifications.count).to eq(1)
    end

    it ".by_category filters by given category" do
      expect(SkillTaxonomy.by_category("technical").count).to eq(1)
    end
  end

  # === Methods ===
  describe "#alias_list" do
    it "returns aliases array" do
      skill = build(:skill_taxonomy, :with_aliases)
      expect(skill.alias_list).to eq(["alias1", "alias2"])
    end

    it "returns empty array when nil" do
      skill = build(:skill_taxonomy, aliases: nil)
      expect(skill.alias_list).to eq([])
    end
  end
end
