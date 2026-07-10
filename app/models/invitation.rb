class Invitation < ApplicationRecord
  acts_as_tenant(:organization)
  belongs_to :invited_by, class_name: "User"

  enum :role, { candidate: 0, recruiter: 1, admin: 2 }
  enum :status, { pending: 0, accepted: 1, declined: 2, expired: 3 }

  validates :email, presence: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :token, presence: true, uniqueness: true
  validates :role, presence: true
  validates :expires_at, presence: true

  before_validation :generate_token, on: :create
  before_validation :set_expiry, on: :create

  normalizes :email, with: ->(email) { email.strip.downcase }

  scope :active, -> { pending.where("expires_at > ?", Time.current) }

  def past_expiry?
    expires_at < Time.current
  end

  def accept!(user)
    transaction do
      update!(status: :accepted, accepted_at: Time.current)
      user.update!(invitation: self)
    end
  end

  def decline!
    update!(status: :declined)
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def set_expiry
    self.expires_at ||= 7.days.from_now
  end
end
