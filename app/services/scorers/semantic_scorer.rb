module Scorers
  class SemanticScorer
    # Section weights for granular section-level scoring
    SECTION_WEIGHTS = {
      skills: 0.35,
      experience: 0.30,
      education: 0.15,
      summary: 0.20
    }.freeze

    def initialize(resume, job_description)
      @resume = resume
      @job_description = job_description
    end

    def score
      unless @resume.embedding.present? && @job_description.embedding.present?
        return { score: 0.0, overall_cosine: 0.0, section_scores: {}, details: "Missing embeddings" }
      end

      # Overall document-level similarity
      overall_sim = cosine_similarity(@resume.embedding, @job_description.embedding)

      # Section-level similarity (if parsed_data available)
      section_scores = score_sections

      # Weighted section score (fall back to overall if sections unavailable)
      weighted_section = if section_scores.any?
        section_scores.sum { |section, data| data[:score] * (SECTION_WEIGHTS[section] || 0.1) }
      else
        overall_sim * 100
      end

      # Blend: 60% overall similarity + 40% section-weighted
      blended = (overall_sim * 100 * 0.6 + weighted_section * 0.4)

      {
        score: blended.round(1),
        overall_cosine: overall_sim.round(4),
        section_scores: section_scores,
        similar_resumes: find_similar_resumes
      }
    end

    private

    def cosine_similarity(vec_a, vec_b)
      return 0.0 if vec_a.nil? || vec_b.nil? || vec_a.empty? || vec_b.empty?

      dot = 0.0
      mag_a = 0.0
      mag_b = 0.0

      vec_a.each_with_index do |a, i|
        b = vec_b[i] || 0.0
        dot += a * b
        mag_a += a * a
        mag_b += b * b
      end

      denominator = Math.sqrt(mag_a) * Math.sqrt(mag_b)
      return 0.0 if denominator.zero?

      dot / denominator
    end

    def score_sections
      resume_data = @resume.parsed_data || {}
      jd_data = @job_description.requirements || {}
      return {} if resume_data.empty?

      sections = {}

      # Skills section similarity
      resume_skills = extract_skills_text(resume_data)
      jd_skills = extract_jd_skills_text
      if resume_skills.present? && jd_skills.present?
        sections[:skills] = {
          score: text_overlap_score(resume_skills, jd_skills),
          resume_terms: resume_skills.split.size,
          jd_terms: jd_skills.split.size
        }
      end

      # Experience section
      resume_exp = extract_experience_text(resume_data)
      jd_resp = extract_responsibilities_text
      if resume_exp.present? && jd_resp.present?
        sections[:experience] = {
          score: text_overlap_score(resume_exp, jd_resp),
          resume_terms: resume_exp.split.size,
          jd_terms: jd_resp.split.size
        }
      end

      # Education section
      resume_edu = extract_education_text(resume_data)
      jd_edu = extract_education_requirements
      if resume_edu.present? && jd_edu.present?
        sections[:education] = {
          score: text_overlap_score(resume_edu, jd_edu),
          resume_terms: resume_edu.split.size,
          jd_terms: jd_edu.split.size
        }
      end

      sections
    end

    # Simple term overlap scoring (Jaccard-like, weighted by term importance)
    def text_overlap_score(text_a, text_b)
      terms_a = text_a.downcase.split(/[\s,;|\/]+/).reject { |t| t.length < 3 }.to_set
      terms_b = text_b.downcase.split(/[\s,;|\/]+/).reject { |t| t.length < 3 }.to_set

      return 0.0 if terms_a.empty? || terms_b.empty?

      intersection = terms_a & terms_b
      union = terms_a | terms_b

      # Jaccard similarity scaled to 0-100
      (intersection.size.to_f / union.size * 100).round(1)
    end

    def extract_skills_text(data)
      skills = data.dig("skills", "technical") || data.dig(:skills, :technical) || []
      tools = data.dig("skills", "tools") || data.dig(:skills, :tools) || []
      certs = data.dig("skills", "certifications") || data.dig(:skills, :certifications) || []
      (skills + tools + certs).join(" ")
    end

    def extract_jd_skills_text
      required = @job_description.required_skills || []
      preferred = @job_description.preferred_skills || []
      (required + preferred).join(" ")
    end

    def extract_experience_text(data)
      (data["experience"] || data[:experience] || []).map { |e|
        achievements = e["achievements"] || e[:achievements] || []
        "#{e["title"] || e[:title]} #{achievements.join(" ")}"
      }.join(" ")
    end

    def extract_responsibilities_text
      req = @job_description.requirements || {}
      responsibilities = req["responsibilities"] || []
      qualifications = req["qualifications"] || []
      (responsibilities + qualifications).join(" ")
    end

    def extract_education_text(data)
      (data["education"] || data[:education] || []).map { |e|
        "#{e["degree"] || e[:degree]} #{e["institution"] || e[:institution]}"
      }.join(" ")
    end

    def extract_education_requirements
      req = @job_description.requirements || {}
      edu = req["education_level"] || req["education_requirements"] || ""
      edu.is_a?(Array) ? edu.join(" ") : edu.to_s
    end

    def find_similar_resumes
      return [] unless @job_description.embedding.present?

      Resume.where.not(id: @resume.id)
            .where.not(embedding: nil)
            .nearest_neighbors(:embedding, @job_description.embedding, distance: "cosine")
            .limit(5)
            .map { |r| { id: r.id, filename: r.filename, distance: r.neighbor_distance&.round(4) } }
    rescue => e
      Rails.logger.warn("[SemanticScorer] Similar resume search failed: #{e.message}")
      []
    end
  end
end
