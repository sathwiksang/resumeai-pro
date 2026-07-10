# ResumeAI Pro — Test Report

## Phase 1: Rails 8 Foundation

**Date:** 2026-03-02
**Total Tests:** 141
**Passing:** 141
**Failures:** 0
**Duration:** 0.69 seconds

---

## Test Coverage by Layer

### Model Tests (92 examples)

#### Organization (30 examples)
- **Associations:** has_many users, resumes, job_descriptions, resume_scores (all with dependent: :destroy)
- **Validations:** name presence, subdomain presence + uniqueness + format, plan inclusion, analysis_limit numericality
- **Business Logic:** `can_analyze?` (enterprise unlimited, free/pro respects limits), `increment_analysis_count!`, `reset_monthly_usage!`, `plan_limits` (returns correct limits per tier)
- **Subdomain Format:** Validates lowercase alphanumeric + hyphens, rejects uppercase and spaces

#### User (20 examples)
- **Associations:** belongs_to organization, has_many sessions/resumes/job_descriptions/resume_scores
- **Validations:** email presence + uniqueness (scoped to org) + format, first/last name presence, password length (min 8), secure password
- **Email Normalization:** Downcases and strips whitespace
- **Roles:** Defines enum (candidate: 0, recruiter: 1, admin: 2)
- **Methods:** `full_name` returns "First Last"

#### Session (3 examples)
- **Associations:** belongs_to user
- **Defaults:** Sets ip_address to "0.0.0.0" when nil, preserves provided ip

#### Resume (10 examples)
- **Associations:** belongs_to organization + user, has_many resume_scores, has_one_attached document
- **Validations:** filename presence
- **Enums:** status (pending, parsing, parsed, extracting, ready, error)
- **Scopes:** `by_status` filters correctly, `recent` orders by created_at desc

#### JobDescription (8 examples)
- **Associations:** belongs_to organization + user, has_many resume_scores
- **Validations:** title + description presence
- **Enums:** status (pending, extracting, ready, error)
- **Scopes:** `by_status`, `recent`

#### ResumeScore (13 examples)
- **Associations:** belongs_to organization, resume, job_description, user
- **Validations:** resume_id uniqueness scoped to job_description_id
- **Enums:** status (queued, analyzing, completed, error)
- **Scopes:** `completed` returns only completed scores
- **Grade Calculation:** Correctly maps score ranges to grades A+ through F

#### SkillTaxonomy (8 examples)
- **Validations:** name presence + uniqueness, category inclusion
- **Scopes:** technical, soft, tools, certifications, by_category
- **Methods:** `alias_list` returns array or empty array when nil

---

### Policy Tests (49 examples)

#### ResumePolicy (15 examples)
| Action  | Owner (Candidate) | Other Candidate | Recruiter | Admin |
|---------|:-:|:-:|:-:|:-:|
| show    | PERMIT | DENY | PERMIT | PERMIT |
| create  | PERMIT | PERMIT | PERMIT | PERMIT |
| update  | PERMIT | DENY | DENY | PERMIT |
| destroy | PERMIT | DENY | DENY | PERMIT |
- **Scope:** Candidates see own resumes only; recruiters and admins see all

#### JobDescriptionPolicy (12 examples)
| Action  | Candidate | Owner (Recruiter) | Admin |
|---------|:-:|:-:|:-:|
| show    | PERMIT | PERMIT | PERMIT |
| create  | DENY | PERMIT | PERMIT |
| update  | DENY | PERMIT | PERMIT |
| destroy | DENY | PERMIT | PERMIT |

#### ResumeScorePolicy (13 examples)
| Action  | Owner (Candidate) | Other Candidate | Recruiter | Admin |
|---------|:-:|:-:|:-:|:-:|
| show    | PERMIT | DENY | PERMIT | PERMIT |
| create  | PERMIT (if org can analyze) | - | - | - |
| destroy | DENY | DENY | DENY | PERMIT |
- **Rate Limiting:** Denies creation when org is at analysis limit
- **Scope:** Candidates see own scores; recruiters and admins see all

#### UserPolicy (9 examples)
| Action  | Self | Other User | Admin | Admin (Self) |
|---------|:-:|:-:|:-:|:-:|
| show    | PERMIT | DENY | PERMIT | PERMIT |
| create  | DENY | DENY | PERMIT | - |
| update  | PERMIT | DENY | PERMIT | PERMIT |
| destroy | DENY | DENY | PERMIT | DENY |
- **Admin self-protection:** Admin cannot delete their own account
- **Scope:** Non-admins see only self; admins see all users

---

## Test Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Test Framework | RSpec 7.x | BDD-style test specs |
| Factory Library | FactoryBot | Test data generation with traits |
| Matchers | Shoulda Matchers | Concise validation/association testing |
| Fake Data | Faker | Realistic test data |
| Database | PostgreSQL 17 (test DB) | Transactional fixtures |

## How to Run

```bash
cd resumeai-pro
bundle exec rspec                          # Run all tests
bundle exec rspec --format documentation   # Verbose output
bundle exec rspec spec/models/             # Models only
bundle exec rspec spec/policies/           # Policies only
```
