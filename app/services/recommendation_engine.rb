class RecommendationEngine
  def self.generate(keyword_result, semantic_result, llm_result)
    new(keyword_result, semantic_result, llm_result).generate
  end

  def initialize(keyword_result, semantic_result, llm_result)
    @keyword = keyword_result
    @semantic = semantic_result
    @llm = llm_result
  end

  def generate
    recommendations = []

    recommendations.concat(skill_gap_recommendations)
    recommendations.concat(keyword_recommendations)
    recommendations.concat(experience_recommendations)
    recommendations.concat(format_recommendations)
    recommendations.concat(content_recommendations)
    recommendations.concat(education_recommendations)

    # Sort by priority weight (critical first) then by impact
    recommendations
      .sort_by { |r| [-priority_weight(r[:priority]), -(r[:impact_score] || 0)] }
      .first(10) # Cap at 10 recommendations
  end

  private

  def skill_gap_recommendations
    recs = []
    missing = @llm.dig("skills_match", "missing_critical") || []
    transferable = @llm.dig("skills_match", "transferable") || []

    if missing.any?
      recs << {
        priority: "critical",
        category: "missing_skill",
        title: "Add missing critical skills",
        description: "The job requires #{missing.join(", ")} which are not evident in your resume. These are likely deal-breakers for ATS screening.",
        action_items: missing.first(5).map { |s| "Add #{s} to your skills section with relevant experience or projects" },
        estimated_effort: missing.size > 3 ? "significant" : "moderate",
        impact_score: 9
      }
    end

    if transferable.any?
      recs << {
        priority: "medium",
        category: "missing_skill",
        title: "Highlight transferable skills",
        description: "You have #{transferable.join(", ")} which partially match requirements. Make these connections explicit.",
        action_items: transferable.first(3).map { |s| "Reframe #{s} experience to align with job requirements" },
        estimated_effort: "moderate",
        impact_score: 6
      }
    end

    recs
  end

  def keyword_recommendations
    recs = []
    missing_keywords = @keyword[:missing] || []
    match_rate = @keyword[:match_rate] || 0

    if missing_keywords.size > 3
      recs << {
        priority: "high",
        category: "keyword",
        title: "Improve keyword coverage",
        description: "#{missing_keywords.size} important keywords from the job description are missing. ATS systems rely heavily on keyword matching.",
        action_items: [
          "Naturally incorporate these terms: #{missing_keywords.first(5).join(", ")}",
          "Use exact phrasing from the job description where applicable",
          "Add a 'Technical Skills' section if you don't have one"
        ],
        estimated_effort: "quick_fix",
        impact_score: 8
      }
    end

    if match_rate < 50 && @keyword[:total_keywords].to_i > 0
      recs << {
        priority: "high",
        category: "keyword",
        title: "Low keyword match rate (#{match_rate}%)",
        description: "Your resume matches less than half the key terms. This significantly reduces ATS pass-through rates.",
        action_items: [
          "Review the job description and mirror its language",
          "Add a skills summary section with relevant technologies",
          "Ensure job titles and descriptions use industry-standard terminology"
        ],
        estimated_effort: "moderate",
        impact_score: 8
      }
    end

    recs
  end

  def experience_recommendations
    recs = []
    exp = @llm.dig("experience_relevance") || {}
    alignment = exp["role_alignment"]
    years_relevant = exp["years_relevant"]
    years_required = exp["years_required"]

    if alignment == "weak"
      recs << {
        priority: "high",
        category: "weak_experience",
        title: "Strengthen experience alignment",
        description: "Your experience doesn't closely align with this role. Reframe accomplishments to highlight relevant transferable experience.",
        action_items: [
          "Lead each bullet with the most relevant achievement",
          "Use terminology from the job description in your experience section",
          "Highlight projects or responsibilities that overlap with job requirements"
        ],
        estimated_effort: "significant",
        impact_score: 7
      }
    elsif alignment == "moderate"
      recs << {
        priority: "medium",
        category: "weak_experience",
        title: "Fine-tune experience descriptions",
        description: "Your experience partially aligns. Small adjustments could strengthen the connection.",
        action_items: [
          "Quantify achievements with metrics (percentages, dollar amounts, team sizes)",
          "Reorder bullets to prioritize most relevant accomplishments"
        ],
        estimated_effort: "moderate",
        impact_score: 5
      }
    end

    if years_relevant && years_required && years_relevant < years_required
      gap = years_required - years_relevant
      recs << {
        priority: gap > 2 ? "high" : "medium",
        category: "weak_experience",
        title: "Address experience gap (#{gap} years short)",
        description: "The role requires #{years_required} years but you show #{years_relevant} years of relevant experience.",
        action_items: [
          "Include related experience from adjacent roles or fields",
          "Highlight freelance, consulting, or open-source work",
          "Emphasize depth and impact over duration"
        ],
        estimated_effort: "moderate",
        impact_score: gap > 2 ? 7 : 4
      }
    end

    recs
  end

  def format_recommendations
    recs = []
    format = @llm.dig("format_quality") || {}
    issues = format["issues"] || []
    score = format["score"] || 100

    if score < 70 && issues.any?
      recs << {
        priority: "medium",
        category: "formatting",
        title: "Fix resume formatting",
        description: "Formatting issues were detected that may affect readability and ATS parsing.",
        action_items: issues.first(5).map { |issue| "Fix: #{issue}" },
        estimated_effort: "quick_fix",
        impact_score: 5
      }
    end

    recs
  end

  def content_recommendations
    recs = []
    content = @llm.dig("content_quality") || {}

    unless content["has_quantified_achievements"]
      recs << {
        priority: "high",
        category: "achievement",
        title: "Add quantified achievements",
        description: "Your resume lacks specific metrics and numbers. Quantified achievements are far more impactful than generic descriptions.",
        action_items: [
          "Add metrics to at least 3 bullet points (e.g., 'Increased revenue by 25%')",
          "Include team sizes, project scales, or budget amounts",
          "Use the format: 'Action verb + what + result/metric'"
        ],
        estimated_effort: "moderate",
        impact_score: 7
      }
    end

    if content["action_verb_usage"] == "weak"
      recs << {
        priority: "low",
        category: "achievement",
        title: "Strengthen action verbs",
        description: "Use strong action verbs at the start of each bullet point to convey leadership and impact.",
        action_items: [
          "Replace passive phrases ('was responsible for') with active verbs ('Led', 'Designed', 'Implemented')",
          "Use varied verbs — avoid repeating the same ones",
          "Choose verbs that match the seniority level of the target role"
        ],
        estimated_effort: "quick_fix",
        impact_score: 3
      }
    end

    recs
  end

  def education_recommendations
    recs = []
    edu = @llm.dig("education_fit") || {}
    score = edu["score"] || 100

    if score < 50
      recs << {
        priority: "medium",
        category: "education",
        title: "Address education gap",
        description: "Your education doesn't fully meet the requirements. Consider highlighting relevant certifications or coursework.",
        action_items: [
          "Add relevant certifications or online courses",
          "Include relevant coursework or training programs",
          "Highlight any self-taught skills with portfolio evidence"
        ],
        estimated_effort: "significant",
        impact_score: 4
      }
    end

    recs
  end

  def priority_weight(priority)
    case priority
    when "critical" then 4
    when "high" then 3
    when "medium" then 2
    when "low" then 1
    else 0
    end
  end
end
