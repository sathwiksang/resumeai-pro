FactoryBot.define do
  factory :user do
    organization
    email_address { Faker::Internet.email }
    password { "password123" }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    role { :candidate }

    trait :recruiter do
      role { :recruiter }
    end

    trait :admin do
      role { :admin }
    end
  end
end
