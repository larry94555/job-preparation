export type Verdict = "pass" | "borderline" | "fail";

export interface Aggregated {
  total: number;
  trueCount: number;
  score: number; // 0..1
  gatesPassed: boolean;
  verdict: Verdict;
}

const ORDER: Verdict[] = ["fail", "borderline", "pass"];
function capDown(v: Verdict): Verdict {
  const i = ORDER.indexOf(v);
  return ORDER[Math.max(0, i - 1)];
}

/**
 * Deterministic aggregation of a skill's boolean checks into a score + verdict.
 * The MODEL only answers the small yes/no checks; the ENGINE does the arithmetic
 * here (DESIGN §7).
 *
 * `gates` are check names that must be true; if any gate is false the verdict is
 * capped one level down (pass→borderline, borderline→fail). Defaults to any check
 * whose name contains "correct" (so a wrong technical claim can't earn a pass).
 */
export function aggregateChecks(checks: Record<string, boolean>, gates?: string[]): Aggregated {
  const keys = Object.keys(checks);
  const total = keys.length;
  const trueCount = keys.filter((k) => checks[k] === true).length;
  const score = total ? trueCount / total : 0;

  const gateKeys = gates && gates.length ? gates : keys.filter((k) => /correct/i.test(k));
  const gatesPassed = gateKeys.every((k) => checks[k] === true);

  const base: Verdict = score >= 0.75 ? "pass" : score >= 0.5 ? "borderline" : "fail";
  const verdict = gatesPassed ? base : capDown(base);

  return { total, trueCount, score, gatesPassed, verdict };
}
