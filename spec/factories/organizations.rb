FactoryBot.define do
  factory :organization do
    name { Faker::Company.name }
    subdomain { Faker::Internet.slug(glue: "-") }
    plan { "free" }
    monthly_analysis_limit { 10 }
    analyses_used_this_month { 0 }
    resumes_count { 0 }
    job_descriptions_count { 0 }
    users_count { 0 }

    trait :pro do
      plan { "pro" }
      monthly_analysis_limit { 200 }
    end

    trait :enterprise do
      plan { "enterprise" }
      monthly_analysis_limit { 0 }
    end

    trait :at_limit do
      analyses_used_this_month { 10 }
    end

    trait :with_stripe do
      stripe_customer_id { "cus_#{SecureRandom.alphanumeric(14)}" }
      stripe_subscription_id { "sub_#{SecureRandom.alphanumeric(14)}" }
      subscription_status { "active" }
      current_period_end { 30.days.from_now }
      billing_email { Faker::Internet.email }
    end
  end
end
