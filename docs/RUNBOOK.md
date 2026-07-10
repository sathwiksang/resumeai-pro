# Runbook

## URLs & health

| What | URL |
|---|---|
| App | https://resume.sathwiksangeethamproject.dev |
| Health | https://resume.sathwiksangeethamproject.dev/up |
| Docs page | https://resume.sathwiksangeethamproject.dev/docs |

## Deploy

Push to `main`. Pipeline: RSpec (schema-only test DB) + zeitwerk + RuboCop →
Brakeman/bundler-audit → arm64 image build → ECR → SSM roll → public verify.
Manual: Actions → deploy → Run workflow.
(`docs/DEPLOY.md` describes the legacy Kamal path and is superseded by this pipeline.)

Host access is SSM-only (no SSH):

```bash
aws ssm start-session --target i-0f862e6a8a78d505a
```

## Common operations (on the host, `cd /opt/portfolio`)

```bash
docker logs -f portfolio-resumeai                 # app logs
docker compose exec resumeai-pro bin/rails c      # console
docker compose restart resumeai-pro               # bounce
docker exec portfolio-ollama ollama ps            # is a model loaded?
```

## Databases

`resumeai_pro_production{,_cache,_queue,_cable}`, role `resumeai_pro`, on the
shared Postgres container. Migrations run on deploy (entrypoint `db:prepare`).
Secondary schemas load once with `bin/rails db:schema:load:<name>`
(+`DISABLE_DATABASE_ENVIRONMENT_CHECK=1`); `db/cache_schema.rb` now includes
the Solid Cache table — keep it that way.

## Secrets

Host `.env` from SSM `/portfolio/env`: `RESUMEAI_DB_PASSWORD`,
`RESUMEAI_RAILS_MASTER_KEY`. Rotate in SSM → re-materialize → `up -d resumeai-pro`.

## Failure playbook

| Symptom | First moves |
|---|---|
| Blank page | View source — any `/vite-dev/` reference means a dev image shipped; rebuild via pipeline |
| 500 with `solid_cache_entries` | Cache DB schema missing — see Databases above |
| Scoring stuck | Check Solid Queue in-proc (`docker logs`), then Ollama (`ollama ps`, cold model load ≈15s) |
| Uploads failing | poppler/tesseract are baked into the image; check logs for parse errors vs storage errors |
