class ResumeScoresController < ApplicationController
  def index
    scores = policy_scope(ResumeScore)
      .includes(:resume, :job_description)
      .order(created_at: :desc)

    # Apply filters
    scores = scores.where(status: params[:status]) if params[:status].present?
    if params[:grade].present?
      grade_range = ResumeScore::GRADE_THRESHOLDS[params[:grade]]
      scores = scores.where(overall_score: grade_range) if grade_range
    end

    @pagy, @scores = pagy(scores)

    render inertia: "Scores/Index", props: {
      scores: @scores.map { |s| serialize_score(s) },
      pagination: pagy_meta(@pagy),
      filters: {
        status: params[:status],
        grade: params[:grade],
      },
    }
  end

  def show
    score = ResumeScore.find(params[:id])
    authorize score

    render inertia: "Scores/Show", props: {
      score: serialize_score(score, detailed: true),
    }
  end

  def create
    return unless enforce_analysis_limit!

    resume = Resume.find(params[:resume_id])
    job_description = JobDescription.find(params[:job_description_id])
    score = ResumeScore.new(
      resume: resume,
      job_description: job_description,
      user: current_user,
      status: :queued,
    )
    authorize score

    if score.save
      current_organization.increment_analysis_count!
      ScoringJob.perform_later(
        resume.id,
        job_description.id,
        user_id: current_user.id,
        score_id: score.id
      )
      redirect_to resume_score_path(score), notice: "Scoring analysis queued."
    else
      redirect_back fallback_location: resumes_path, alert: score.errors.full_messages.join(", ")
    end
  end

  def destroy
    score = ResumeScore.find(params[:id])
    authorize score
    score.destroy
    redirect_to resume_scores_path, notice: "Score deleted."
  end

  private

  def normalize_keyword_analysis(analysis)
    return analysis unless analysis.is_a?(Hash)

    %w[matched partial].each do |key|
      next unless analysis[key].is_a?(Array)

      analysis[key] = analysis[key].map do |kw|
        next kw unless kw.is_a?(Hash)
        kw.merge("location" => kw.delete("field") || kw["location"])
      end
    end

    analysis
  end

  def serialize_score(score, detailed: false)
    data = {
      id: score.id,
      overall_score: score.overall_score&.to_f,
      grade: score.overall_score ? ResumeScore.grade_for(score.overall_score) : nil,
      status: score.status,
      resume_filename: score.resume&.filename,
      job_title: score.job_description&.title,
      created_at: score.created_at.iso8601,
    }

    if detailed
      data.merge!(
        resume_id: score.resume_id,
        job_description_id: score.job_description_id,
        keyword_score: score.keyword_score&.to_f,
        semantic_score: score.semantic_score&.to_f,
        skills_score: score.skills_score&.to_f,
        experience_score: score.experience_score&.to_f,
        education_score: score.education_score&.to_f,
        format_score: score.format_score&.to_f,
        keyword_analysis: normalize_keyword_analysis(score.keyword_analysis),
        skills_analysis: score.skills_analysis,
        experience_analysis: score.experience_analysis,
        recommendations: score.recommendations,
        strengths: score.strengths,
        weaknesses: score.weaknesses,
        llm_model: score.llm_model,
        llm_tokens_used: score.llm_tokens_used,
        processing_time_seconds: score.processing_time_seconds&.to_f,
        error_message: score.error_message,
        resume: score.resume ? {
          id: score.resume.id,
          filename: score.resume.filename,
        } : nil,
        job_description: score.job_description ? {
          id: score.job_description.id,
          title: score.job_description.title,
          company: score.job_description.company,
        } : nil,
      )
    end

    data
  end
end
