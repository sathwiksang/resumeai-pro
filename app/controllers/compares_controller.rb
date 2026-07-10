class ComparesController < ApplicationController
  def show
    scores = policy_scope(ResumeScore)
      .where(status: :completed)
      .includes(:resume, :job_description)
      .order(created_at: :desc)

    # If score IDs are provided, load them for comparison
    selected = if params[:scores].present?
                 ids = params[:scores].split(",").map(&:to_i)
                 scores.where(id: ids).limit(2)
               else
                 []
               end

    render inertia: "Compare/Show", props: {
      available_scores: scores.limit(20).map { |s| serialize_score_option(s) },
      left: selected.first ? serialize_comparison(selected.first) : nil,
      right: selected.second ? serialize_comparison(selected.second) : nil,
    }
  end

  private

  def skip_pundit?
    true
  end

  def serialize_score_option(score)
    {
      id: score.id,
      resume_filename: score.resume&.filename,
      job_title: score.job_description&.title,
      overall_score: score.overall_score&.to_f,
      grade: score.grade,
      created_at: score.created_at.iso8601,
    }
  end

  def serialize_comparison(score)
    {
      id: score.id,
      resume_filename: score.resume&.filename,
      job_title: score.job_description&.title,
      company: score.job_description&.company,
      overall_score: score.overall_score&.to_f,
      grade: score.grade,
      keyword_score: score.keyword_score&.to_f,
      semantic_score: score.semantic_score&.to_f,
      skills_score: score.skills_score&.to_f,
      experience_score: score.experience_score&.to_f,
      education_score: score.education_score&.to_f,
      format_score: score.format_score&.to_f,
      strengths: (score.strengths || []).map { |s| s.is_a?(Hash) ? s["text"] : s },
      weaknesses: (score.weaknesses || []).map { |w| w.is_a?(Hash) ? w["text"] : w },
      created_at: score.created_at.iso8601,
    }
  end
end
