# ResumeAI Pro

Production-grade SaaS platform for AI-powered resume scoring. Upload resumes, define job descriptions, and get detailed scoring analysis powered by local LLMs via Ollama.

## Stack

- **Backend:** Ruby on Rails 8.1, PostgreSQL 17 (pgvector), Solid Queue/Cache/Cable
- **Frontend:** React 19, TypeScript, Inertia.js, Tailwind CSS 4, Framer Motion
- **AI:** Ollama (qwen2.5:3b / llama3.2:3b), nomic-embed-text for embeddings
- **Billing:** Stripe (optional, dev mode works without it)
- **Deployment:** Docker, Kamal 2, GitHub Actions CI/CD

## Prerequisites

- Ruby 3.4+
- Node.js 22+ with npm
- PostgreSQL 17 with pgvector extension
- Ollama with models: `qwen2.5:3b`, `nomic-embed-text`
- poppler (for PDF parsing)
- tesseract (optional, OCR fallback)

## Quick Start

```bash
# Clone and install dependencies
git clone <repo-url> && cd resumeai-pro
bundle install
npm install

# Setup databases
bin/rails db:create db:migrate

# Seed demo data (160 skills, demo org with sample resumes/scores)
bin/rails db:seed

# Start the server (port 3100)
bin/dev
```

Login at http://localhost:3100 with:
- **Admin:** admin@demo.com / demo1234
- **Recruiter:** recruiter@demo.com / demo1234
- **Candidate:** candidate@demo.com / demo1234

## Architecture

```
app/
  controllers/        # Rails controllers (Inertia responses)
  models/             # ActiveRecord models with acts_as_tenant
  services/           # Business logic (scoring engine, parsers, Stripe)
  jobs/               # Async jobs (parsing, scoring, webhooks)
  policies/           # Pundit authorization policies
  mailers/            # Invitation emails
  javascript/
    components/       # React UI components (ui/, score/)
    pages/            # Inertia page components
    layouts/          # Authenticated/Guest layouts
    hooks/            # Custom React hooks
    lib/              # Utilities
    types/            # TypeScript interfaces
```

### Multi-tenancy

Organizations are isolated via `acts_as_tenant`. In development/test, tenancy is set from the current user's organization. In production, it uses subdomain-based routing.

### Scoring Pipeline

1. Resume uploaded → `ResumeParsingJob` extracts text + generates embedding
2. Score requested → `ScoringJob` runs 6-dimension LLM analysis
3. Results displayed in animated dashboard with radar chart, keyword analysis, recommendations

### Plans & Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Resumes | 5 | 100 | Unlimited |
| Job Descriptions | 3 | 50 | Unlimited |
| Monthly Analyses | 10 | 200 | Unlimited |
| Team Members | 2 | 5 | 25 |

## Testing

```bash
# Ruby tests (466 examples)
bundle exec rspec

# JavaScript tests (54 tests)
npm test

# With coverage report
COVERAGE=1 bundle exec rspec

# TypeScript check
npx tsc --noEmit

# Security scan
bundle exec brakeman -i config/brakeman.ignore
```

## Key Commands

```bash
bin/dev                    # Start dev server (Rails + Vite)
bin/rails db:seed          # Load demo data
bin/rails console          # Rails console
bin/jobs                   # Start Solid Queue worker
```

## Environment Variables

See `.env.example` for all configurable options. The app runs in full demo mode without any external services configured (Stripe, Sentry are optional).

## Deployment

See `docs/DEPLOY.md` for Kamal 2 deployment guide.

## License

Proprietary. All rights reserved.
