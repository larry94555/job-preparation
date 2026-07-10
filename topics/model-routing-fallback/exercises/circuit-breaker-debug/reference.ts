// Reference fix — the counter must only be reset on SUCCESS, not at the start of
// every record() call, so consecutive failures can accumulate to the threshold.
// (Kept out of the repo's starter; used only to sandbox-verify the exercise.)
export class CircuitBreaker {
  private threshold: number;
  private consecutiveFailures: number;

  constructor(threshold: number) {
    this.threshold = threshold;
    this.consecutiveFailures = 0;
  }

  record(success: boolean): void {
    if (success) {
      // A success clears the streak of consecutive failures.
      this.consecutiveFailures = 0;
    } else {
      // Each consecutive failure adds to the streak.
      this.consecutiveFailures += 1;
    }
  }

  isOpen(): boolean {
    return this.consecutiveFailures >= this.threshold;
  }
}
