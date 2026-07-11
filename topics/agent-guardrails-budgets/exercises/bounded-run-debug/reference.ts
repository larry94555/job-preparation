// Reference fix — the one-character change is `<=` -> `<` so the loop stops
// exactly at the cap: with maxSteps=5 it calls step() at most five times. (Kept
// out of the repo's starter; used only to sandbox-verify the exercise.)
export function runBounded(step: () => boolean, maxSteps: number): number {
  let steps = 0;
  // strict `<` bounds the loop to at most maxSteps iterations.
  while (steps < maxSteps) {
    steps++;
    if (step()) break;
  }
  return steps;
}
