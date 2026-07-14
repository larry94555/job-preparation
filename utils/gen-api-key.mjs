#!/usr/bin/env node
// Generate a cryptographically-strong API key for a llama.cpp `llama-server`
// (started with `--api-key`). The grader sends it as `Authorization: Bearer …`
// when LLM_API_KEY is set.
//
// Usage:
//   node utils/gen-api-key.mjs                 # print a new key to stdout
//   node utils/gen-api-key.mjs --bytes 48      # more entropy (default 32 bytes)
//   node utils/gen-api-key.mjs --format hex    # hex instead of base64url
//   node utils/gen-api-key.mjs --write         # save as LLM_API_KEY in the secrets file
//   node utils/gen-api-key.mjs --write --file secrets/secrets.env
//
// The key is printed on stdout ALONE, so it is safe to capture:
//   KEY=$(node utils/gen-api-key.mjs)
// All hints go to stderr.

import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const optval = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : def;
};

const bytes = Math.max(16, Number(optval("--bytes", "32")) || 32);
const format = optval("--format", "base64url"); // "base64url" | "hex"
const doWrite = args.includes("--write");
const secretsFile = optval("--file", process.env.SECRETS_FILE ?? "secrets/secrets.env");

const buf = randomBytes(bytes);
const key = format === "hex" ? buf.toString("hex") : buf.toString("base64url");

if (doWrite) {
  const path = resolve(secretsFile);
  mkdirSync(dirname(path), { recursive: true });
  const existing = existsSync(path) ? readFileSync(path, "utf8").split(/\r?\n/) : [];
  const entry = `LLM_API_KEY=${key}`;
  const idx = existing.findIndex((l) => /^\s*LLM_API_KEY\s*=/.test(l));
  if (idx >= 0) existing[idx] = entry;
  else existing.push(entry);
  while (existing.length && existing[existing.length - 1].trim() === "") existing.pop();
  writeFileSync(path, `${existing.join("\n")}\n`);
  process.stderr.write(`Saved LLM_API_KEY to ${path}\n`);
  process.stderr.write(`Now start the server with:  llama-server ... --api-key "${key}"\n`);
} else {
  process.stdout.write(`${key}\n`);
  process.stderr.write("\nTo use this key:\n");
  process.stderr.write(`  1) Start the server locked down:  llama-server ... --api-key "${key}"\n`);
  process.stderr.write(`  2) Give it to the grader via the secrets file:  LLM_API_KEY=${key}\n`);
  process.stderr.write("     (or re-run with --write to save it there automatically)\n");
}
