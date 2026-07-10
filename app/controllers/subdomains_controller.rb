# Answers Caddy's on-demand TLS "ask" check: a certificate for
# <sub>.<workspace_domain> is only issued when <sub> is a real organization.
class SubdomainsController < ApplicationController
  allow_unauthenticated_access only: [ :check ]

  def check
    domain = params[:domain].to_s.downcase.chomp(".")
    suffix = ".#{Rails.application.config.x.workspace_domain}"

    if domain.end_with?(suffix) &&
       Organization.exists?(subdomain: domain.delete_suffix(suffix))
      head :ok
    else
      head :not_found
    end
  end

  private

  def skip_pundit?
    true
  end
end
