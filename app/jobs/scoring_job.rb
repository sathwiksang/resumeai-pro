class ScoringJob < ApplicationJob
  queue_as :default
  retry_on OllamaService::ConnectionError, wait: 30.seconds, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  PARSE_WAIT_INTERVAL = 5.seconds
  MAX_PARSE_WAIT_ATTEMPTS = 36

  def perform(resume_id, job_description_id, user_id: nil, score_id: nil, parse_wait_attempt: 0)
    resume = Resume.find(resume_id)
    job_description = JobDescription.find(job_description_id)
    score = find_or_build_score(resume, job_description, user_id, score_id)

    unless ready_for_scoring?(resume, job_description)
      wait_for_dependencies!(score, resume, job_description, user_id, parse_wait_attempt)
      return
    end

    score.update!(status: :analyzing, error_message: nil)

    ScoringEngine.analyze(
      resume,
      job_description,
      existing_score: score,
      user_id: user_id
    )
  rescue ActiveRecord::RecordNotUnique
    # Score already exists for this pair — return existing
    Rails.logger.info("[ScoringJob] Score already exists for resume ##{resume_id} + JD ##{job_description_id}")
  rescue ScoringEngine::ScoringError => e
    Rails.logger.error("[ScoringJob] Scoring failed: #{e.message}")
    create_error_score(resume, job_description, user_id, e.message, score_id: score_id)
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("[ScoringJob] Record validation failed: #{e.message}")
    create_error_score(resume, job_description, user_id, e.message, score_id: score_id)
  end

  private

  def ready_for_scoring?(resume, job_description)
    resume.ready? && resume.raw_text.present? && (job_description.ready? || job_description.error?)
  end

  def wait_for_dependencies!(score, resume, job_description, user_id, parse_wait_attempt)
    if resume.error?
      score.update!(
        status: :error,
        error_message: resume.error_message.presence || "Resume processing failed before scoring."
      )
      return
    end

    if parse_wait_attempt >= MAX_PARSE_WAIT_ATTEMPTS
      score.update!(
        status: :error,
        error_message: "Timed out waiting for resume/job description processing."
      )
      return
    end

    next_attempt = parse_wait_attempt + 1
    Rails.logger.info(
      "[ScoringJob] Waiting for dependencies (attempt #{next_attempt}/#{MAX_PARSE_WAIT_ATTEMPTS}) " \
      "for resume ##{resume.id} status=#{resume.status}, jd ##{job_description.id} status=#{job_description.status}"
    )

    self.class.set(wait: PARSE_WAIT_INTERVAL).perform_later(
      resume.id,
      job_description.id,
      user_id: user_id || score.user_id,
      score_id: score.id,
      parse_wait_attempt: next_attempt
    )
  end

  def find_or_build_score(resume, job_description, user_id, score_id)
    score = if score_id.present?
              ResumeScore.find(score_id)
            else
              ResumeScore.find_or_initialize_by(resume: resume, job_description: job_description)
            end

    return score if score.persisted?

    score.assign_attributes(
      organization: resume.organization,
      user_id: user_id || resume.user_id,
      status: :queued
    )
    score.save!
    score
  end

  def create_error_score(resume, job_description, user_id, error_message, score_id: nil)
    score = if score_id.present?
              ResumeScore.find_by(id: score_id)
            else
              ResumeScore.find_or_initialize_by(resume: resume, job_description: job_description)
            end

    return unless score

    score.assign_attributes(
      organization: resume.organization,
      user_id: score.user_id || user_id || resume.user_id,
      status: :error,
      error_message: error_message
    )
    score.save!
  rescue ActiveRecord::RecordNotUnique
    # Already handled
  end
end
