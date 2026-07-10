/**
 * Redaction at capture time.
 *
 * Before a trace payload is stored, sensitive values must be scrubbed. Implement
 * `redact(obj, sensitiveKeys)` that returns a **deep copy** of `obj` in which,
 * anywhere a plain-object KEY appears in `sensitiveKeys` (case-sensitive exact
 * match), that key's VALUE is replaced with the string "[REDACTED]".
 *
 * Rules:
 *   - Recurse into nested plain objects and into arrays.
 *   - Do NOT mutate the input `obj` (return a fresh structure).
 *   - Non-object primitives (string, number, boolean, null, undefined) pass
 *     through unchanged when they are not the value of a sensitive key.
 *   - Matching is on the KEY name only; a matched key's whole value is redacted
 *     regardless of the value's type.
 */
export function redact(obj: unknown, sensitiveKeys: string[]): unknown {
  throw new Error("not implemented");
}
