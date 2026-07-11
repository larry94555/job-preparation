// Reference fix — divide the passed count by the TOTAL number of results (not
// by the passed count), so failures actually pull the rate down. (Kept out of
// the repo's starter; used only to sandbox-verify the exercise.)
export function passesGate(
  results: { passed: boolean }[],
  threshold: number,
): boolean {
  const passed = results.filter((r) => r.passed);
  // total is the denominator, so a batch full of failures scores a low rate.
  const rate = passed.length / results.length;
  return rate >= threshold;
}
