/**
 * Stateless, per-user re-orchestration of the existing lesson building blocks.
 *
 * This mirrors what `app/server.ts` does, but instead of holding an in-memory
 * session it loads progress fresh from the ProgressStore on every request and
 * writes it back after each mutation. The topic lives in the URL, not a session.
 *
 * Nothing here is rewritten — it composes the same packages the local runner
 * uses (`@job-prep/store`, `@job-prep/lesson`, `@job-prep/engine`, ...).
 */
import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  gradeMultipleChoice,
  gradeTextInput,
  type LoadedTopic,
  mulberry32,
  prepareQuestion,
  seedFromString,
  shuffle,
} from "@job-prep/engine";
import type { Question } from "@job-prep/schema";
import {
  BANDS,
  buildPlaythrough,
  dashboard,
  freshProgress,
  isDue,
  masteryScore,
  type Playthrough,
  type Progress,
  retentionStats,
  scheduleReview,
} from "@job-prep/lesson";
import { createContentSource, createStore } from "@job-prep/store";

// Curated path order (foundations first); unknown topics sort after, by id.
// Kept in sync with app/server.ts so both runners present the same ordering.
const ORDER = [
  "harness-engineering",
  "context-engineering",
  "structured-output-reliability",
  "function-calling-reliability",
  "agent-guardrails-budgets",
  "model-routing-fallback",
  "rag-architecture",
  "retrieval-evals",
  "eval-methodology",
  "llm-observability",
  "cost-attribution",
  "prompt-vs-semantic-caching",
  "kv-cache-management",
  "prefill-vs-decode-latency",
  "batching-paged-attention-throughput",
  "speculative-decoding-quant-distillation",
  "quantization-formats-quality",
  "safety-engineering",
  "multi-tenant-isolation",
  "adaptation-strategy-selection",
  "inference-stack-tradeoffs",
  "production-failure-modes",
];

// Content is loaded once per server process and cached (it's derived purely
// from the git-tracked topics/ configs). Progress is never cached — it's read
// per request from the store so the app stays stateless.
let lessonsPromise: Promise<LoadedTopic[]> | null = null;

async function allLessons(): Promise<LoadedTopic[]> {
  if (!lessonsPromise) {
    lessonsPromise = (async () => {
      const source = createContentSource();
      const topics = await source.loadTopics();
      return topics
        .filter((t) => t.topic && t.sections.length > 0 && t.issues.length === 0)
        .sort((a, b) => {
          const ra = ORDER.indexOf(a.topic!.id);
          const rb = ORDER.indexOf(b.topic!.id);
          return (
            (ra < 0 ? ORDER.length : ra) - (rb < 0 ? ORDER.length : rb) ||
            a.topic!.id.localeCompare(b.topic!.id)
          );
        });
    })();
  }
  return lessonsPromise;
}

export async function listLessons(): Promise<LoadedTopic[]> {
  return allLessons();
}

export async function findTopic(topicId: string): Promise<LoadedTopic | null> {
  const lessons = await allLessons();
  return lessons.find((t) => t.topic!.id === topicId) ?? null;
}

/** Load progress for a topic, merged over a fresh baseline (seeded by topic id). */
export async function loadProgress(userId: string, topicId: string): Promise<Progress> {
  const seed = seedFromString(topicId);
  const base = freshProgress(seed);
  const store = createStore();
  const saved = await store.get(userId, topicId);
  if (saved && typeof saved === "object") {
    return { ...base, ...(saved as Partial<Progress>) };
  }
  return base;
}

export async function saveProgress(
  userId: string,
  topicId: string,
  progress: Progress,
): Promise<void> {
  const store = createStore();
  await store.set(userId, topicId, progress);
}

/** A topic + its playthrough + this user's progress, clamped to a valid index. */
export interface LessonContext {
  topic: LoadedTopic;
  pt: Playthrough;
  progress: Progress;
}

export async function loadContext(
  userId: string,
  topicId: string,
): Promise<LessonContext | null> {
  const topic = await findTopic(topicId);
  if (!topic) return null;
  const progress = await loadProgress(userId, topicId);
  const pt = buildPlaythrough(topic, progress.seed);
  progress.index = Math.min(progress.index, pt.steps.length);
  return { topic, pt, progress };
}

// ---- sanitized views (answer keys never reach the client) ----------------
export function sanitizeStep(step: Playthrough["steps"][number]) {
  switch (step.kind) {
    case "material":
      return {
        kind: step.kind,
        sectionId: step.sectionId,
        lessonTitle: step.lessonTitle,
        heading: step.heading,
        html: step.html,
      };
    case "check":
      return { kind: step.kind, sectionId: step.sectionId, question: step.view };
    case "apply":
      return { kind: step.kind, sectionId: step.sectionId, question: step.view };
    case "assessment":
      return {
        kind: step.kind,
        sectionId: step.sectionId,
        title: step.title,
        passThreshold: step.passThreshold,
        items: step.items.map((i) => i.view),
      };
  }
}

