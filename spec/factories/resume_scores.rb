FactoryBot.define do
  factory :resume_score do
    organization
    resume
    job_description
    user
    status { :completed }
    overall_score { rand(40.0..98.0).round(2) }
    grade { ResumeScore.grade_for(overall_score) }
    keyword_score { rand(30.0..100.0).round(2) }
    semantic_score { rand(30.0..100.0).round(2) }
    skills_score { rand(30.0..100.0).round(2) }
    experience_score { rand(30.0..100.0).round(2) }
    education_score { rand(30.0..100.0).round(2) }
    format_score { rand(50.0..100.0).round(2) }
    llm_model { "qwen2.5:3b" }
    content_pair_digest { SecureRandom.hex(32) }

    trait :queued do
      status { :queued }
      overall_score { nil }
      grade { nil }
    end

    trait :high_score do
      overall_score { 92.5 }
      grade { "A+" }
    end

    trait :low_score do
      overall_score { 35.0 }
      grade { "F" }
    end
  end
end
