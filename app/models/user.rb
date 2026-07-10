class User < ApplicationRecord
  has_secure_password

  belongs_to :organization
  belongs_to :invitation, optional: true

  after_create :increment_org_counter
  after_destroy :decrement_org_counter
  has_many :sessions, dependent: :destroy
  has_many :resumes, dependent: :destroy
  has_many :job_descriptions, dependent: :destroy
  has_many :resume_scores, dependent: :destroy

  enum :role, { candidate: 0, recruiter: 1, admin: 2 }

  validates :email_address, presence: true,
            uniqueness: { scope: :organization_id, case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { password_digest_changed? || new_record? }
  validates :first_name, presence: true
  validates :last_name, presence: true

  normalizes :email_address, with: ->(email) { email.strip.downcase }

  def full_name
    "#{first_name} #{last_name}"
  end

  private

  def increment_org_counter
    organization.increment!(:users_count)
  end

  def decrement_org_counter
    organization.decrement!(:users_count)
  end
end
