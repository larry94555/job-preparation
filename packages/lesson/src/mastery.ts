import type { ReviewState } from "./review.js";
import type { Band, Playthrough } from "./types.js";

/**
 * Per-learner progress. Note the philosophy (DESIGN §10.3): we track mastery,
 * never attempts or failures. Nothing here counts tries or records a "fail".
 */
export interface Progress {
  seed: number;
  index: number;
  viewedSections: string[]; // sections whose material has been presented
  seenChecks: string[]; // formative checks answered (either way)
  correctChecks: string[]; // formative checks answered correctly at least once
  assessmentBest: Record<string, number>; // sectionId -> best score (0..1)
  review: Record<string, ReviewState>; // questionId -> spaced-repetition state
  cumulativeBest?: number; // best topic-wide cumulative assessment score
  history?: MasteryPoint[]; // mastery-over-time snapshots (retention analytics)
  // Async grading (DESIGN §8): open-ended apply tasks are graded off-request by a
  // worker. We record the in-flight job per question so a reload shows "grading
  // in progress" and the client can resume polling. This is a resume aid, not a
  // score — it never moves mastery.
  pending?: Record<string, { jobId: string; at: number }>;
}

/** A dated snapshot of a topic's mastery — recorded only when it changes. */
export interface MasteryPoint {
  t: number; // epoch ms
  score: number; // mean section band / 4, in [0,1]
  mastered: number; // sections at band 4
  proficient: number; // sections at band >= 3
  sections: number;
}

export function freshProgress(seed: number): Progress {
  return { seed, index: 0, viewedSections: [], seenChecks: [], correctChecks: [], assessmentBest: {}, review: {}, history: [] };
}

/** The friendly, no-red color scale (white → bright green). */
export const BANDS: { band: Band; name: string; color: string }[] = [
  { band: 0, name: "Not started", color: "#FFFFFF" },
  { band: 1, name: "Learning", color: "#D6ECFF" }, // light blue
  { band: 2, name: "Developing", color: "#7FDBCA" }, // turquoise
  { band: 3, name: "Proficient", color: "#B6E8A8" }, // light green
  { band: 4, name: "Mastered", color: "#34C759" }, // bright green
];

export function sectionBand(pt: Playthrough, progress: Progress, sectionId: string): Band {
  const checkIds = pt.steps
    .filter((s): s is Extract<typeof s, { kind: "check" }> => s.kind === "check" && s.sectionId === sectionId)
    .map((s) => s.question.id);
  const best = progress.assessmentBest[sectionId] ?? 0;
  const threshold = pt.sections.find((s) => s.id === sectionId)?.passThreshold ?? 0.7;

  const learning =
    progress.viewedSections.includes(sectionId) || progress.seenChecks.some((id) => checkIds.includes(id));
  const allChecks = checkIds.length > 0 && checkIds.every((id) => progress.correctChecks.includes(id));

  let band: Band = 0;
  if (learning) band = 1;
  if (allChecks) band = 2;
  if (best >= threshold) band = 3;
  if (best >= 0.95) band = 4;
  return band;
}

export interface DashboardEntry {
  id: string;
  title: string;
  band: Band;
  name: string;
  color: string;
}

export function dashboard(pt: Playthrough, progress: Progress): DashboardEntry[] {
  return pt.sections.map((s) => {
    const band = sectionBand(pt, progress, s.id);
    const info = BANDS[band];
    return { id: s.id, title: s.title, band, name: info.name, color: info.color };
  });
}

/** Mastery of a whole topic as one number: mean section band / 4, in [0,1]. */
export function masteryScore(pt: Playthrough, progress: Progress): MasteryPoint {
  const bands = pt.sections.map((s) => sectionBand(pt, progress, s.id));
  const sections = bands.length;
  const avg = sections ? bands.reduce<number>((a, b) => a + b, 0) / sections : 0;
  return {
    t: 0,
    score: avg / 4,
    mastered: bands.filter((b) => b >= 4).length,
    proficient: bands.filter((b) => b >= 3).length,
    sections,
  };
}

/**
 * Append a mastery snapshot iff it changed since the last one (we track mastery,
 * never attempts). Keeps the timeline bounded to the most recent 200 points.
 */
export function recordSnapshot(progress: Progress, pt: Playthrough, now: number): void {
  const hist = progress.history ?? (progress.history = []);
  const snap = { ...masteryScore(pt, progress), t: now };
  const last = hist[hist.length - 1];
  if (!last || last.score !== snap.score || last.proficient !== snap.proficient || last.mastered !== snap.mastered) {
    hist.push(snap);
    if (hist.length > 200) hist.splice(0, hist.length - 200);
  }
}
