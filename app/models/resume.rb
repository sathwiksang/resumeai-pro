class Resume < ApplicationRecord
  acts_as_tenant(:organization)
  belongs_to :user
  has_one_attached :document
  has_many :resume_scores, dependent: :destroy
  has_neighbors :embedding, dimensions: 768

  enum :status, { pending: 0, parsing: 1, parsed: 2, extracting: 3, ready: 4, error: 5 }

  validates :filename, presence: true
  validate :acceptable_document, if: -> { document.attached? }

  scope :by_status, ->(status) { where(status: status) }
  scope :recent, -> { order(created_at: :desc) }

  after_create_commit :enqueue_parsing, if: -> { document.attached? }
  after_create :increment_org_counter
  after_destroy :decrement_org_counter

  def full_name
    filename
  end

  private

  def acceptable_document
    unless document.content_type.in?(DocumentParser::SUPPORTED_TYPES)
      errors.add(:document, "must be a PDF, DOCX, or TXT file")
    end
    if document.byte_size > DocumentParser::MAX_FILE_SIZE
      errors.add(:document, "is too large (max 10MB)")
    end
  end

  def enqueue_parsing
    ResumeParsingJob.perform_later(id)
  end

  def increment_org_counter
    organization.increment!(:resumes_count)
  end

  def decrement_org_counter
    organization.decrement!(:resumes_count)
  end
end
