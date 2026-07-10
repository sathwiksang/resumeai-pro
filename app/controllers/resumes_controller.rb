class ResumesController < ApplicationController
  before_action :set_resume, only: [:show, :edit, :update, :destroy]

  def index
    resumes = policy_scope(Resume).order(created_at: :desc)
    resumes = resumes.where(status: params[:status]) if params[:status].present?
    if params[:search].present?
      resumes = resumes.where("filename ILIKE ?", "%#{params[:search].strip}%")
    end
    @pagy, @resumes = pagy(resumes)

    render inertia: "Resumes/Index", props: {
      resumes: @resumes.map { |r| serialize_resume(r) },
      pagination: pagy_meta(@pagy),
      filters: {
        status: params[:status],
        search: params[:search],
      },
    }
  end

  def show
    authorize @resume

    render inertia: "Resumes/Show", props: {
      resume: serialize_resume(@resume, detailed: true),
      scores: @resume.resume_scores.includes(:job_description).where(status: :completed).map { |s|
        {
          id: s.id,
          overall_score: s.overall_score.to_f,
          grade: ResumeScore.grade_for(s.overall_score),
          job_title: s.job_description&.title,
          created_at: s.created_at.iso8601,
        }
      },
    }
  end

  def new
    authorize Resume
    render inertia: "Resumes/New"
  end

  def create
    return unless enforce_resume_limit!

    @resume = current_user.resumes.build(resume_params)
    authorize @resume

    if @resume.save
      redirect_to resume_path(@resume), notice: "Resume uploaded successfully."
    else
      redirect_to new_resume_path, alert: @resume.errors.full_messages.join(", ")
    end
  end

  def edit
    authorize @resume
    render inertia: "Resumes/Edit", props: {
      resume: serialize_resume(@resume, detailed: true),
    }
  end

  def update
    authorize @resume

    if @resume.update(resume_params)
      redirect_to resume_path(@resume), notice: "Resume updated successfully."
    else
      redirect_to edit_resume_path(@resume), alert: @resume.errors.full_messages.join(", ")
    end
  end

  def destroy
    authorize @resume
    @resume.destroy
    redirect_to resumes_path, notice: "Resume deleted."
  end

  private

  def set_resume
    @resume = Resume.find(params[:id])
  end

  def resume_params
    if params.key?(:resume)
      params.require(:resume).permit(:document, :filename)
    else
      params.permit(:document, :filename)
    end
  end

  def serialize_resume(resume, detailed: false)
    data = {
      id: resume.id,
      filename: resume.filename,
      content_type: resume.content_type,
      status: resume.status,
      error_message: resume.error_message,
      created_at: resume.created_at.iso8601,
      updated_at: resume.updated_at.iso8601,
    }

    if detailed
      data.merge!(
        raw_text: resume.raw_text,
        parsed_data: resume.parsed_data,
        scores_count: resume.resume_scores.count,
      )
    end

    data
  end
end
