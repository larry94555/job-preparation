#!/usr/bin/env node
// Minimal, dependency-free secrets loader.
//
// Secrets (LLAMA_API_KEY, AUTH_SECRET, DATABASE_URL, …) live in ONE of two places:
//   • Locally: a gitignored `secrets/secrets.env` file (KEY=value, # comments).
//   • Outside GitHub: real environment variables (your shell, CI secrets, the
//     Oracle Cloud instance, a secret manager).
//
// This loader reads the local file and copies each pair into process.env — but
// NEVER overrides a variable that is already set. So the same code works both
// ways, and externally-provided secrets always win over the local file.
//
// Two ways to use it:
//   • Preload before a tool (no output):
//       node --import ./utils/load-secrets.mjs your-script.mjs
//     (the npm `eval-gate` / `worker` scripts already do this)
//   • Check what it would load (prints a masked summary):
//       node utils/load-secrets.mjs

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Parse a KEY=value/.env-style file into pairs (ignoring blanks/comments). */
function parse(text) {
  const pairs = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    pairs.push([key, val]);
  }
  return pairs;
}

/**
 * Load secrets from `file` (default `secrets/secrets.env`, override with
 * SECRETS_FILE) into process.env without overriding existing values.
 * Returns { found, path, loaded, skipped }.
 */
export function loadSecrets(file = process.env.SECRETS_FILE ?? "secrets/secrets.env") {
  const path = resolve(file);
  if (!existsSync(path)) return { found: false, path, loaded: [], skipped: [] };
  const loaded = [];
  const skipped = [];
  for (const [key, val] of parse(readFileSync(path, "utf8"))) {
    if (process.env[key] === undefined) {
      process.env[key] = val;
      loaded.push(key);
    } else {
      skipped.push(key); // already set in the environment — external wins
    }
  }
  return { found: true, path, loaded, skipped };
}

// Always load on import (this is the preload entry point).
const result = loadSecrets();

// When run directly (`node utils/load-secrets.mjs`), print a masked summary.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (!result.found) {
    console.log(`No secrets file at ${result.path} — using ambient environment only.`);
  } else {
    console.log(`Secrets file: ${result.path}`);
    console.log(`  loaded into env: ${result.loaded.join(", ") || "(none)"}`);
    if (result.skipped.length) {
      console.log(`  kept from env (not overridden): ${result.skipped.join(", ")}`);
    }
  }
}
