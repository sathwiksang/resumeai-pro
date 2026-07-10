class JobDescription < ApplicationRecord
  acts_as_tenant(:organization)
  belongs_to :user
  has_many :resume_scores, dependent: :destroy
  has_neighbors :embedding, dimensions: 768

  enum :status, { pending: 0, extracting: 1, ready: 2, error: 3 }

  validates :title, presence: true
  validates :description, presence: true

  scope :by_status, ->(status) { where(status: status) }
  scope :recent, -> { order(created_at: :desc) }

  after_create_commit :enqueue_extraction
  after_create :increment_org_counter
  after_destroy :decrement_org_counter

  private

  def enqueue_extraction
    JdExtractionJob.perform_later(id)
  end

  def increment_org_counter
    organization.increment!(:job_descriptions_count)
  end

  def decrement_org_counter
    organization.decrement!(:job_descriptions_count)
  end
end
