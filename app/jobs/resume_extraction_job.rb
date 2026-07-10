class ResumeExtractionJob < ApplicationJob
  queue_as :default
  retry_on OllamaService::ConnectionError, wait: 30.seconds, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  EXTRACTION_SYSTEM_PROMPT = <<~PROMPT
    You are a resume parsing expert. Extract structured information from the resume text provided.
    Return a JSON object with the following structure (omit fields if not found):

    {
      "contact": {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "+1-555-0100",
        "location": "City, State",
        "linkedin": "linkedin.com/in/username",
        "github": "github.com/username",
        "portfolio": "website.com"
      },
      "summary": "Professional summary or objective statement",
      "skills": {
        "technical": ["Python", "JavaScript", "SQL"],
        "soft": ["Leadership", "Communication"],
        "tools": ["Docker", "AWS", "Git"],
        "certifications": ["AWS Solutions Architect"]
      },
      "experience": [
        {
          "title": "Senior Software Engineer",
          "company": "Company Name",
          "location": "City, State",
          "start_date": "Jan 2020",
          "end_date": "Present",
          "achievements": [
            "Led team of 5 engineers...",
            "Increased performance by 40%..."
          ]
        }
      ],
      "education": [
        {
          "degree": "Bachelor of Science in Computer Science",
          "institution": "University Name",
          "graduation_date": "May 2018",
          "gpa": "3.8",
          "honors": "Cum Laude"
        }
      ],
      "projects": [
        {
          "name": "Project Name",
          "description": "Brief description",
          "technologies": ["React", "Node.js"]
        }
      ],
      "languages": ["English", "Spanish"]
    }

    IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.
  PROMPT

  def perform(resume_id)
    resume = Resume.find(resume_id)
    return unless resume.raw_text.present?

    resume.update!(status: :extracting)

    # Use LLM to extract structured data
    response = OllamaService.chat(
      "Extract structured data from this resume:\n\n#{resume.raw_text.truncate(8000)}",
      system: EXTRACTION_SYSTEM_PROMPT,
      model: OllamaService::CHAT_MODEL,
      format: "json"
    )

    parsed_data = parse_llm_response(response[:content])

    resume.update!(
      parsed_data: parsed_data,
      status: :ready
    )
  rescue OllamaService::ConnectionError => e
    # If Ollama is down after retries, mark ready without parsed_data
    Rails.logger.warn("[ResumeExtractionJob] Ollama unavailable: #{e.message}")
    resume.update!(status: :ready) if resume.parsed?
  rescue OllamaService::ModelError => e
    resume.update!(status: :error, error_message: "Extraction failed: #{e.message}")
  rescue JSON::ParserError => e
    Rails.logger.warn("[ResumeExtractionJob] Invalid JSON from LLM: #{e.message}")
    resume.update!(status: :ready) # Continue without parsed_data
  end

  private

  def parse_llm_response(content)
    return {} if content.blank?

    # Sometimes LLMs wrap JSON in markdown code blocks
    cleaned = content
      .gsub(/\A```(?:json)?\s*/i, "")
      .gsub(/\s*```\z/, "")
      .strip

    JSON.parse(cleaned)
  rescue JSON::ParserError
    # Try to find JSON object within the response
    if (match = cleaned.match(/\{.*\}/m))
      JSON.parse(match[0])
    else
      {}
    end
  end
end
