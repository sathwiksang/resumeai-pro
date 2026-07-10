# Deployment Guide — Kamal 2

## Prerequisites

- Docker installed on deploy target (ARM64 Mac Mini or Linux server)
- Domain with DNS pointing to your server
- GitHub Container Registry (GHCR) access
- PostgreSQL 17 with pgvector on the server
- Ollama running on the server with models pulled

## Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Pull Ollama models
ollama pull qwen2.5:3b
ollama pull nomic-embed-text

# Create data directories
mkdir -p /var/data/resumeai-pro/{postgres,backups}
```

## Configuration

### 1. Set Secrets

Create `.kamal/secrets` on your local machine:

```bash
KAMAL_REGISTRY_PASSWORD=ghp_your_github_token
RAILS_MASTER_KEY=$(cat config/master.key)
RESUMEAI_PRO_DATABASE_PASSWORD=your_secure_password
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENTRY_DSN=https://...@sentry.io/...
```

### 2. Update deploy.yml

Edit `config/deploy.yml`:
- Set `servers.web` and `servers.job` to your server IPs
- Update `registry.server` if not using GHCR
- Update `proxy.host` with your domain

### 3. Deploy

```bash
# First-time setup
kamal setup

# Subsequent deploys
kamal deploy

# Rollback if needed
kamal rollback

# View logs
kamal app logs
kamal app logs -f  # Follow

# Rails console on production
kamal app exec -i 'bin/rails console'

# Run migrations
kamal app exec 'bin/rails db:migrate'

# Load seed data
kamal app exec 'bin/rails db:seed'
```

## Database Backup

Automated backups run daily at 2am via the kartoza/pg-backup accessory configured in `deploy.yml`. Backups are stored at `/var/data/resumeai-pro/backups/`.

To restore:
```bash
kamal accessory exec backup bash
pg_restore -h db -U resumeai_pro -d resumeai_pro_production /backups/latest.dump
```

## SSL

The app uses Kamal's built-in proxy for automatic SSL via Let's Encrypt. Ensure port 80 and 443 are open on your server.

## Monitoring

- **Sentry:** Error tracking (configure SENTRY_DSN)
- **Mission Control Jobs:** `/admin/jobs` (admin-only)
- **Health check:** `GET /up` (excluded from SSL redirect)
- **Application metrics:** `AppMetrics.collect` in Rails console

## CI/CD

GitHub Actions CI runs on every push:
1. **Lint** — RuboCop
2. **Security** — Brakeman + bundler-audit
3. **JS Scan** — npm audit + TypeScript check
4. **Test** — RSpec with PostgreSQL/pgvector service
5. **Deploy** — Kamal deploy on `main` branch (requires all checks pass)
