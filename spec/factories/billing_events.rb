FactoryBot.define do
  factory :billing_event do
    organization
    stripe_event_id { "evt_#{SecureRandom.alphanumeric(24)}" }
    event_type { "checkout.session.completed" }
    payload { { some: "data" } }
    status { "processed" }
  end
end
