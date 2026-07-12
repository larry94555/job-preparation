# Utilities: API keys & secrets

Two small, dependency-free tools for running the grader against a secured model
host (e.g. a llama.cpp `llama-server` on Oracle Cloud).

## Secrets

Sensitive values (`LLAMA_API_KEY`, `AUTH_SECRET`, `DATABASE_URL`, …) come from
**one of two places**, and you never commit them:

1. **Locally** — a gitignored file `secrets/secrets.env` (`KEY=value`, `#` comments).
2. **Outside GitHub** — real environment variables: your shell, CI/CD secrets,
   the Oracle Cloud instance, or a secret manager.

`utils/load-secrets.mjs` reads the local file and copies each pair into
`process.env` — but **never overrides a value already set**. So the same code
works both ways, and externally-provided secrets always win over the local file.

### Set up the local secrets file

```bash
cp secrets/secrets.env.example secrets/secrets.env   # gitignored — safe to edit
# then fill in values, e.g.  LLAMA_API_KEY=...  LLAMA_BASE_URL=http://165.1.79.248:8080/v1
```

Check what would be loaded (values are not printed, only names):

```bash
npm run secrets:check
#   Secrets file: .../secrets/secrets.env
#     loaded into env: LLAMA_API_KEY, LLAMA_BASE_URL
```

### Which tools load secrets automatically

`npm run eval-gate`, `eval-gate:escalate`, and `worker` preload the file (via
`node --import ./utils/load-secrets.mjs`), so their model calls get
`LLAMA_API_KEY`/`LLAMA_BASE_URL` with no manual `export`.

To preload secrets for **any** other command, prepend the same import:

```bash
node --import ./utils/load-secrets.mjs your-script.mjs
# or process-wide:
NODE_OPTIONS="--import ./utils/load-secrets.mjs" npm run <script>
```

For the Next.js app, put these in `.env`/`.env.local` (Next loads those itself),
or inject them as real env vars on the host.

## API key generator

Generate a strong key for `llama-server --api-key`. The key prints on **stdout
alone** (hints go to stderr), so it is safe to capture.

```bash
npm run gen-api-key                       # print a new key
node utils/gen-api-key.mjs --bytes 48     # more entropy (default 32 bytes)
node utils/gen-api-key.mjs --format hex   # hex instead of base64url
node utils/gen-api-key.mjs --write        # save it as LLAMA_API_KEY in secrets/secrets.env
```

`--write` upserts `LLAMA_API_KEY` in the secrets file (creating it if needed),
so re-running never duplicates the line.

## End-to-end: lock down the Oracle model and grade against it

```bash
# 1) generate a key and save it to the local secrets file
node utils/gen-api-key.mjs --write
#    → also prints:  llama-server ... --api-key "<key>"

# 2) on the Oracle instance, restart the server with that key
#    llama-server -m <model>.gguf --host 0.0.0.0 --port 8080 --api-key "<key>"

# 3) point the grader at it (add to secrets/secrets.env, or export):
#    LLAMA_BASE_URL=http://165.1.79.248:8080/v1

# 4) run an evaluation pass — secrets load automatically
npm run eval-gate
```

If the server is secured but `LLAMA_API_KEY` is missing/wrong, calls get HTTP
401 and the gate reports the skill as un-gradeable (not a silent pass).
