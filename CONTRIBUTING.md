# Contributing to ResumeAI Pro

## Development Setup

```bash
# Install dependencies
bundle install
npm install

# Create and migrate databases
bin/rails db:create db:migrate

# Seed demo data
bin/rails db:seed

# Start dev server (port 3100)
bin/dev
```

## Code Standards

### Ruby
- Follow `rubocop-rails-omakase` style (run `bundle exec rubocop`)
- Models use `acts_as_tenant(:organization)` for multi-tenancy
- Authorization via Pundit policies
- Controllers return Inertia responses (`render inertia: "Page/Name"`)
- Services in `app/services/` for business logic
- Async work via `ApplicationJob` subclasses

### TypeScript/React
- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`)
- Components in `app/javascript/components/` with barrel exports
- Pages in `app/javascript/pages/` matching Inertia routes
- Shared types in `app/javascript/types/index.ts`
- Path aliases: `@/`, `@components/`, `@pages/`, `@lib/`, `@hooks/`

### Testing
- RSpec for Ruby (request specs, model specs, policy specs, job specs)
- Vitest for JavaScript (component and utility tests)
- Factories with FactoryBot (no fixtures)
- Authentication helper: `sign_in(user)` in request specs
- Bullet gem raises on N+1 queries in test environment

## Pull Request Process

1. Create a feature branch from `main`
2. Write tests for new functionality
3. Ensure all checks pass:
   ```bash
   bundle exec rspec            # Ruby tests
   npm test                     # JS tests
   npx tsc --noEmit             # TypeScript check
   bundle exec brakeman -i config/brakeman.ignore  # Security
   ```
4. Open a PR with a clear description
5. Address review feedback
