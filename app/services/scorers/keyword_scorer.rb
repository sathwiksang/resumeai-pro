module Scorers
  class KeywordScorer
    # BM25F-inspired field weights — skills matter most, education least
    FIELD_WEIGHTS = {
      skills: 2.0,
      job_title: 1.8,
      summary: 1.5,
      experience: 1.5,
      certifications: 1.3,
      education: 1.0
    }.freeze

    BM25_K1 = 1.2   # Term frequency saturation
    BM25_B  = 0.75   # Length normalization

    # Minimum Jaro-Winkler similarity for fuzzy matching
    FUZZY_THRESHOLD = 0.85

    def initialize(resume_data, jd_data)
      @resume_data = resume_data || {}
      @jd_data = jd_data || {}
      @field_texts = build_field_texts
      @avg_doc_length = calculate_avg_doc_length
    end

    def score
      required = normalize_terms(@jd_data["required_skills"] || @jd_data[:required_skills] || [])
      preferred = normalize_terms(@jd_data["preferred_skills"] || @jd_data[:preferred_skills] || [])
      keywords = extract_jd_keywords

      all_terms = (required + preferred + keywords).uniq
      return empty_result if all_terms.empty?

      matched = []
      missing = []
      partial = []

      all_terms.each do |term|
        match = find_best_match(term)
        case match[:type]
        when :exact
          matched << { term: term, field: match[:field], weight: match[:weight] }
        when :fuzzy
          partial << { term: term, field: match[:field], similarity: match[:similarity], matched_as: match[:matched_as] }
        when :missing
          missing << term
        end
      end

      # Required skills matching rate
      required_matched = required.count { |r| matched.any? { |m| m[:term] == r } || partial.any? { |p| p[:term] == r } }
      required_match_rate = required.any? ? (required_matched.to_f / required.size * 100) : 100.0

      # BM25F-weighted score
      bm25_score = calculate_bm25_score(matched, partial, all_terms.size)

      {
        score: [bm25_score.round(1), 100.0].min,
        required_match_rate: required_match_rate.round(1),
        matched: matched,
        missing: missing,
        partial: partial,
        keyword_density: calculate_density(all_terms),
        total_keywords: all_terms.size,
        match_rate: ((matched.size + partial.size * 0.5) / [all_terms.size, 1].max * 100).round(1)
      }
    end

    private

    def empty_result
      { score: 0.0, required_match_rate: 0.0, matched: [], missing: [], partial: [],
        keyword_density: 0.0, total_keywords: 0, match_rate: 0.0 }
    end

    def build_field_texts
      skills = @resume_data.dig("skills", "technical") || @resume_data.dig(:skills, :technical) || []
      soft_skills = @resume_data.dig("skills", "soft") || @resume_data.dig(:skills, :soft) || []
      tools = @resume_data.dig("skills", "tools") || @resume_data.dig(:skills, :tools) || []
      certs = @resume_data.dig("skills", "certifications") || @resume_data.dig(:skills, :certifications) || []

      experience = (@resume_data["experience"] || @resume_data[:experience] || [])
      education = (@resume_data["education"] || @resume_data[:education] || [])

      {
        skills: (skills + soft_skills + tools).join(" "),
        certifications: certs.join(" "),
        job_title: experience.map { |e| e["title"] || e[:title] || "" }.join(" "),
        summary: @resume_data["summary"] || @resume_data[:summary] || "",
        experience: experience.map { |e|
          achievements = e["achievements"] || e[:achievements] || []
          "#{e["title"] || e[:title]} #{e["company"] || e[:company]} #{achievements.join(" ")}"
        }.join(" "),
        education: education.map { |e|
          "#{e["degree"] || e[:degree]} #{e["institution"] || e[:institution]}"
        }.join(" ")
      }
    end

    def calculate_avg_doc_length
      lengths = @field_texts.values.map { |t| t.split.size }
      lengths.any? ? (lengths.sum.to_f / lengths.size) : 1.0
    end

    def find_best_match(term)
      best = { type: :missing, weight: 0, similarity: 0 }

      @field_texts.each do |field, text|
        words = text.downcase.split(/[\s,;|\/]+/).map(&:strip).reject(&:empty?)
        field_weight = FIELD_WEIGHTS[field] || 1.0

        # Exact match (case-insensitive, supports multi-word terms)
        if text.downcase.include?(term)
          tf = text.downcase.scan(term).size
          doc_len = words.size.to_f
          bm25_tf = (tf * (BM25_K1 + 1)) / (tf + BM25_K1 * (1 - BM25_B + BM25_B * doc_len / @avg_doc_length))
          weight = bm25_tf * field_weight

          if weight > best[:weight] || best[:type] == :missing
            best = { type: :exact, field: field, weight: weight.round(3) }
          end
          next
        end

        # Fuzzy match (Jaro-Winkler on individual words for single-word terms)
        next if term.include?(" ") # Skip fuzzy for multi-word terms

        words.each do |word|
          sim = jaro_winkler(term, word)
          if sim >= FUZZY_THRESHOLD && sim > best[:similarity]
            best = { type: :fuzzy, field: field, similarity: sim.round(3), matched_as: word }
          end
        end
      end

      best
    end

    def calculate_bm25_score(matched, partial, total_terms)
      return 0.0 if total_terms.zero?

      exact_score = matched.sum { |m| m[:weight] }
      partial_score = partial.sum { |p| p[:similarity] * 0.5 }
      max_possible = total_terms * FIELD_WEIGHTS.values.max

      ((exact_score + partial_score) / [max_possible, 1.0].max * 100)
    end

    def calculate_density(all_terms)
      full_text = @field_texts.values.join(" ").downcase
      total_words = full_text.split.size
      return 0.0 if total_words.zero?

      matched_count = all_terms.count { |t| full_text.include?(t) }
      (matched_count.to_f / total_words * 100).round(2)
    end

    def extract_jd_keywords
      # Extract significant terms from JD requirements text
      req = @jd_data["requirements"] || @jd_data[:requirements] || {}
      responsibilities = @jd_data["responsibilities"] || @jd_data[:responsibilities] || []
      qualifications = @jd_data["qualifications"] || @jd_data[:qualifications] || []

      text = [
        responsibilities.join(" "),
        qualifications.join(" "),
        req.is_a?(String) ? req : ""
      ].join(" ")

      # Extract capitalized terms and technical-looking words (3+ chars)
      words = text.scan(/\b[A-Z][a-zA-Z+#.]{2,}\b/).map(&:downcase).uniq
      # Don't duplicate what's already in required/preferred
      existing = normalize_terms(
        (@jd_data["required_skills"] || @jd_data[:required_skills] || []) +
        (@jd_data["preferred_skills"] || @jd_data[:preferred_skills] || [])
      )
      words - existing
    end

    def normalize_terms(terms)
      terms.map { |t| t.to_s.downcase.strip }.reject(&:empty?).uniq
    end

    # Jaro-Winkler similarity — efficient pure-Ruby implementation
    def jaro_winkler(s1, s2, winkler_weight: 0.1)
      return 1.0 if s1 == s2
      return 0.0 if s1.empty? || s2.empty?

      max_len = [s1.length, s2.length].max
      match_distance = [max_len / 2 - 1, 0].max

      s1_matches = Array.new(s1.length, false)
      s2_matches = Array.new(s2.length, false)

      matches = 0
      transpositions = 0

      s1.length.times do |i|
        start = [0, i - match_distance].max
        finish = [i + match_distance, s2.length - 1].min

        (start..finish).each do |j|
          next if s2_matches[j] || s1[i] != s2[j]
          s1_matches[i] = true
          s2_matches[j] = true
          matches += 1
          break
        end
      end

      return 0.0 if matches.zero?

      k = 0
      s1.length.times do |i|
        next unless s1_matches[i]
        k += 1 until s2_matches[k]
        transpositions += 1 if s1[i] != s2[k]
        k += 1
      end

      jaro = (matches.to_f / s1.length + matches.to_f / s2.length +
              (matches - transpositions / 2.0) / matches) / 3.0

      # Winkler modification — boost for common prefix
      prefix = 0
      [s1.length, s2.length, 4].min.times do |i|
        s1[i] == s2[i] ? prefix += 1 : break
      end

      jaro + prefix * winkler_weight * (1 - jaro)
    end
  end
end
