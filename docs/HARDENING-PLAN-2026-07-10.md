# ResumeAI Pro — Hardening & Release Plan (2026-07-10)

Driven by `AUDIT-2026-07-10.md`. Principle: **tests first** — every fix
lands with a spec that fails before it and passes after. UI stays as-is
(behavior/limits change, not layout). Ship in small, independently
deployable commits; full suite + RuboCop + brakeman gate each one.

## Order of work (by risk, then by user-visible value)

### Phase 1 — Security-critical (do first, one commit each)
1. **C1 cross-tenant users.** Spec: admin of org A gets 404 on org B's
   user show/edit/update/destroy, and `/admin/users` lists only org A.
   Fix: scope `set_user`/queries to `current_organization.users`; rewrite
   `UserPolicy` (+ `Scope`) to compare `organization_id`.
2. **C2 /admin/jobs auth.** Spec: request as anonymous → redirect to login;
   as candidate → denied; as admin → 200. Fix: authenticated admin-only
   route constraint around the Mission Control mount.
3. **H1 password change.** Spec: wrong/blank current password → rejected,
   password unchanged; correct → changed. Fix: verify `current_password`.
4. **H2 billing self-upgrade.** Spec: with Stripe disabled, POST upgrade
   does not change plan and shows a "billing not enabled" notice (unless
   `DEMO_BILLING=1`). Fix: gate the dev-switch; default off in production.

### Phase 2 — Reliability / trust
5. **H3 mailer resilience.** Spec: mailer transport failure does not create
   a `FailedExecution` and does not 500 the request; copy-link always
   present. Fix: rescue delivery in the mailer path (log + no-op) OR wire a
   real transport if credentials are provided via ENV. Keep copy-link primary.
6. **M2 stuck-analysis reaper.** Spec: a score `analyzing` older than the
   threshold with no live job → marked `error` by the reaper. Fix: recurring
   Solid Queue job; register in `config/recurring.yml`.
7. **M3 enterprise usage display.** Spec: enterprise serializes limit as
   "unlimited" sentinel, dashboard shows Unlimited. Fix: serialize effective
   limit from `plan_limits`.

### Phase 3 — Hardening polish
8. **M1 enforce CSP** in production (report-only off). Spec: production
   config has report_only false; smoke that pages still render.
9. **L2 reserved subdomains.** Spec: `www/api/admin/app/resume` etc. rejected
   at registration and settings. Fix: reserved-word validation on
   `Organization#subdomain`.
10. **M4** — document open-registration choice in SECURITY.md (+ optional
    email-verification stub, decision deferred to owner).

### Phase 4 — Feature depth ("next level", UI unchanged)
Only after Phase 1–3 are green and deployed:
- **F1 Re-run / retry a failed or stuck score** from the score show page
  (button already fits the existing UI; wires to a `ScoringJob` re-enqueue).
- **F2 PDF/report export** of a completed score (if not already present) —
  server-rendered PDF via existing print styles.
- **F3 Real analytics on the dashboard** — trend of scores over time and
  per-criterion averages, from existing data (no schema change).
- **F4 Bulk analysis** correctness pass (multiple resumes vs one JD) with a
  progress view driven by existing statuses.
Each F-item: audit its current live state, spec it, implement, deploy.
(Scope of F2–F4 confirmed against the live feature matrix before building.)

## Production data cleanup (Phase 5, after Phase 1 deploys)
- Purge the 9 probe orgs and the 3 probe resumes/JDs/scores.
- Keep the owner's real org(s); reset `sathwiktest` off the free-Enterprise
  plan (H2) unless the owner wants it kept.
- Clear the 1 stuck score and the 2 failed mailer jobs.
- Run via a one-off, tenant-safe rake task reviewed here before execution.

## Release checklist (per deploy)
- [ ] New/updated specs fail before the fix, pass after.
- [ ] `bundle exec rspec` fully green.
- [ ] `rubocop` + `brakeman` clean (brakeman is in CI already).
- [ ] Deploy via the repo's pipeline (CI → image → SSM roll → verify).
- [ ] Live re-verify the specific flow with Playwright.
- [ ] No new `SolidQueue::FailedExecution`; no stuck scores.

## Non-goals
- No visual redesign (UI stays).
- No paid Stripe integration in this pass (billing is gated/labeled demo).
- Ekklesia and the other apps are untouched.

## Test strategy
- Request specs for every controller action touched, asserting **both**
  the allowed and the denied path (the cross-tenant/auth“negative” case is
  mandatory — its absence is what let C1 ship).
- Job specs simulate Ollama-down and unexpected-exception paths.
- Policy specs for `UserPolicy` incl. the `Scope`.
- Keep the existing 477-example suite green throughout.
