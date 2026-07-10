import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Synchronous progress file helpers shared by the local lesson server and the
 * FileProgressStore. Layout: <dir>/<key>.json holding pretty-printed JSON.
 * None of these throw on a missing directory.
 */

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

/** Write data as pretty JSON to <dir>/<key>.json, creating <dir> (recursively) if needed. */
export function writeProgress(dir: string, key: string, data: unknown): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${key}.json`), JSON.stringify(data, null, 2));
}

/** List the <key> basenames of the *.json files present in dir (empty if dir is missing). */
export function listKeys(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length));
}