/** The per-topic state payload — the sanitized current step + progress bands. */
export function stateFor(ctx: LessonContext) {
  const { pt, progress } = ctx;
  const done = progress.index >= pt.steps.length;
  const step = done ? null : pt.steps[progress.index];
  return {
    topic: { id: pt.topicId, title: pt.topicTitle },
    index: progress.index,
    total: pt.steps.length,
    done,
    currentSectionId: step ? (step as { sectionId: string }).sectionId : null,
    step: step ? sanitizeStep(step) : null,
    dashboard: dashboard(pt, progress),
    legend: BANDS,
  };
}

// ---- home hub data --------------------------------------------------------
export async function homeData(userId: string) {
  const lessons = await allLessons();
  const items = await Promise.all(
    lessons.map(async (t) => {
      const id = t.topic!.id;
      const progress = await loadProgress(userId, id);
      const pt = buildPlaythrough(t, progress.seed);
      const index = Math.min(progress.index, pt.steps.length);
      const dash = dashboard(pt, progress);
      const done = index >= pt.steps.length;
      const fullyMastered = dash.length > 0 && dash.every((d) => d.band >= 3);
      const activity =
        index === 0
          ? "Not started"
          : done
            ? "Played through"
            : `In progress — step ${index + 1} of ${pt.steps.length}`;
      return {
        id,
        title: t.topic!.title,
        description: t.topic!.description,
        total: pt.steps.length,
        index,
        done,
        fullyMastered,
        activity,
        dashboard: dash,
      };
    }),
  );
  const cont =
    items.find((i) => i.index < i.total)?.id ??
    items.find((i) => !i.fullyMastered)?.id ??
    items[0]?.id ??
    null;
  const totalSections = items.reduce((n, i) => n + i.dashboard.length, 0);
  const masteredSections = items.reduce(
    (n, i) => n + i.dashboard.filter((d) => d.band >= 3).length,
    0,
  );
  const readinessPct = totalSections ? Math.round((100 * masteredSections) / totalSections) : 0;
  const due = (await reviewCandidates(userId, Date.now())).length;
  return {
    items,
    continueTopic: cont,
    legend: BANDS,
    readinessPct,
    dueCount: due,
    masteredTopics: items.filter((i) => i.fullyMastered).length,
  };
}

// ---- cross-topic progress -------------------------------------------------
/**
 * Load every topic's Progress for this user. Mirrors app/server.ts iterating
 * all lessons; needed for cross-topic review + analytics. Progress is read per
 * request (never cached) so the app stays stateless.
 */
export async function loadAllProgress(
  userId: string,
): Promise<{ topic: LoadedTopic; pt: Playthrough; progress: Progress }[]> {
  const lessons = await allLessons();
  return Promise.all(
    lessons.map(async (topic) => {
      const progress = await loadProgress(userId, topic.topic!.id);
      const pt = buildPlaythrough(topic, progress.seed);
      progress.index = Math.min(progress.index, pt.steps.length);
      return { topic, pt, progress };
    }),
  );
}

// ---- practice modes (review / mock / cumulative) --------------------------
// Ports app/server.ts. Each builder is a pure function of (topic content, seed)
// so start and grade derive an identical item set given the same descriptor.
// The descriptor { kind, topic?, now } is returned by start and echoed back on
// grade — this carries the practice set across stateless requests without a
// server session.
export type PracticeKind = "review" | "mock" | "cumulative";

/** Client-safe view of a practice question — never carries the answer key. */
export interface PracticeItemView {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  inputKind?: "text";
}

/** Server-side prepared item: the original question + its randomized params. */
interface PrepItem {
  question: Question;
  params: Record<string, string>;
  view: PracticeItemView;
  topicId: string;
}

const isDeterministic = (q: Question): boolean =>
  q.type === "multiple_choice" || q.type === "text_input";

function prepItem(q: Question, rng: () => number, topicId: string): PrepItem {
  const prepared = prepareQuestion(q, rng);
  const view: PracticeItemView =
    prepared.type === "multiple_choice"
      ? {
          id: q.id,
          type: q.type,
          prompt: prepared.prompt,
          options: prepared.options.map((o) => o.text),
        }
      : { id: q.id, type: q.type, prompt: prepared.prompt, inputKind: "text" };
  const params = prepared.type === "text_input" ? prepared.params : {};
  return { question: q, params, view, topicId };
}

