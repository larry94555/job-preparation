#!/usr/bin/env node
// Generate the RANDOM secrets a deploy needs, in copy-paste-ready form:
//   • POSTGRES_PASSWORD — the database password (URL-safe characters only)
//   • DATABASE_URL      — built WITH that password, so the two can never mismatch
//   • AUTH_SECRET       — signs session cookies (same strength as `openssl rand -base64 32`)
//
// These are the values you INVENT — as opposed to keys you copy from a service
// (Resend, Stripe) or from your running llama-server. Run it and paste the block
// into secrets/prod.env, or use --write to fill secrets/prod.env for you (it is
// created from secrets/prod.env.example first if it doesn't exist yet).
//
// Usage:
//   node utils/gen-secrets.mjs             # print the three lines to stdout
//   node utils/gen-secrets.mjs --write     # fill them into secrets/prod.env
//   node utils/gen-secrets.mjs --write --file secrets/prod.env
//
// NOT generated here (you supply these): LLM_API_KEY (see gen-api-key.mjs, and it
// must match your llama-server), RESEND_API_KEY and STRIPE_* (from their
// dashboards), LLM_BASE_URL / AUTH_URL / SUPPORT_EMAIL (your addresses).

import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const optval = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : def;
};
const doWrite = args.includes("--write");
const outFile = optval("--file", "secrets/prod.env");
const templateFile = "secrets/prod.env.example";

// DB identity — must match docker-compose.prod.yml's POSTGRES_USER / POSTGRES_DB
// and the `db` service name.
const DB_USER = "jobprep";
const DB_NAME = "jobprep";
const DB_HOST = "db";
const DB_PORT = "5432";

// URL-safe token (only A–Z a–z 0–9 - _), safe to embed directly in DATABASE_URL.
// Computed from standard base64 rather than the "base64url" encoding, which older
// Node versions (pre-14.18) don't support.
const urlSafe = (buf) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const postgresPassword = urlSafe(randomBytes(24));
const authSecret = randomBytes(32).toString("base64"); // not in a URL — plain base64 is fine
const databaseUrl = `postgres://${DB_USER}:${postgresPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const generated = {
  POSTGRES_PASSWORD: postgresPassword,
  DATABASE_URL: databaseUrl,
  AUTH_SECRET: authSecret,
};

const stillNeeded = [
  "LLM_BASE_URL   = http://<VM-IP>:8080/v1        (where your llama-server listens)",
  "LLM_API_KEY    = your llama-server key         (node utils/gen-api-key.mjs, or your existing key)",
  "AUTH_URL       = http://<VM-IP>:3000           (or https://yourdomain.com later)",
  "RESEND_API_KEY = from the resend.com dashboard (needed to sign in)",
  "SUPPORT_EMAIL, STRIPE_*  = optional            (Help link + donations)",
];

if (!doWrite) {
  process.stdout.write(Object.entries(generated).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
  process.stderr.write("\n# ^ the three RANDOM secrets — paste them into secrets/prod.env\n");
  process.stderr.write("#   (or re-run with --write to fill secrets/prod.env automatically)\n");
  process.stderr.write("# Still to add by hand:\n");
  for (const s of stillNeeded) process.stderr.write(`#   ${s}\n`);
  process.exit(0);
}

// --write: make sure the file exists (seed it from the template), then set the keys.
const path = resolve(outFile);
mkdirSync(dirname(path), { recursive: true });
if (!existsSync(path)) {
  if (existsSync(resolve(templateFile))) {
    copyFileSync(resolve(templateFile), path);
    process.stderr.write(`Created ${outFile} from ${templateFile}.\n`);
  } else {
    writeFileSync(path, "");
  }
}
const lines = readFileSync(path, "utf8").split(/\r?\n/);
for (const [k, v] of Object.entries(generated)) {
  const entry = `${k}=${v}`;
  const idx = lines.findIndex((l) => new RegExp(`^\\s*${k}\\s*=`).test(l));
  if (idx >= 0) lines[idx] = entry;
  else lines.push(entry);
}
while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
writeFileSync(path, lines.join("\n") + "\n");

const mask = (s) => (s.length <= 8 ? "****" : `${s.slice(0, 4)}…${s.slice(-2)}`);
process.stderr.write(`\nWrote the 3 random secrets into ${outFile}:\n`);
process.stderr.write(`  POSTGRES_PASSWORD = ${mask(postgresPassword)}\n`);
process.stderr.write(`  DATABASE_URL      = ${databaseUrl.replace(postgresPassword, mask(postgresPassword))}\n`);
process.stderr.write(`  AUTH_SECRET       = ${mask(authSecret)}\n`);
process.stderr.write("\nNow open the file and add these (they can't be generated):\n");
for (const s of stillNeeded) process.stderr.write(`  ${s}\n`);
