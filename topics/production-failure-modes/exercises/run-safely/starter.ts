export interface SafeOptions<T> {
  guards: Array<(v: T) => boolean>;
  maxAttempts: number;
  fallback: T;
}
export interface SafeResult<T> {
  ok: boolean;
  value: T;
  attempts: number;
}

/**
 * TODO: call produce() up to maxAttempts times. Return the first output that passes ALL guards as
 * { ok:true, value, attempts }. If none pass within the budget, return
 * { ok:false, value:fallback, attempts:maxAttempts }. The retry MUST be bounded by maxAttempts.
 */
export function runSafely<T>(produce: () => T, opts: SafeOptions<T>): SafeResult<T> {
  throw new Error("not implemented");
}
