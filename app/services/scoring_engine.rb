class ScoringEngine
  # Composite weights: keyword (precision) + semantic (context) + LLM (judgment)
  KEYWORD_WEIGHT  = 0.30
  SEMANTIC_WEIGHT = 0.20
  LLM_WEIGHT      = 0.50

  class ScoringError < StandardError; end

  def self.analyze(resume, job_description, existing_score: nil, user_id: nil)
    new(resume, job_description, existing_score: existing_score, user_id: user_id).analyze
  end

  def initialize(resume, job_description, existing_score: nil, user_id: nil)
    @resume = resume
    @job_description = job_description
    @existing_score = existing_score
    @user_id = user_id
  end

  def analyze
    score = target_score
    if score.completed? && score.content_pair_digest == content_pair_digest
      return score
    end

    # Check for cached result first
    cached = find_cached_score(excluding_id: score.id)
    return score_from_cached(score, cached) if cached

    started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)

    # Run scorers (sequential for reliability, parallel for production later)
    keyword_result = run_keyword_scorer
    semantic_result = run_semantic_scorer
    llm_result = run_llm_scorer

    processing_time = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at).round(2)

    # Composite score
    overall = calculate_composite(keyword_result, semantic_result, llm_result)

    # Generate recommendations
    recommendations = RecommendationEngine.generate(keyword_result, semantic_result, llm_result)
    strengths = extract_strengths(keyword_result, llm_result)
    weaknesses = extract_weaknesses(keyword_result, llm_result)

    build_resume_score(
      score: score,
      overall: overall,
      keyword: keyword_result,
      semantic: semantic_result,
      llm: llm_result,
      recommendations: recommendations,
      strengths: strengths,
      weaknesses: weaknesses,
      processing_time: processing_time
    )
  end

  private

  def find_cached_score(excluding_id: nil)
    digest = content_pair_digest
    scope = ResumeScore.where(content_pair_digest: digest, status: :completed)
    scope = scope.where.not(id: excluding_id) if excluding_id.present?
    scope.first
  end

  def content_pair_digest
    resume_digest = @resume.content_digest || Digest::SHA256.hexdigest(@resume.raw_text.to_s)
    jd_digest = Digest::SHA256.hexdigest(@job_description.description.to_s)
    # Include record IDs so digest remains unique per resume/JD pair.
    Digest::SHA256.hexdigest("#{resume_digest}:#{jd_digest}:#{@resume.id}:#{@job_description.id}")
  end

  def target_score
    @existing_score || ResumeScore.find_or_initialize_by(resume: @resume, job_description: @job_description)
  end

  def score_from_cached(score, cached)
    score.assign_attributes(
      overall_score: cached.overall_score,
      grade: cached.grade,
      keyword_score: cached.keyword_score,
      semantic_score: cached.semantic_score,
      skills_score: cached.skills_score,
      experience_score: cached.experience_score,
      education_score: cached.education_score,
      format_score: cached.format_score,
      keyword_analysis: cached.keyword_analysis,
      skills_analysis: cached.skills_analysis,
      experience_analysis: cached.experience_analysis,
      recommendations: cached.recommendations,
      strengths: cached.strengths,
      weaknesses: cached.weaknesses,
      llm_model: cached.llm_model,
      llm_tokens_used: cached.llm_tokens_used,
      processing_time_seconds: cached.processing_time_seconds,
      content_pair_digest: content_pair_digest,
      status: :completed,
      error_message: nil
    )
    score.organization ||= @resume.organization
    score.user_id ||= @user_id || @resume.user_id
    score.save! if score.new_record? || score.changed?
    score
  end

  def run_keyword_scorer
    resume_data = @resume.parsed_data || {}
    jd_data = build_jd_data
    Scorers::KeywordScorer.new(resume_data, jd_data).score
  rescue => e
    Rails.logger.error("[ScoringEngine] Keyword scorer failed: #{e.message}")
    { score: 0.0, required_match_rate: 0.0, matched: [], missing: [], partial: [] }
  end

  def run_semantic_scorer
    Scorers::SemanticScorer.new(@resume, @job_description).score
  rescue => e
    Rails.logger.error("[ScoringEngine] Semantic scorer failed: #{e.message}")
    { score: 0.0, overall_cosine: 0.0, section_scores: {} }
  end

  def run_llm_scorer
    Scorers::LlmScorer.new(@resume, @job_description).score
  rescue OllamaService::ConnectionError, OllamaService::ModelError => e
    Rails.logger.warn("[ScoringEngine] LLM scorer unavailable: #{e.message}")
    fallback_llm_result
  rescue => e
    Rails.logger.error("[ScoringEngine] LLM scorer failed: #{e.message}")
    fallback_llm_result
  end

  def calculate_composite(keyword, semantic, llm)
    keyword_score = keyword[:score] || 0
    semantic_score = semantic[:score] || 0
    llm_score = llm["overall_score"] || 0

    composite = keyword_score * KEYWORD_WEIGHT +
                semantic_score * SEMANTIC_WEIGHT +
                llm_score * LLM_WEIGHT

    composite.round(1)
  end

  def build_jd_data
    {
      "required_skills" => @job_description.required_skills || [],
      "preferred_skills" => @job_description.preferred_skills || [],
      "requirements" => @job_description.requirements || {},
      "responsibilities" => (@job_description.requirements || {})["responsibilities"] || [],
      "qualifications" => (@job_description.requirements || {})["qualifications"] || []
    }
  end

  def build_resume_score(score:, overall:, keyword:, semantic:, llm:, recommendations:, strengths:, weaknesses:, processing_time:)
    score.assign_attributes(
      organization: @resume.organization,
      resume: @resume,
      job_description: @job_description,
      user_id: @user_id || @resume.user_id,
      overall_score: overall,
      grade: ResumeScore.grade_for(overall),
      keyword_score: keyword[:score],
      semantic_score: semantic[:score],
      skills_score: llm.dig("skills_match", "score"),
      experience_score: llm.dig("experience_relevance", "score"),
      education_score: llm.dig("education_fit", "score"),
      format_score: llm.dig("format_quality", "score"),
      keyword_analysis: keyword,
      skills_analysis: llm["skills_match"] || {},
      experience_analysis: llm["experience_relevance"] || {},
      recommendations: recommendations,
      strengths: strengths,
      weaknesses: weaknesses,
      llm_model: llm["model"] || OllamaService::CHAT_MODEL,
      llm_tokens_used: (llm["eval_count"] || 0) + (llm["prompt_eval_count"] || 0),
      processing_time_seconds: processing_time,
      content_pair_digest: content_pair_digest,
      status: :completed,
      error_message: nil
    )
    score.save!
    score
  end

  def extract_strengths(keyword, llm)
    strengths = []

    # From keyword analysis
    if keyword[:required_match_rate] && keyword[:required_match_rate] >= 80
      strengths << { category: "keywords", text: "Strong match on required skills (#{keyword[:required_match_rate]}%)" }
    end

    # From LLM analysis
    if (skills = llm.dig("skills_match", "matched_skills"))&.any?
      strengths << { category: "skills", text: "Matched skills: #{skills.first(5).join(", ")}" }
    end

    if llm.dig("experience_relevance", "role_alignment") == "strong"
      strengths << { category: "experience", text: "Strong role alignment with job requirements" }
    end

    if llm.dig("content_quality", "has_quantified_achievements")
      strengths << { category: "content", text: "Resume includes quantified achievements" }
    end

    if llm.dig("content_quality", "action_verb_usage") == "strong"
      strengths << { category: "content", text: "Strong action verb usage throughout" }
    end

    if (edu_score = llm.dig("education_fit", "score")) && edu_score >= 80
      strengths << { category: "education", text: "Education well-aligned with requirements" }
    end

    strengths
  end

  def extract_weaknesses(keyword, llm)
    weaknesses = []

    # Missing critical skills
    if (missing = llm.dig("skills_match", "missing_critical"))&.any?
      weaknesses << { category: "skills", text: "Missing critical skills: #{missing.first(5).join(", ")}", priority: "high" }
    end

    # Missing keywords
    if keyword[:missing]&.any?
      weaknesses << { category: "keywords", text: "Missing keywords: #{keyword[:missing].first(5).join(", ")}", priority: "medium" }
    end

    # Weak experience alignment
    if llm.dig("experience_relevance", "role_alignment") == "weak"
      weaknesses << { category: "experience", text: "Weak role alignment — experience doesn't closely match requirements", priority: "high" }
    end

    # Format issues
    if (issues = llm.dig("format_quality", "issues"))&.any?
      weaknesses << { category: "format", text: "Format issues: #{issues.first(3).join("; ")}", priority: "low" }
    end

    # Content quality issues
    if (issues = llm.dig("content_quality", "issues"))&.any?
      weaknesses << { category: "content", text: "Content issues: #{issues.first(3).join("; ")}", priority: "medium" }
    end

    weaknesses
  end

  def fallback_llm_result
    {
      "skills_match" => { "score" => 0, "matched_skills" => [], "missing_critical" => [] },
      "experience_relevance" => { "score" => 0, "role_alignment" => "weak" },
      "education_fit" => { "score" => 0 },
      "format_quality" => { "score" => 0, "issues" => [] },
      "content_quality" => { "score" => 0, "has_quantified_achievements" => false, "action_verb_usage" => "weak", "issues" => [] },
      "overall_score" => 0,
      "overall_assessment" => "LLM evaluation unavailable"
    }
  end
end
