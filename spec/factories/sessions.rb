FactoryBot.define do
  factory :session do
    user
    ip_address { Faker::Internet.ip_v4_address }
    user_agent { "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" }
  end
end
