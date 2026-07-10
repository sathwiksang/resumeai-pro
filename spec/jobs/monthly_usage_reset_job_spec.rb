require "rails_helper"

RSpec.describe MonthlyUsageResetJob, type: :job do
  describe "#perform" do
    it "resets analyses_used_this_month for free plan orgs" do
      org = create(:organization, plan: "free", analyses_used_this_month: 8)

      described_class.new.perform

      expect(org.reload.analyses_used_this_month).to eq(0)
    end

    it "resets analyses_used_this_month for pro plan orgs" do
      org = create(:organization, :pro, analyses_used_this_month: 150)

      described_class.new.perform

      expect(org.reload.analyses_used_this_month).to eq(0)
    end

    it "does not reset enterprise plan orgs" do
      org = create(:organization, :enterprise, analyses_used_this_month: 500)

      described_class.new.perform

      expect(org.reload.analyses_used_this_month).to eq(500)
    end

    it "resets multiple organizations at once" do
      org1 = create(:organization, plan: "free", analyses_used_this_month: 5)
      org2 = create(:organization, :pro, analyses_used_this_month: 100)

      described_class.new.perform

      expect(org1.reload.analyses_used_this_month).to eq(0)
      expect(org2.reload.analyses_used_this_month).to eq(0)
    end
  end
end
