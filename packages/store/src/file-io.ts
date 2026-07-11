import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Synchronous progress file helpers shared by the local lesson server and the
 * FileProgressStore. Layout: <dir>/<key>.json holding pretty-printed JSON.
 * None of these throw on a missing directory.
 */

// Monotonic suffix so concurrent temp files never collide within a process.
let tmpCounter = 0;

/** Read and parse <dir>/<key>.json, or return null if it does not exist / is unreadable. */
export function readProgress(dir: string, key: string): unknown | null {
  const file = join(dir, `${key}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Write data as pretty JSON to <dir>/<key>.json, creating <dir> (recursively) if
 * needed. The write is ATOMIC: content goes to a unique temp file which is then
 * renamed over the target. `rename(2)` (libuv uses MOVEFILE_REPLACE_EXISTING on
 * Windows) replaces the file in a single step, so a concurrent reader — or a
 * crash mid-write — never observes a truncated/half-written file that would fail
 * to parse and silently reset a user's progress to null.
 */
export function writeProgress(dir: string, key: string, data: unknown): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const target = join(dir, `${key}.json`);
  const tmp = join(dir, `.${key}.${process.pid}.${tmpCounter++}.tmp`);
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, target);
}

/** List the <key> basenames of the *.json files present in dir (empty if dir is missing). */
export function listKeys(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length));
}
