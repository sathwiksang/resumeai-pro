module Scorers
  class LlmScorer
    EVALUATION_PROMPT = <<~PROMPT
      You are an expert ATS system and senior hiring manager. Evaluate this resume against the job description using chain-of-thought reasoning.

      Score each dimension 0-100 with specific evidence. Return ONLY valid JSON:

      {
        "skills_match": {
          "score": <0-100>,
          "evidence": "specific skills found or missing",
          "matched_skills": ["array of matched skills"],
          "missing_critical": ["array of missing required skills"],
          "transferable": ["skills that partially match requirements"]
        },
        "experience_relevance": {
          "score": <0-100>,
          "evidence": "assessment of experience alignment",
          "years_relevant": <number>,
          "years_required": <number or null>,
          "role_alignment": "strong|moderate|weak"
        },
        "education_fit": {
          "score": <0-100>,
          "evidence": "education assessment"
        },
        "format_quality": {
          "score": <0-100>,
          "issues": ["formatting problems found, if any"]
        },
        "content_quality": {
          "score": <0-100>,
          "has_quantified_achievements": <true or false>,
          "action_verb_usage": "strong|moderate|weak",
          "issues": ["content quality issues, if any"]
        },
        "overall_assessment": "2-3 sentence summary of the candidate's fit"
      }

      IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.
    PROMPT

    # Dimension weights for composite LLM score
    WEIGHTS = {
      skills_match: 0.35,
      experience_relevance: 0.30,
      education_fit: 0.15,
      format_quality: 0.10,
      content_quality: 0.10
    }.freeze

    def initialize(resume, job_description)
      @resume = resume
      @job_description = job_description
    end

    def score
      prompt = build_prompt
      response = OllamaService.chat(
        prompt,
        system: EVALUATION_PROMPT,
        model: OllamaService::CHAT_MODEL,
        format: "json"
      )

      evaluation = parse_response(response[:content])
      enrich_evaluation(evaluation, response)
    end

    private

    def build_prompt
      jd = @job_description
      <<~TEXT
        === RESUME ===
        #{@resume.raw_text.to_s.truncate(8000)}

        === JOB DESCRIPTION ===
        Title: #{jd.title}
        Company: #{jd.company}
        Requirements: #{(jd.requirements || {}).to_json}
        Required Skills: #{(jd.required_skills || []).join(", ")}
        Preferred Skills: #{(jd.preferred_skills || []).join(", ")}
        Description: #{jd.description.to_s.truncate(4000)}
      TEXT
    end

    def parse_response(content)
      return default_evaluation if content.blank?

      cleaned = content
        .gsub(/\A```(?:json)?\s*/i, "")
        .gsub(/\s*```\z/, "")
        .strip

      JSON.parse(cleaned)
    rescue JSON::ParserError
      if (match = cleaned&.match(/\{.*\}/m))
        JSON.parse(match[0])
      else
        default_evaluation
      end
    rescue JSON::ParserError
      default_evaluation
    end

    def enrich_evaluation(evaluation, response)
      # Calculate weighted overall score from LLM dimensions
      overall = WEIGHTS.sum do |dim, weight|
        (evaluation.dig(dim.to_s, "score") || 0) * weight
      end

      evaluation.merge(
        "overall_score" => overall.round(1),
        "model" => response[:model],
        "eval_count" => response[:eval_count],
        "prompt_eval_count" => response[:prompt_eval_count]
      )
    end

    def default_evaluation
      {
        "skills_match" => { "score" => 0, "evidence" => "Evaluation unavailable", "matched_skills" => [], "missing_critical" => [], "transferable" => [] },
        "experience_relevance" => { "score" => 0, "evidence" => "Evaluation unavailable", "role_alignment" => "weak" },
        "education_fit" => { "score" => 0, "evidence" => "Evaluation unavailable" },
        "format_quality" => { "score" => 0, "issues" => [] },
        "content_quality" => { "score" => 0, "has_quantified_achievements" => false, "action_verb_usage" => "weak", "issues" => [] },
        "overall_assessment" => "LLM evaluation was not available."
      }
    end
  end
end
