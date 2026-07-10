# Security posture

## Boundaries

- Host exposes only Caddy's 80/443; admin access is SSM-only (no SSH keys).
- TLS at Caddy (Let's Encrypt); Rails `assume_ssl` + `force_ssl`.
- Single-origin app (Inertia) — no cross-origin API surface at all.

## Application

- Session-based auth (Rails), admin namespace behind authorization.
- Encrypted credentials; `master.key` never committed — `RAILS_MASTER_KEY`
  injected from SSM-backed host env.
- Dedicated Postgres role `resumeai_pro`; blast-radius isolation on the shared instance.
- Sentry error tracking wired (`sentry-rails`).

## Pipeline

- Brakeman + bundler-audit on every push (`security` job) — **informational**
  until findings are triaged, then blocking.
- RSpec + zeitwerk eager-load check gate every deploy.
- Dependabot (bundler, npm, github-actions) weekly.
- OIDC deploys via `portfolio-github-deploy` (ECR `portfolio/*` + SSM to one host; deletes denied).

## Known gaps (uplift backlog)

1. Triage Brakeman/bundler-audit findings → flip to blocking.
2. Rate limiting on login/upload endpoints (rack-attack).
3. Inertia 4.0 deprecation: set `config.always_include_errors_hash`.
4. Storage: uploaded resumes live on the container-local disk volume; move to S3 when multi-host.
