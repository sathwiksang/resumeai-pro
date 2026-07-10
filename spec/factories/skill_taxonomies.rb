FactoryBot.define do
  factory :skill_taxonomy do
    name { Faker::ProgrammingLanguage.name }
    category { %w[technical soft tool certification].sample }
    aliases { [] }

    trait :technical do
      category { "technical" }
    end

    trait :soft do
      category { "soft" }
    end

    trait :with_aliases do
      aliases { ["alias1", "alias2"] }
    end
  end
end