/** Cross-topic formative checks whose SM-2 review state is due now. */
async function reviewCandidates(
  userId: string,
  now: number,
): Promise<{ topicId: string; question: Question }[]> {
  const all = await loadAllProgress(userId);
  const out: { topicId: string; question: Question }[] = [];
  for (const { topic, pt, progress } of all) {
    const seen = new Set<string>();
    for (const step of pt.steps) {
      if (step.kind !== "check") continue;
      const q = step.question;
      if (seen.has(q.id) || !isDeterministic(q)) continue;
      seen.add(q.id);
      const rs = progress.review[q.id];
      if (rs && isDue(rs, now)) out.push({ topicId: topic.topic!.id, question: q });
    }
  }
  return out;
}

async function buildReview(userId: string, now: number, limit = 12): Promise<PrepItem[]> {
  const rng = mulberry32((now >>> 0) ^ 0x9e3779b9);
  const candidates = await reviewCandidates(userId, now);
  return shuffle(candidates, rng)
    .slice(0, limit)
    .map((c) => prepItem(c.question, rng, c.topicId));
}

async function buildMock(topicId: string, now: number, count = 10): Promise<PrepItem[]> {
  const topic = await findTopic(topicId);
  if (!topic) return [];
  const rng = mulberry32((now >>> 0) ^ 0x1234567);
  return shuffle(topic.questions.filter(isDeterministic), rng)
    .slice(0, count)
    .map((q) => prepItem(q, rng, topicId));
}

async function buildCumulative(topicId: string, now: number, count = 10): Promise<PrepItem[]> {
  const topic = await findTopic(topicId);
  if (!topic) return [];
  const rng = mulberry32((now >>> 0) ^ 0x7654321);
  const tags = new Set<string>();
  for (const sec of topic.sections) for (const t of sec.assessment.from_tags) tags.add(t);
  const pool = topic.questions.filter(
    (q) => isDeterministic(q) && q.tags.some((t: string) => tags.has(t)),
  );
  return shuffle(pool, rng)
    .slice(0, count)
    .map((q) => prepItem(q, rng, topicId));
}

/** Rebuild a practice set's server-side items from its descriptor. */
async function buildPractice(
  userId: string,
  kind: PracticeKind,
  topicId: string | undefined,
  now: number,
): Promise<PrepItem[]> {
  if (kind === "review") return buildReview(userId, now);
  if (!topicId) return [];
  if (kind === "mock") return buildMock(topicId, now);
  return buildCumulative(topicId, now);
}

export const MOCK_TIME_LIMIT_SEC = 600;

/** A compact descriptor the client echoes back to grade the same set. */
export interface PracticeDescriptor {
  kind: PracticeKind;
  topic?: string;
  now: number;
}

export interface PracticeStartResult {
  empty?: boolean;
  kind: PracticeKind;
  topic?: string;
  title: string;
  timeLimitSec?: number;
  items: PracticeItemView[];
  descriptor: PracticeDescriptor;
}

/** Start a practice set: builds items, returns sanitized views + descriptor. */
export async function startPractice(
  userId: string,
  kind: PracticeKind,
  topicId?: string,
): Promise<PracticeStartResult | { error: string }> {
  const now = Date.now();
  if (kind === "review") {
    const items = await buildReview(userId, now);
    if (items.length === 0) {
      return { empty: true, kind, title: "Review", items: [], descriptor: { kind, now } };
    }
    return {
      kind,
      title: "Review — due & weak items",
      items: items.map((i) => i.view),
      descriptor: { kind, now },
    };
  }
  const topic = topicId ? await findTopic(topicId) : null;
  if (!topic) return { error: "unknown topic" };
  const items = await buildPractice(userId, kind, topicId, now);
  if (kind === "mock") {
    return {
      kind,
      topic: topicId,
      title: `Mock interview — ${topic.topic!.title}`,
      timeLimitSec: MOCK_TIME_LIMIT_SEC,
      items: items.map((i) => i.view),
      descriptor: { kind, topic: topicId, now },
    };
  }
  return {
    kind,
    topic: topicId,
    title: `Cumulative assessment — ${topic.topic!.title}`,
    items: items.map((i) => i.view),
    descriptor: { kind, topic: topicId, now },
  };
}

export interface PracticeGradeResult {
  kind: PracticeKind;
  correct: number;
  total: number;
  score: number;
  passed: boolean;
  review: { id: string; correct: boolean; topicId: string }[];
}

