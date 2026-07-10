# Architecture

## System overview

ResumeAI Pro is a Rails 8 monolith with an Inertia.js/React 19 front end —
one deployable unit, server-driven routing, SPA feel without an API layer.
AI scoring runs on a local Ollama runtime; documents are parsed with poppler
(PDF) and tesseract (OCR fallback).

```
                    ┌────────────────── EC2 portfolio-host ──────────────────┐
                    │                                                        │
 Internet ─ 443 ─► Caddy ── resume.….dev ──► Rails 8 + Inertia/React (:80)   │
                    │                          │  Puma + Solid Queue in-proc │
                    │                          ├─► PostgreSQL 17 + pgvector  │
                    │                          │   primary/cache/queue/cable │
                    │                          └─► Ollama (qwen2.5, nomic)   │
                    └────────────────────────────────────────────────────────┘
```

## Key decisions

| Decision | Rationale |
|---|---|
| Inertia.js over a separate SPA + API | One codebase, one deploy, server-side auth; React DX where it matters (interactive scoring UI) without CORS/token plumbing. |
| Vite-managed assets, precompiled at image build | Production images serve static bundles; the dev-only `/vite-dev` middleware never runs in production. |
| Solid Queue inside Puma | Scoring jobs are demo-scale; saves a worker container on the 2GB host. `SOLID_QUEUE_IN_PUMA=false` + `bin/jobs` service is the scale-out path. |
| Solid Cache on a dedicated `cache` database | Rails 8 default four-DB layout (primary/cache/queue/cable), role `resumeai_pro`. |
| Ollama models env-driven | `OLLAMA_MODEL` / `OLLAMA_FAST_MODEL` / `OLLAMA_EMBED_MODEL`; host-size upgrades only change env. |
| PDF pipeline: poppler first, tesseract OCR fallback | Text extraction quality with a fallback for scanned resumes. |

## Scoring flow

1. Resume upload → parsed (poppler/tesseract) → chunked → embedded (nomic-embed-text → pgvector).
2. Job description defined → embedded → similarity + rubric prompts assembled.
3. Ollama generation scores per-criterion; results persist with full breakdown; PDF export renders server-side.

## Production topology

Container `portfolio-resumeai` (image ECR `portfolio/resumeai`, arm64) on
`/opt/portfolio` compose shared with the other portfolio apps — see
[portfolio-platform](https://github.com/sathwiksang/portfolio-platform).
TLS/compression at Caddy; Rails `assume_ssl`/`force_ssl`.
