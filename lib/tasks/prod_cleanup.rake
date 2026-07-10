# One-off production hygiene tasks used to clear automated test/probe data.
# Read-only by default: prints what it *would* do unless APPLY=1 is set.
namespace :prod_cleanup do
  # Subdomain prefixes of orgs created by automated audits/probes.
  PROBE_PREFIXES = %w[probe- verify- score- settings- qs- il- c1- score-org].freeze

  desc "Delete organizations created by automated probes (APPLY=1 to execute)"
  task purge_probe_orgs: :environment do
    apply = ENV["APPLY"] == "1"
    ActsAsTenant.without_tenant do
      orgs = Organization.where(
        PROBE_PREFIXES.map { "subdomain LIKE ?" }.join(" OR "),
        *PROBE_PREFIXES.map { |p| "#{p}%" }
      )
      puts "#{apply ? 'Deleting' : '[dry-run] Would delete'} #{orgs.count} probe orgs:"
      orgs.find_each do |o|
        puts "  - #{o.subdomain} (#{o.name}, users=#{o.users.count})"
        o.destroy if apply
      end
    end
    puts apply ? "Done." : "Set APPLY=1 to execute."
  end

  desc "Clear failed mail-delivery jobs left by unconfigured SMTP (APPLY=1)"
  task clear_failed_mailer_jobs: :environment do
    apply = ENV["APPLY"] == "1"
    failed = SolidQueue::FailedExecution.joins(:job)
                                        .where(solid_queue_jobs: { class_name: "ActionMailer::MailDeliveryJob" })
    puts "#{apply ? 'Clearing' : '[dry-run] Would clear'} #{failed.count} failed mailer jobs"
    failed.find_each { |f| f.destroy } if apply
    puts apply ? "Done." : "Set APPLY=1 to execute."
  end
end
