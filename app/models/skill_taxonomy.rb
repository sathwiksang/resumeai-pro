class SkillTaxonomy < ApplicationRecord
  has_neighbors :embedding, dimensions: 768

  validates :name, presence: true, uniqueness: true
  validates :category, inclusion: { in: %w[technical soft tool certification], allow_nil: true }

  scope :technical, -> { where(category: "technical") }
  scope :soft, -> { where(category: "soft") }
  scope :tools, -> { where(category: "tool") }
  scope :certifications, -> { where(category: "certification") }
  scope :by_category, ->(cat) { where(category: cat) }

  def alias_list
    aliases || []
  end
end
