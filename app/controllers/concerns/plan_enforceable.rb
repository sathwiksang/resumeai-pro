module PlanEnforceable
  extend ActiveSupport::Concern

  private

  def enforce_resume_limit!
    return true if current_organization.can_add_resume?

    redirect_back fallback_location: resumes_path,
      alert: "You've reached the resume limit for your #{current_organization.plan} plan. Please upgrade to add more resumes."
    false
  end

  def enforce_job_description_limit!
    return true if current_organization.can_add_job_description?

    redirect_back fallback_location: job_descriptions_path,
      alert: "You've reached the job description limit for your #{current_organization.plan} plan. Please upgrade to add more job descriptions."
    false
  end

  def enforce_member_limit!
    return true if current_organization.can_add_member?

    redirect_back fallback_location: admin_users_path,
      alert: "You've reached the team member limit for your #{current_organization.plan} plan. Please upgrade to add more members."
    false
  end

  def enforce_analysis_limit!
    return true if current_organization.can_analyze?

    redirect_back fallback_location: resume_scores_path,
      alert: "You've reached the analysis limit for your #{current_organization.plan} plan. Please upgrade to run more analyses."
    false
  end
end
