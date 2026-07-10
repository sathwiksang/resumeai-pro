class BillingEvent < ApplicationRecord
  belongs_to :organization

  validates :stripe_event_id, presence: true, uniqueness: true
  validates :event_type, presence: true

  scope :recent, -> { order(created_at: :desc) }
end
