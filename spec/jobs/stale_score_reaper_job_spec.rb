require "rails_helper"

RSpec.describe StaleScoreReaperJob, type: :job do
  let(:org) { create(:organization) }
  let(:user) { create(:user, organization: org) }
  let(:resume) { create(:resume, organization: org, user: user) }
  let(:jd) { create(:job_description, organization: org, user: user) }

  # ResumeScore is unique per resume+JD pair, so give each score its own resume.
  def score_with(status:, created_at:)
    ActsAsTenant.with_tenant(org) do
      r = create(:resume, organization: org, user: user)
      create(:resume_score, organization: org, user: user, resume: r,
                            job_description: jd, status: status, created_at: created_at)
    end
  end

  it "errors a score stuck analyzing past the threshold" do
    stuck = score_with(status: :analyzing, created_at: 30.minutes.ago)
    described_class.perform_now
    expect(stuck.reload.status).to eq("error")
    expect(stuck.error_message).to match(/timed out/i)
  end

  it "errors a score stuck queued past the threshold" do
    stuck = score_with(status: :queued, created_at: 30.minutes.ago)
    described_class.perform_now
    expect(stuck.reload.status).to eq("error")
  end

  it "leaves a recent in-progress score alone" do
    fresh = score_with(status: :analyzing, created_at: 1.minute.ago)
    described_class.perform_now
    expect(fresh.reload.status).to eq("analyzing")
  end

  it "does not touch completed or already-errored scores" do
    done = score_with(status: :completed, created_at: 30.minutes.ago)
    errored = score_with(status: :error, created_at: 30.minutes.ago)
    described_class.perform_now
    expect(done.reload.status).to eq("completed")
    expect(errored.reload.status).to eq("error")
  end

  it "reaps across tenants" do
    other_org = create(:organization)
    other_user = create(:user, organization: other_org)
    other_resume = create(:resume, organization: other_org, user: other_user)
    other_jd = create(:job_description, organization: other_org, user: other_user)
    stuck = ActsAsTenant.with_tenant(other_org) do
      create(:resume_score, organization: other_org, user: other_user, resume: other_resume,
                            job_description: other_jd, status: :analyzing, created_at: 30.minutes.ago)
    end
    described_class.perform_now
    expect(stuck.reload.status).to eq("error")
  end
end
