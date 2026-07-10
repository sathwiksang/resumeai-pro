# Marks scores that have been stuck in a non-terminal state far longer than
# any real analysis takes as errored, so the UI shows a retriable failure
# instead of a spinner that never resolves. Runs on a schedule (recurring.yml).
class StaleScoreReaperJob < ApplicationJob
  queue_as :default

  # Generous: the local LLM can take a couple of minutes per analysis.
  STALE_AFTER = 15.minutes

  def perform(stale_after: STALE_AFTER)
    cutoff = Time.current - stale_after

    # Runs across all tenants — no tenant is set in a scheduled job.
    ActsAsTenant.without_tenant do
      ResumeScore.where(status: [ :queued, :analyzing ])
                 .where(created_at: ..cutoff)
                 .find_each do |score|
        score.update!(
          status: :error,
          error_message: "Analysis timed out. Please try running it again."
        )
        Rails.logger.warn("[StaleScoreReaper] Reaped stuck score ##{score.id} (org #{score.organization_id})")
      end
    end
  end
end
