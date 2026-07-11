export * from "./types.js";
export * from "./file-io.js";
export * from "./file.js";
export * from "./schema.js";
export * from "./pg.js";
export * from "./content-hash.js";
export * from "./db-ops.js";
export * from "./content.js";
export * from "./content-import.js";
export * from "./queue.js";

import { FileProgressStore } from "./file.js";
import { PgProgressStore } from "./pg.js";
import type { ProgressStore } from "./types.js";

/**
 * Build the ProgressStore selected by the environment.
 *
 * - STORE=file (default): FileProgressStore over PROGRESS_DIR (default ".progress").
 *   Zero runtime dependencies — the local, zero-setup path.
 * - STORE=pg: PgProgressStore over DATABASE_URL (required). Only this branch
 *   ever constructs the pg-backed store, which dynamically imports `pg`.
 */
export function createStore(): ProgressStore {
  const kind = process.env.STORE ?? "file";
  if (kind === "pg") {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("STORE=pg requires DATABASE_URL to be set (e.g. postgres://user:pass@host:5432/db).");
    }
    return new PgProgressStore(url);
  }
  if (kind !== "file") {
    throw new Error(`Unknown STORE="${kind}" (expected "file" or "pg").`);
  }
  return new FileProgressStore(process.env.PROGRESS_DIR ?? ".progress");
}
