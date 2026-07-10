FactoryBot.define do
  factory :job_description do
    organization
    user
    title { Faker::Job.title }
    company { Faker::Company.name }
    description { Faker::Lorem.paragraphs(number: 3).join("\n\n") }
    status { :pending }

    trait :ready do
      status { :ready }
      requirements do
        {
          required_skills: ["Ruby", "Rails", "PostgreSQL"],
          preferred_skills: ["React", "TypeScript"],
          experience_years: { min: 3, max: 7 },
          education_requirements: ["Bachelor's in CS"]
        }
      end
      required_skills { ["Ruby", "Rails", "PostgreSQL"] }
      preferred_skills { ["React", "TypeScript"] }
    end
  end
end
