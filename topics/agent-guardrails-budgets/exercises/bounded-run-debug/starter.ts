/**
 * DEBUGGING EXERCISE — this bounded runner is BROKEN.
 *
 * `runBounded` drives an agent by calling `step()` once per iteration. `step()`
 * returns `true` when the agent has finished. The whole point of `maxSteps` is to
 * be a HARD budget: the runner must call `step` at most `maxSteps` times, even
 * when the agent never signals completion. It returns how many steps it took.
 *
 * Symptom reported in production: an agent that never returns `true` runs ONE step
 * past its budget — with maxSteps=5 it calls `step` six times and returns 6. That
 * extra iteration blows the step budget the guard was supposed to enforce, and on
 * expensive tool calls it means a runaway spend of one-too-many actions.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - a step that never returns true stops at EXACTLY maxSteps calls,
 *   - a step that returns true early stops early (returns the count when it did),
 *   - the returned count never exceeds maxSteps.
 *
 * Do NOT rewrite the function — make the minimal correct fix.
 */
export function runBounded(step: () => boolean, maxSteps: number): number {
  let steps = 0;
  // BUG: `<=` lets the loop run one iteration too many, so with maxSteps=5 it
  // calls step() six times and returns 6 — one step past the budget.
  while (steps <= maxSteps) {
    steps++;
    if (step()) break;
  }
  return steps;
}
