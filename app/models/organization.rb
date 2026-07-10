class Organization < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :resumes, dependent: :destroy
  has_many :job_descriptions, dependent: :destroy
  has_many :resume_scores, dependent: :destroy
  has_many :invitations, dependent: :destroy
  has_many :billing_events, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true,
            format: { with: /\A[a-z0-9\-]+\z/, message: "only allows lowercase letters, numbers, and hyphens" }
  validates :plan, inclusion: { in: %w[free pro enterprise] }
  validates :monthly_analysis_limit, numericality: { greater_than_or_equal_to: 0 }

  def can_analyze?
    return true if plan == "enterprise"
    analyses_used_this_month < monthly_analysis_limit
  end

  # Effective monthly analysis allowance for display. -1 means unlimited
  # (Enterprise), matching the plan_limits serialization the UI already uses;
  # avoids showing "used / 0" for Enterprise, whose raw column is 0.
  def effective_analysis_limit
    limit = plan_limits[:analyses]
    limit == Float::INFINITY ? -1 : limit
  end

  def increment_analysis_count!
    increment!(:analyses_used_this_month)
  end

  def reset_monthly_usage!
    update!(analyses_used_this_month: 0)
  end

  def plan_limits
    case plan
    when "free"       then { analyses: 10, resumes: 5, jds: 3, members: 2 }
    when "pro"        then { analyses: 200, resumes: 100, jds: 50, members: 5 }
    when "enterprise" then { analyses: Float::INFINITY, resumes: Float::INFINITY, jds: Float::INFINITY, members: 25 }
    end
  end

  def can_add_resume?
    limit = plan_limits[:resumes]
    return true if limit == Float::INFINITY
    resumes_count < limit
  end

  def can_add_job_description?
    limit = plan_limits[:jds]
    return true if limit == Float::INFINITY
    job_descriptions_count < limit
  end

  def can_add_member?
    limit = plan_limits[:members]
    return true if limit == Float::INFINITY
    users_count < limit
  end

  def usage_summary
    limits = plan_limits
    # -1 = unlimited; Float::INFINITY is not valid JSON.
    lim = ->(v) { v == Float::INFINITY ? -1 : v }
    {
      resumes: { used: resumes_count, limit: lim.call(limits[:resumes]) },
      job_descriptions: { used: job_descriptions_count, limit: lim.call(limits[:jds]) },
      members: { used: users_count, limit: lim.call(limits[:members]) },
      analyses: { used: analyses_used_this_month, limit: lim.call(limits[:analyses]) }
    }
  end

  def upgrade_plan!(new_plan)
    new_limits = case new_plan
    when "free"       then { monthly_analysis_limit: 10 }
    when "pro"        then { monthly_analysis_limit: 200 }
    when "enterprise" then { monthly_analysis_limit: 0 }
    end

    update!(plan: new_plan, **new_limits)
  end

  def stripe_enabled?
    ENV["STRIPE_SECRET_KEY"].present? || Rails.application.credentials.dig(:stripe, :secret_key).present?
  end
end
