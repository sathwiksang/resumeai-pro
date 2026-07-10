class DashboardController < ApplicationController
  def index
    resumes = policy_scope(Resume).order(created_at: :desc)
    job_descriptions = policy_scope(JobDescription).order(created_at: :desc)
    scores = policy_scope(ResumeScore).includes(:resume, :job_description).order(created_at: :desc)
    completed_scores = scores.where(status: :completed)

    render inertia: "Dashboard/Index", props: {
      stats: {
        total_resumes: resumes.count,
        total_job_descriptions: job_descriptions.count,
        total_scores: scores.count,
        average_score: completed_scores.average(:overall_score)&.round(1) || 0,
        scores_this_month: scores.where("created_at >= ?", Time.current.beginning_of_month).count,
        resumes_pending: resumes.where(status: [:pending, :parsing, :extracting]).count,
      },
      recent_scores: completed_scores.limit(5).map { |s|
        {
          id: s.id,
          overall_score: s.overall_score.to_f,
          grade: ResumeScore.grade_for(s.overall_score),
          resume_filename: s.resume&.filename,
          job_title: s.job_description&.title,
          created_at: s.created_at.iso8601,
        }
      },
      recent_resumes: resumes.limit(5).map { |r|
        {
          id: r.id,
          filename: r.filename,
          status: r.status,
          created_at: r.created_at.iso8601,
        }
      },
      grade_distribution: grade_distribution(completed_scores),
      usage: if current_organization
               {
                 used: current_organization.analyses_used_this_month,
                 limit: current_organization.effective_analysis_limit,
                 plan: current_organization.plan,
               }
             end,
    }
  end

  private

  def grade_distribution(completed_scores)
    distribution = {}
    ResumeScore::GRADE_THRESHOLDS.each_key { |grade| distribution[grade] = 0 }

    completed_scores.where.not(overall_score: nil).pluck(:overall_score).each do |score|
      grade = ResumeScore.grade_for(score)
      distribution[grade] = (distribution[grade] || 0) + 1
    end

    distribution
  end

  def skip_pundit?
    true
  end
end