/**
 * Grade an in-flight practice set. Re-derives the same server-side items from
 * the echoed descriptor (deterministic seed), grades each answer, updates SM-2
 * state, and persists to the owning topic's Progress. For cumulative, tracks
 * cumulativeBest. Answer keys never leave the server.
 */
export async function gradePractice(
  userId: string,
  descriptor: PracticeDescriptor,
  answers: Record<string, string>,
): Promise<PracticeGradeResult | { error: string }> {
  const { kind, topic: topicId, now } = descriptor;
  const items = await buildPractice(userId, kind, topicId, now);
  if (items.length === 0) return { error: "no active practice" };

  const gradedNow = Date.now();
  // Load each involved topic's Progress once so SM-2 updates accumulate.
  const touched = new Map<string, Progress>();
  const progressFor = async (id: string): Promise<Progress> => {
    let p = touched.get(id);
    if (!p) {
      p = await loadProgress(userId, id);
      touched.set(id, p);
    }
    return p;
  };

  let correct = 0;
  const review: { id: string; correct: boolean; topicId: string }[] = [];
  for (const it of items) {
    const a = String(answers[it.question.id] ?? "");
    const ok =
      it.question.type === "multiple_choice"
        ? gradeMultipleChoice(it.question, a)
        : it.question.type === "text_input"
          ? gradeTextInput(it.question, a, it.params)
          : false;
    if (ok) correct++;
    const p = await progressFor(it.topicId);
    p.review[it.question.id] = scheduleReview(p.review[it.question.id], ok, gradedNow);
    review.push({ id: it.question.id, correct: ok, topicId: it.topicId });
  }

  const total = items.length;
  const score = total ? correct / total : 0;

  if (kind === "cumulative" && topicId) {
    const p = await progressFor(topicId);
    p.cumulativeBest = Math.max(p.cumulativeBest ?? 0, score);
  }

  // Persist every touched topic's Progress.
  for (const [id, p] of touched) await saveProgress(userId, id, p);

  return { kind, correct, total, score, passed: score >= 0.8, review };
}

// ---- analytics ------------------------------------------------------------
/**
 * Port of app/server.ts analyticsData(): current mastery, cross-topic mastery
 * trend, SM-2 retention stats, and per-topic bars. Reuses masteryScore,
 * retentionStats, and BANDS from @job-prep/lesson.
 */
export async function analyticsData(userId: string) {
  const now = Date.now();
  const all = await loadAllProgress(userId);
  const per = all.map(({ topic, pt, progress }) => {
    const id = topic.topic!.id;
    const m = masteryScore(pt, progress);
    const hist = progress.history ?? [];
    return {
      id,
      title: topic.topic!.title,
      scorePct: Math.round(m.score * 100),
      mastered: m.mastered,
      proficient: m.proficient,
      sections: m.sections,
      points: hist.map((p) => ({ t: p.t, pct: Math.round(p.score * 100) })),
      reviews: Object.values(progress.review),
    };
  });

  // Global mastery-over-time: replay every topic's snapshots in time order,
  // carrying each topic's latest score forward, averaged across all topics.
  const N = per.length || 1;
  const events = per
    .flatMap((p) => p.points.map((pt) => ({ t: pt.t, id: p.id, pct: pt.pct })))
    .sort((a, b) => a.t - b.t);
  const latest = new Map<string, number>();
  const trend: { t: number; pct: number }[] = [];
  for (const e of events) {
    latest.set(e.id, e.pct);
    const sum = [...latest.values()].reduce((a, b) => a + b, 0);
    trend.push({ t: e.t, pct: Math.round(sum / N) });
  }

  const retention = retentionStats(
    per.flatMap((p) => p.reviews),
    now,
  );
  const totalSections = per.reduce((n, p) => n + p.sections, 0);
  const masteredSections = per.reduce((n, p) => n + p.mastered, 0);
  const proficientSections = per.reduce((n, p) => n + p.proficient, 0);
  const avgPct = per.length ? Math.round(per.reduce((n, p) => n + p.scorePct, 0) / per.length) : 0;

  return {
    masteryNow: { avgPct, masteredSections, proficientSections, totalSections },
    trend: trend.slice(-60),
    retention,
    perTopic: per.map(({ reviews, points, ...rest }) => rest).sort((a, b) => b.scorePct - a.scorePct),
    legend: BANDS,
  };
}

/** Count of cross-topic review items due now (for the home hub button). */
export async function dueCount(userId: string): Promise<number> {
  return (await reviewCandidates(userId, Date.now())).length;
}

// ---- helpers reused by apply route ---------------------------------------
export function readTestFile(topic: LoadedTopic, testFile: string): string | null {
  const path = join(topic.dir, testFile);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}
