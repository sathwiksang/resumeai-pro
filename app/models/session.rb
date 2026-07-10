class Session < ApplicationRecord
  belongs_to :user

  before_create :set_defaults

  private

  def set_defaults
    self.ip_address ||= "0.0.0.0"
  end
end
