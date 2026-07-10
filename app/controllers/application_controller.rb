class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization
  include Pagy::Backend
  include PlanEnforceable

  # Tenant = the signed-in user's organization, in every environment. The app
  # is served from a single host (no per-org subdomains), so subdomain-based
  # resolution leaves the tenant nil on all production requests — 500s on any
  # page that dereferences current_organization, and unscoped tenant queries
  # everywhere else. Public token flows (invitation acceptance) set their own
  # tenant explicitly.
  set_current_tenant_through_filter
  before_action :set_tenant_from_user
  before_action :redirect_workspace_mismatch

  after_action :verify_authorized, unless: -> { action_name == "index" || skip_pundit? }
  after_action :verify_policy_scoped, if: -> { action_name == "index" && !skip_pundit? }

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # Share auth data and flash messages with every Inertia response
  inertia_share do
    {
      auth: {
        user: if current_user
                {
                  id: current_user.id,
                  email_address: current_user.email_address,
                  first_name: current_user.first_name,
                  last_name: current_user.last_name,
                  role: current_user.role,
                  avatar_url: current_user.avatar_url,
                }
              end,
        organization: if current_organization
                        {
                          id: current_organization.id,
                          name: current_organization.name,
                          subdomain: current_organization.subdomain,
                          plan: current_organization.plan,
                          analyses_used_this_month: current_organization.analyses_used_this_month,
                          monthly_analysis_limit: current_organization.monthly_analysis_limit,
                          subscription_status: current_organization.subscription_status,
                          plan_limits: serialize_plan_limits(current_organization.plan_limits),
                          usage: current_organization.usage_summary,
                        }
                      end,
      },
      flash: {
        notice: flash[:notice],
        alert: flash[:alert],
      },
      workspace_domain: workspace_domain,
      llm_model: OllamaService::CHAT_MODEL,
      notifications: current_user ? build_notifications : [],
    }
  end

  private

  def set_tenant_from_user
    set_current_tenant(current_user&.organization)
  end

  def workspace_domain
    Rails.application.config.x.workspace_domain
  end
  helper_method :workspace_domain

  # Host of the form <sub>.<workspace_domain> belongs to the org with that
  # subdomain. Signed-in users visiting another org's workspace URL are
  # bounced to their own; anonymous visitors may load any workspace's login.
  def redirect_workspace_mismatch
    suffix = ".#{workspace_domain}"
    return unless request.host.end_with?(suffix)
    return unless authenticated? && current_organization

    requested = request.host.delete_suffix(suffix)
    return if requested == current_organization.subdomain

    redirect_to "#{request.protocol}#{current_organization.subdomain}#{suffix}#{request.fullpath}",
                allow_other_host: true
  end

  def user_not_authorized
    redirect_to root_path, alert: "You are not authorized to perform this action."
  end

  def skip_pundit?
    false
  end

  def current_organization
    ActsAsTenant.current_tenant
  end
  helper_method :current_organization

  def pagy_meta(pagy)
    {
      current_page: pagy.page,
      total_pages: pagy.pages,
      total_count: pagy.count,
      per_page: pagy.limit,
    }
  end

  def build_notifications
    scores = ResumeScore.where(user: current_user)
                        .where(created_at: 7.days.ago..)
                        .order(created_at: :desc)
                        .limit(10)
                        .includes(:resume)

    scores.map do |score|
      {
        id: score.id,
        type: score.status == "error" ? "error" : "score",
        status: score.status,
        message: notification_message(score),
        score_id: score.id,
        overall_score: score.overall_score,
        grade: score.grade,
        created_at: score.created_at.iso8601,
      }
    end
  end

  def notification_message(score)
    filename = score.resume&.filename || "Resume"
    case score.status
    when "completed"
      "#{filename} scored #{score.overall_score}% (#{score.grade})"
    when "error"
      "Analysis failed for #{filename}"
    when "analyzing", "queued"
      "Analyzing #{filename}..."
    end
  end

  def serialize_plan_limits(limits)
    limits.transform_values { |v| v == Float::INFINITY ? -1 : v }
  end

  def append_info_to_payload(payload)
    super
    payload[:user_id] = current_user&.id
    payload[:organization_id] = current_organization&.id
    payload[:request_id] = request.request_id
  end
end
