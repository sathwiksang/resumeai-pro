FactoryBot.define do
  factory :invitation do
    organization
    association :invited_by, factory: [:user, :admin]
    email { Faker::Internet.email }
    role { :candidate }
    status { :pending }
    expires_at { 7.days.from_now }

    before(:create) do |invitation|
      invitation.invited_by.update!(organization: invitation.organization) if invitation.invited_by.organization != invitation.organization
    end

    trait :accepted do
      status { :accepted }
      accepted_at { 1.day.ago }
    end

    trait :expired do
      status { :expired }
      expires_at { 1.day.ago }
    end

    trait :declined do
      status { :declined }
    end

    trait :recruiter_role do
      role { :recruiter }
    end

    trait :admin_role do
      role { :admin }
    end
  end
end
