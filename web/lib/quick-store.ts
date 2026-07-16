// Client-side (localStorage) state for Quick Assessments — public and
// anonymous-friendly, so no server store is needed. The server only grades
// individual choices (see gradeQuickChoice); order, index, and tallies live
// here in the browser. Keyed per (topic, subtopic|main).

export interface QAResult {
  /** Distinct wrong option texts already tried on this question. */
  wrongTried: string[];
  solved: boolean;
}
export interface QAState {
  seed: number;
  /** Question ids in this attempt's randomized order. */
  order: string[];
  /** Current position; >= order.length means the attempt is finished. */
  index: number;
  results: Record<string, QAResult>;
}

const keyOf = (topic: string, section?: string | null) => `qa:v1:${topic}:${section || "main"}`;

export function loadQA(topic: string, section?: string | null): QAState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyOf(topic, section));
    return raw ? (JSON.parse(raw) as QAState) : null;
  } catch {
    return null;
  }
}
export function saveQA(topic: string, section: string | null | undefined, s: QAState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(keyOf(topic, section), JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}
export function clearQA(topic: string, section?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keyOf(topic, section));
}
/** Clear a topic's main scope AND every one of its subtopic scopes. */
export function clearTopicQA(topic: string, sectionIds: string[]): void {
  clearQA(topic, null);
  for (const id of sectionIds) clearQA(topic, id);
}

/** Correct = solved; Incorrect = attempted-wrong but not yet solved; Failed
 *  attempts = total distinct wrong choices (monotonic). */
export function tallies(s: QAState): { correct: number; incorrect: number; failed: number } {
  let correct = 0;
  let incorrect = 0;
  let failed = 0;
  for (const qid of s.order) {
    const r = s.results[qid];
    if (!r) continue;
    failed += r.wrongTried.length;
    if (r.solved) correct++;
    else if (r.wrongTried.length > 0) incorrect++;
  }
  return { correct, incorrect, failed };
}

export const isFinished = (s: QAState): boolean => s.index >= s.order.length;

/** True when this scope's failed attempts exceed 10% of its total questions. */
export function failedOver(s: QAState | null, total: number): boolean {
  if (!s || total <= 0) return false;
  return tallies(s).failed > 0.1 * total;
}

// ---- deterministic seeded shuffle (question order + per-question options) ----
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
export function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  const rng = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** Stable per-question option order for a given attempt seed (so a resume shows
 *  the same options in the same places). */
export function optionOrder(options: string[], seed: number, qid: string): string[] {
  return shuffleSeeded(options, (seed ^ hash(qid)) >>> 0);
}
export function newSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}
