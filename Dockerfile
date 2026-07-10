# syntax=docker/dockerfile:1
# check=error=true

# Production Dockerfile for ResumeAI Pro
# Optimized for ARM64 (Mac Mini M4 Pro) with Node.js for Vite asset compilation
#
# Build:  docker build -t resumeai-pro .
# Run:    docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value> --name resumeai-pro resumeai-pro

ARG RUBY_VERSION=3.4.8
ARG NODE_VERSION=22

# === Base stage ===
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

WORKDIR /rails

# Install base packages (runtime dependencies)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl libjemalloc2 libvips postgresql-client \
      poppler-utils tesseract-ocr && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test" \
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"

# === Build stage ===
FROM base AS build

ARG NODE_VERSION

# Install build dependencies + Node.js
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git libpq-dev libyaml-dev pkg-config && \
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install --no-install-recommends -y nodejs && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install Ruby gems
COPY vendor/* ./vendor/
COPY Gemfile Gemfile.lock ./

RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile -j 1 --gemfile

# Install Node.js dependencies
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile -j 1 app/ lib/

# Build Vite assets and precompile Rails assets
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

# Remove node_modules after asset compilation (not needed at runtime)
RUN rm -rf node_modules

# === Final stage ===
FROM base

# Non-root user for security. Active Storage (disk service) and the logger
# need writable dirs that .dockerignore keeps out of the build context —
# create them as root before dropping privileges.
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    mkdir -p /rails/storage /rails/log /rails/tmp && \
    chown -R rails:rails /rails/storage /rails/log /rails/tmp
USER 1000:1000

# Copy built artifacts: gems, application
COPY --chown=rails:rails --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --chown=rails:rails --from=build /rails /rails

# Entrypoint prepares the database
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster (HTTP/2 + asset compression)
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
