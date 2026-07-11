/**
 * Idempotent / retry-safe tool execution.
 *
 * A harness may retry a tool call after a transient failure. To stay retry-safe,
 * a tool keyed by an idempotency `key` must run its side-effecting work at most
 * once: the first call for a key runs `run()` and records the result; any later
 * call with the same key returns the recorded result WITHOUT calling `run` again.
 *
 * Implement `runIdempotent(key, run, done)`:
 *   - If `done` already has `key`, return the cached result and do NOT call `run`.
 *   - Otherwise call `run()` exactly once, store its result under `key` in `done`,
 *     and return it.
 */
export function runIdempotent(key: string, run: () => string, done: Map<string, string>): string {
  throw new Error("not implemented");
}
