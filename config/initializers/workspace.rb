# The base domain under which per-organization workspace URLs live, e.g.
# acme.<workspace_domain>. Caddy serves *.<workspace_domain> with on-demand
# TLS and asks GET /subdomains/check?domain=<host> before issuing a cert.
Rails.application.config.x.workspace_domain =
  ENV.fetch("WORKSPACE_DOMAIN", "resume.sathwiksangeethamproject.dev")
