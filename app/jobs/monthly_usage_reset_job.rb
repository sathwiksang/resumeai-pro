class MonthlyUsageResetJob < ApplicationJob
  queue_as :default

  def perform
    Organization.where.not(plan: "enterprise").update_all(analyses_used_this_month: 0)
  end
end
