# syntax=docker/dockerfile:1
#
# Sandbox tier (Phase 6 hosting) — the isolated code-execution service (DESIGN §9).
#
# This is the ONLY tier that runs untrusted, user-submitted code. It touches no
# database and no secrets: it accepts { solutionCode, testCode } over HTTP, runs
# it, and returns a RunResult (services/sandbox/server.ts). Everything that makes
# it *safe* is applied by the runtime/orchestrator, not by this Dockerfile — this
# image is only the application layer. The deploy MUST additionally enforce:
#
#   * Kernel isolation: run under gVisor (runsc) or Firecracker microVM, never a
#     plain shared-kernel container, so a sandbox escape cannot reach the host.
#   * No network egress: attach to an isolated network with NO route out (deny
#     all egress); the service needs no outbound connectivity.
#   * Dropped capabilities: --cap-drop=ALL, --security-opt no-new-privileges,
#     non-root user (enforced below), and a seccomp profile.
#   * Read-only + ephemeral FS: --read-only root with only a small tmpfs mount for
#     scratch; nothing persists between requests.
#   * Resource limits: CPU, memory, PID, and wall-clock caps (the service also
#     enforces a per-run timeoutMs) so a hostile submission cannot exhaust the host.
#
# NOTE: authored for Phase 6; NOT built in this environment (no registry egress).

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4500

# The sandbox depends on @job-prep/sandbox (raw .ts) and runs under tsx.
COPY package.json package-lock.json ./
COPY web/package.json ./web/package.json
COPY packages ./packages
RUN npm ci

COPY tsconfig.base.json ./
COPY services ./services

# Non-root. Combined with the orchestrator's --cap-drop=ALL / read-only rootfs /
# gVisor runtime, this process has the minimum privilege needed to exec code.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs sandbox \
 && chown -R sandbox:nodejs /app
USER sandbox

EXPOSE 4500

# GET /health for the compose healthcheck; POST /run to execute a submission.
CMD ["npm", "run", "sandbox-service"]
