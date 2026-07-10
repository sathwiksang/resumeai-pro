class ResumeScore < ApplicationRecord
  acts_as_tenant(:organization)
  belongs_to :resume
  belongs_to :job_description
  belongs_to :user

  enum :status, { queued: 0, analyzing: 1, completed: 2, error: 3 }

  validates :resume_id, uniqueness: { scope: :job_description_id }

  scope :recent, -> { order(created_at: :desc) }
  scope :completed, -> { where(status: :completed) }
  scope :by_grade, ->(grade) { where(grade: grade) }

  GRADE_THRESHOLDS = {
    "A+" => 90..100,
    "A"  => 85..89,
    "B+" => 80..84,
    "B"  => 75..79,
    "C+" => 70..74,
    "C"  => 65..69,
    "D"  => 55..64,
    "F"  => 0..54
  }.freeze

  def self.grade_for(score)
    GRADE_THRESHOLDS.find { |_grade, range| range.include?(score.to_i) }&.first || "F"
  end
end
