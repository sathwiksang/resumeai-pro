class ExpireInvitationsJob < ApplicationJob
  queue_as :default

  def perform
    Invitation.pending.where("expires_at <= ?", Time.current).update_all(status: :expired)
  end
end
