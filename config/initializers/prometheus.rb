# Custom application metrics for monitoring
# Provides a lightweight metrics collection without requiring prometheus_exporter gem
# Access via /admin/metrics (authenticated, admin only)

module AppMetrics
  class << self
    def collect
      {
        organizations: {
          total: Organization.count,
          by_plan: Organization.group(:plan).count,
        },
        users: {
          total: User.count,
          by_role: User.group(:role).count,
        },
        resumes: {
          total: Resume.unscoped.count,
          by_status: Resume.unscoped.group(:status).count,
        },
        job_descriptions: {
          total: JobDescription.unscoped.count,
          by_status: JobDescription.unscoped.group(:status).count,
        },
        scores: {
          total: ResumeScore.unscoped.count,
          by_status: ResumeScore.unscoped.group(:status).count,
          avg_score: ResumeScore.unscoped.where(status: :completed).average(:overall_score)&.to_f&.round(1),
        },
        invitations: {
          pending: Invitation.unscoped.where(status: :pending).count,
          accepted: Invitation.unscoped.where(status: :accepted).count,
        },
        system: {
          ruby_version: RUBY_VERSION,
          rails_version: Rails.version,
          environment: Rails.env,
        },
      }
    end
  end
end
