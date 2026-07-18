# syntax=docker/dockerfile:1
#
# Web tier (Phase 6 hosting) — the Next.js app.
#
# Multi-stage build producing a small runtime image from Next's "standalone"
# output (see `output: "standalone"` in web/next.config.mjs). The standalone
# tracer copies only the server files + the exact node_modules the server needs,
# so the final stage never carries the full monorepo install.
#
# NOTE: authored for Phase 6; NOT built in this environment (no registry egress).
#       Build/push happens in .github/workflows/deploy.yml against a real runner.

# ---- deps + build -----------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Install the whole workspace (root + packages/* + web) so Next can transpile the
# raw-TS `@job-prep/*` packages. Copy manifests first for layer caching.
COPY package.json package-lock.json ./
COPY web/package.json ./web/package.json
COPY packages ./packages
RUN npm ci

# Bring in the rest of the sources needed to build the web app.
COPY tsconfig.base.json ./
COPY web ./web
COPY topics ./topics

# Produce web/.next/standalone (server.js + traced node_modules) and static assets.
RUN npm run web:build

# ---- runtime ----------------------------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as an unprivileged user, never root.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone server + its traced deps. For a monorepo the tracer roots the tree
# at the repo root, so `web/server.js` lives under standalone/web/.
COPY --from=build --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/web/.next/static ./web/.next/static

# Lesson content (topic.yaml / sections / lessons / questions / …). The lesson
# runner reads material Markdown from disk at runtime (packages/lesson/build.ts),
# and Next's standalone tracer does NOT capture those dynamic file reads — so copy
# the topics tree in explicitly. The app serves content from here via CONTENT=file
# + TOPICS_DIR=/app/topics (see docker-compose.prod.yml).
COPY --chown=nextjs:nodejs topics ./topics

# Grader model config, read at runtime by the /models page + evaluator
# (MODEL_CONFIG_PATH=/app/model_configuration.yaml). Like topics/, the standalone
# tracer doesn't capture this disk read, so copy it in explicitly — without it the
# /models page shows "No valid model_configuration.yaml was found".
COPY --chown=nextjs:nodejs model_configuration.yaml ./model_configuration.yaml

USER nextjs
EXPOSE 3000

# The standalone entrypoint. STORE=pg / CONTENT=db / QUEUE=db / SANDBOX=http and
# DATABASE_URL / AUTH_SECRET / SANDBOX_URL are supplied by the orchestrator
# (see docker-compose.prod.yml).
CMD ["node", "web/server.js"]
