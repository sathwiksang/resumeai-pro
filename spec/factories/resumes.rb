FactoryBot.define do
  factory :resume do
    organization
    user
    filename { "#{Faker::Name.last_name}_resume.pdf" }
    content_type { "application/pdf" }
    status { :pending }

    trait :parsed do
      status { :parsed }
      raw_text { Faker::Lorem.paragraphs(number: 5).join("\n\n") }
      content_digest { Digest::SHA256.hexdigest(raw_text.to_s) }
      parsed_data do
        {
          contact: { name: Faker::Name.name, email: Faker::Internet.email },
          skills: { technical: ["Ruby", "Rails", "PostgreSQL"], soft: ["Leadership"] },
          experience: [{ title: "Developer", company: "TechCo" }],
          education: [{ degree: "BS Computer Science", institution: "MIT" }]
        }
      end
    end

    trait :ready do
      parsed
      status { :ready }
    end

    trait :with_error do
      status { :error }
      error_message { "Failed to parse document" }
    end
  end
end
