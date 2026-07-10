/**
 * DEBUGGING EXERCISE — this circuit breaker is BROKEN.
 *
 * Symptom reported in production: our provider went fully down and stayed down,
 * every call to it failed for minutes — yet the breaker NEVER opened, so we kept
 * hammering the dead provider instead of failing fast to the fallback. `isOpen()`
 * always returns false no matter how many failures pile up in a row.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - `record(false)` accumulates CONSECUTIVE failures,
 *   - `record(true)` resets the consecutive-failure count,
 *   - `isOpen()` becomes true once the count reaches the threshold and the
 *     breaker stays closed while below it.
 *
 * Do NOT rewrite the class — make the minimal correct fix.
 */
export class CircuitBreaker {
  private threshold: number;
  private consecutiveFailures: number;

  constructor(threshold: number) {
    this.threshold = threshold;
    this.consecutiveFailures = 0;
  }

  record(success: boolean): void {
    // BUG: the counter is wiped at the START of every call, so consecutive
    // failures can never accumulate past 1 and the breaker never trips open.
    this.consecutiveFailures = 0;
    if (!success) {
      this.consecutiveFailures += 1;
    }
  }

  isOpen(): boolean {
    return this.consecutiveFailures >= this.threshold;
  }
}
