class JdExtractionJob < ApplicationJob
  queue_as :default
  retry_on OllamaService::ConnectionError, wait: 30.seconds, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  EXTRACTION_SYSTEM_PROMPT = <<~PROMPT
    You are a job description analysis expert. Extract structured requirements from the job description provided.
    Return a JSON object with the following structure:

    {
      "requirements": {
        "years_experience": 5,
        "education_level": "Bachelor's",
        "clearance": null,
        "remote": true
      },
      "required_skills": ["Python", "SQL", "Machine Learning"],
      "preferred_skills": ["TensorFlow", "AWS", "Docker"],
      "responsibilities": [
        "Design and implement ML pipelines",
        "Lead a team of data scientists"
      ],
      "qualifications": [
        "5+ years of experience in ML",
        "Strong background in statistics"
      ]
    }

    IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.
  PROMPT

  def perform(job_description_id)
    jd = JobDescription.find(job_description_id)
    jd.update!(status: :extracting)

    # Generate embedding
    embedding = generate_embedding(jd.description)

    # Extract structured requirements via LLM
    response = OllamaService.chat(
      "Extract requirements from this job description:\n\n#{jd.description.truncate(8000)}",
      system: EXTRACTION_SYSTEM_PROMPT,
      model: OllamaService::CHAT_MODEL,
      format: "json"
    )

    parsed = parse_llm_response(response[:content])

    jd.update!(
      requirements: parsed.fetch("requirements", {}),
      required_skills: parsed.fetch("required_skills", jd.required_skills || []),
      preferred_skills: parsed.fetch("preferred_skills", jd.preferred_skills || []),
      embedding: embedding,
      status: :ready
    )
  rescue OllamaService::ConnectionError => e
    Rails.logger.warn("[JdExtractionJob] Ollama unavailable: #{e.message}")
    jd.update!(status: :ready) # Proceed without extraction
  rescue OllamaService::ModelError => e
    jd.update!(status: :error, error_message: "Extraction failed: #{e.message}")
  end

  private

  def generate_embedding(text)
    OllamaService.embed(text)
  rescue OllamaService::ConnectionError, OllamaService::ModelError => e
    Rails.logger.warn("[JdExtractionJob] Embedding failed: #{e.message}")
    nil
  end

  def parse_llm_response(content)
    return {} if content.blank?

    cleaned = content
      .gsub(/\A```(?:json)?\s*/i, "")
      .gsub(/\s*```\z/, "")
      .strip

    JSON.parse(cleaned)
  rescue JSON::ParserError
    if (match = cleaned.match(/\{.*\}/m))
      JSON.parse(match[0])
    else
      {}
    end
  end
end
