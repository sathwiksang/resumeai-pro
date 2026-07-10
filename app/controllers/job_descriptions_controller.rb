class JobDescriptionsController < ApplicationController
  before_action :set_job_description, only: [:show, :edit, :update, :destroy]

  def index
    job_descriptions = policy_scope(JobDescription).order(created_at: :desc)
    @pagy, @job_descriptions = pagy(job_descriptions)

    render inertia: "JobDescriptions/Index", props: {
      job_descriptions: @job_descriptions.map { |jd| serialize_jd(jd) },
      pagination: pagy_meta(@pagy),
      filters: {
        status: params[:status],
        search: params[:search],
      },
    }
  end

  def show
    authorize @job_description

    render inertia: "JobDescriptions/Show", props: {
      job_description: serialize_jd(@job_description, detailed: true),
      scores: @job_description.resume_scores.includes(:resume).where(status: :completed).map { |s|
        {
          id: s.id,
          overall_score: s.overall_score.to_f,
          grade: ResumeScore.grade_for(s.overall_score),
          resume_filename: s.resume&.filename,
          created_at: s.created_at.iso8601,
        }
      },
    }
  end

  def new
    authorize JobDescription
    render inertia: "JobDescriptions/New"
  end

  def create
    return unless enforce_job_description_limit!

    @job_description = current_user.job_descriptions.build(job_description_params)
    authorize @job_description

    if @job_description.save
      redirect_to job_description_path(@job_description), notice: "Job description created."
    else
      redirect_to new_job_description_path, alert: @job_description.errors.full_messages.join(", ")
    end
  end

  def edit
    authorize @job_description
    render inertia: "JobDescriptions/Edit", props: {
      job_description: serialize_jd(@job_description, detailed: true),
    }
  end

  def update
    authorize @job_description

    if @job_description.update(job_description_params)
      redirect_to job_description_path(@job_description), notice: "Job description updated."
    else
      redirect_to edit_job_description_path(@job_description), alert: @job_description.errors.full_messages.join(", ")
    end
  end

  def destroy
    authorize @job_description
    @job_description.destroy
    redirect_to job_descriptions_path, notice: "Job description deleted."
  end

  private

  def set_job_description
    @job_description = JobDescription.find(params[:id])
  end

  def job_description_params
    params.require(:job_description).permit(:title, :company, :description, required_skills: [], preferred_skills: [])
  end

  def serialize_jd(jd, detailed: false)
    data = {
      id: jd.id,
      title: jd.title,
      company: jd.company,
      status: jd.status,
      created_at: jd.created_at.iso8601,
      updated_at: jd.updated_at.iso8601,
    }

    if detailed
      data.merge!(
        description: jd.description,
        requirements: jd.requirements,
        required_skills: jd.required_skills,
        preferred_skills: jd.preferred_skills,
        scores_count: jd.resume_scores.count,
      )
    end

    data
  end
end
