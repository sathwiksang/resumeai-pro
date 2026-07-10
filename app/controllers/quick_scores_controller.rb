class QuickScoresController < ApplicationController
  def new
    render inertia: "QuickScore/New", props: {
      job_descriptions: policy_scope(JobDescription)
        .where(status: :ready)
        .order(created_at: :desc)
        .map { |jd| { id: jd.id, title: jd.title, company: jd.company } },
      resumes: current_user.resumes
        .where(status: :ready)
        .order(created_at: :desc)
        .map { |r| { id: r.id, filename: r.filename } },
      preselected_resume_id: params[:resume_id]&.to_i,
    }
  end

  def create
    return unless enforce_analysis_limit!

    resume = if params[:resume_id].present?
               current_user.resumes.find(params[:resume_id])
             else
               current_user.resumes.build(
                 document: params[:document],
                 filename: params[:document]&.original_filename || "untitled",
               )
             end

    job_description = if params[:job_description_id].present?
                        JobDescription.find(params[:job_description_id])
                      else
                        current_user.job_descriptions.create!(
                          title: params[:job_title] || "Quick Score JD",
                          description: params[:job_description_text],
                        )
                      end

    score = nil
    ActiveRecord::Base.transaction do
      resume.save! if resume.new_record?
      score = ResumeScore.create!(
        resume: resume,
        job_description: job_description,
        user: current_user,
        status: :queued,
      )
      current_organization.increment_analysis_count!
    end

    # Enqueue AFTER commit so the score record is visible to the job's thread
    ScoringJob.perform_later(
      resume.id,
      job_description.id,
      user_id: current_user.id,
      score_id: score.id
    )
    redirect_to resume_score_path(score), notice: "Quick score analysis queued!"
  rescue ActiveRecord::RecordInvalid => e
    redirect_to new_quick_score_path, alert: e.record.errors.full_messages.join(", ")
  end

  private

  def skip_pundit?
    true
  end
end
