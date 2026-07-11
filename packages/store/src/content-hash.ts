import { createHash } from "node:crypto";

/**
 * Deterministic JSON serialization: object keys are sorted recursively so the
 * output is independent of insertion order; array order is preserved (it is
 * semantically meaningful). Used to fingerprint content for idempotent imports.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = normalize(obj[key]);
    }
    return out;
  }
  return value;
}

/**
 * SHA-256 hex digest of the stable stringification of `value`. Deterministic
 * regardless of object key order, so re-importing unchanged content produces
 * the same hash and the row can be skipped.
 */
export function contentHash(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}
