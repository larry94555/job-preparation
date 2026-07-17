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
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
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
  renderMarkdown,
  retentionStats,
  scheduleReview,
} from "@job-prep/lesson";
import { LlamaClient } from "@job-prep/evaluator";
import { createContentSource, createStore } from "@job-prep/store";
import {
  paraphraseLessonsEnabled,
  paraphrasedPrompts,
  paraphraseTestsEnabled,
} from "./paraphrase";
import { currentSessionId } from "./session";

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

// The independent "Becoming an Agentic AI Engineer in 6 Months" track. The full
// 12-topic plan is shown on the home page grouped into six monthly phases; a
// topic that hasn't been authored yet renders as a muted "Planned" card, so the
// whole roadmap is visible from day one. Titles here are the roadmap's titles.
const AGENTIC_TITLES: Record<string, string> = {
  "agentic-async-foundations": "Python & Async Foundations",
  "agentic-llm-mechanics": "LLM Fundamentals for Agents",
  "agentic-tool-calling": "Tool Calling & Structured Outputs",
  "agentic-memory-state": "Memory & State Management",
  "agentic-react-loop": "Single-Agent Workflows (ReAct)",
  "agentic-multi-agent": "Multi-Agent Orchestration",
  "agentic-human-in-the-loop": "Human-in-the-Loop",
  "agentic-evaluation": "Evaluation & Quality",
  "agentic-observability": "Observability & Tracing",
  "agentic-security": "Security & Guardrails",
  "agentic-deployment": "Production Deployment",
  "agentic-ship-in-public": "Ship in Public (Capstone)",
};
const AGENTIC_PHASES: { title: string; slugs: string[] }[] = [
  { title: "Month 1 — Foundation", slugs: ["agentic-async-foundations", "agentic-llm-mechanics"] },
  { title: "Month 2 — Agent Core", slugs: ["agentic-tool-calling", "agentic-memory-state"] },
  { title: "Month 3 — Building Agents", slugs: ["agentic-react-loop", "agentic-multi-agent"] },
  { title: "Month 4 — Production Skills", slugs: ["agentic-human-in-the-loop", "agentic-evaluation"] },
  { title: "Month 5 — Ship It", slugs: ["agentic-observability", "agentic-security"] },
  { title: "Month 6 — Real World", slugs: ["agentic-deployment", "agentic-ship-in-public"] },
];
const AGENTIC_TOTAL = Object.keys(AGENTIC_TITLES).length;

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

/**
 * Atomically read-modify-write a user's Progress for one topic. The store reads
 * the freshest stored value under a lock, we re-merge it onto the defaults (same
 * shape as `loadProgress`), run `mutator` to accumulate the change, and the store
 * writes it back — with no concurrent writer for this (user, topic) in between.
 * This is the write path every request handler should use so two in-flight
 * requests (two tabs, a double-submit, a hosted multi-instance deploy) can't lose
 * each other's updates. Returns the merged, mutated Progress for building the
 * response. `mutator` may run more than once and must not have side effects.
 */
export async function mutateProgress(
  userId: string,
  topicId: string,
  mutator: (progress: Progress) => void,
): Promise<Progress> {
  const store = createStore();
  const base = freshProgress(seedFromString(topicId));
  const updated = await store.update(userId, topicId, (saved) => {
    const progress =
      saved && typeof saved === "object" ? { ...base, ...(saved as Partial<Progress>) } : base;
    mutator(progress);
    return progress;
  });
  return updated as Progress;
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
  // Presentation seed varies per SESSION (option order, assessment draws), so a
  // new login reads a little differently — while staying consistent within the
  // session. Falls back to the stored per-topic seed when unauthenticated. The
  // playthrough STRUCTURE (which steps exist) is seed-independent, so progress
  // stays aligned; grading is unaffected (it matches on answer text/keys).
  const sid = await currentSessionId();
  const seed = sid ? seedFromString(`${sid}:${topicId}`) : progress.seed;
  const pt = buildPlaythrough(topic, seed);
  progress.index = Math.min(progress.index, pt.steps.length);
  return { topic, pt, progress };
}

// ---- paraphrase item collection -------------------------------------------
// We only ever reword MCQ *prompts* (answers live in the options, so rewording
// the question can't change what's correct) and prose *material* paragraphs.
// Text/essay/code prompts are left as-is because their wording is answer-relevant.

interface ParaItem {
  id: string;
  text: string;
}

/** Formative check/apply MCQ prompts — the "lessons" paraphrase surface. */
function lessonPromptItems(pt: Playthrough): ParaItem[] {
  const out: ParaItem[] = [];
  for (const s of pt.steps) {
    if ((s.kind === "check" || s.kind === "apply") && s.question.type === "multiple_choice") {
      out.push({ id: s.question.id, text: s.view.prompt });
    }
  }
  return out;
}

/** Section-assessment MCQ prompts — the "tests" paraphrase surface. */
function testPromptItems(pt: Playthrough): ParaItem[] {
  const out: ParaItem[] = [];
  for (const s of pt.steps) {
    if (s.kind !== "assessment") continue;
    for (const it of s.items) {
      if (it.question.type === "multiple_choice") out.push({ id: it.question.id, text: it.view.prompt });
    }
  }
  return out;
}

/** Stable id for a material paragraph, derived from its content (djb2), so the
 *  warm pass and the render pass agree on which rewrite belongs to which block
 *  (and identical paragraphs dedupe to one rewrite). */
function paragraphId(inner: string): string {
  let h = 5381;
  for (let i = 0; i < inner.length; i++) h = ((h << 5) + h + inner.charCodeAt(i)) | 0;
  return "mat:" + (h >>> 0).toString(36);
}

/** The `<p>` paragraphs in rendered material we're willing to reword: PURE prose
 *  only (inner HTML has no `<`), so any paragraph carrying inline code, emphasis,
 *  links, etc. is left untouched — the safe subset for HTML-level rewriting. */
function materialParagraphs(html: string): string[] {
  const out: string[] = [];
  const re = /<p>([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const inner = m[1];
    if (!inner.includes("<") && inner.trim()) out.push(inner);
  }
  return out;
}

/** Material prose paragraphs across a playthrough — the "lessons" surface. */
function materialItems(pt: Playthrough): ParaItem[] {
  const out: ParaItem[] = [];
  const seen = new Set<string>();
  for (const s of pt.steps) {
    if (s.kind !== "material") continue;
    for (const inner of materialParagraphs(s.html)) {
      const id = paragraphId(inner);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, text: inner });
    }
  }
  return out;
}

/** Swap reworded prose back into material HTML. Only pure-prose paragraphs are
 *  eligible, and a rewrite that (against instructions) introduced a `<` is
 *  rejected here — material is rendered via dangerouslySetInnerHTML, so a stray
 *  tag must never reach it. */
function applyMaterialOverrides(html: string, map: Map<string, string>): string {
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (full, inner: string) => {
    if (inner.includes("<")) return full;
    const rw = map.get(paragraphId(inner));
    return rw && !rw.includes("<") ? `<p>${rw}</p>` : full;
  });
}

/**
 * Cache-keyed reworded text for a lesson context (per session + topic). Combines
 * both paraphrase surfaces, each gated by its own flag: lessons (material +
 * check/apply prompts) and tests (assessment prompts). Returns the overrides map
 * to apply to the displayed step (empty until the background warm completes).
 */
export function paraphraseOverridesFor(
  ctx: LessonContext,
  sid: string | null,
): Map<string, string> {
  const items: ParaItem[] = [];
  if (paraphraseLessonsEnabled()) {
    items.push(...lessonPromptItems(ctx.pt), ...materialItems(ctx.pt));
  }
  if (paraphraseTestsEnabled()) {
    items.push(...testPromptItems(ctx.pt));
  }
  if (!items.length) return new Map();
  const key = `${sid ?? "anon"}:${ctx.pt.topicId}`;
  return paraphrasedPrompts(key, items);
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

/** Index of the nearest `material` step at or before `index` — the material that
 *  taught the current check, so a wrong answer can jump back to re-read it. Null
 *  if there's no earlier material. */
function precedingMaterialIndex(pt: Playthrough, index: number): number | null {
  for (let j = Math.min(index, pt.steps.length - 1); j >= 0; j--) {
    if (pt.steps[j].kind === "material") return j;
  }
  return null;
}

/** Apply reworded prompts + material prose (from paraphrase) to a sanitized step
 *  in place. Prompts are matched by question id; material by paragraph content. */
function applyOverrides(
  step: NonNullable<ReturnType<typeof sanitizeStep>>,
  map: Map<string, string>,
): typeof step {
  if (step.kind === "material") {
    step.html = applyMaterialOverrides(step.html, map);
  } else if (step.kind === "check" || step.kind === "apply") {
    const p = map.get(step.question.id);
    if (p) step.question = { ...step.question, prompt: p };
  } else if (step.kind === "assessment") {
    step.items = step.items.map((q) => {
      const p = map.get(q.id);
      return p ? { ...q, prompt: p } : q;
    });
  }
  return step;
}

/** The per-topic state payload — the sanitized current step + progress bands.
 *  `promptOverrides` reworded text (MCQ prompts + material prose, from the
 *  paraphrase cache) is applied to the displayed step, if provided. */
export function stateFor(ctx: LessonContext, promptOverrides?: Map<string, string>) {
  const { pt, progress } = ctx;
  const done = progress.index >= pt.steps.length;
  const step = done ? null : pt.steps[progress.index];
  let sanitized = step ? sanitizeStep(step) : null;
  if (sanitized && promptOverrides && promptOverrides.size) {
    sanitized = applyOverrides(sanitized, promptOverrides);
  }
  return {
    topic: { id: pt.topicId, title: pt.topicTitle },
    index: progress.index,
    total: pt.steps.length,
    done,
    currentSectionId: step ? (step as { sectionId: string }).sectionId : null,
    step: sanitized,
    // Where "Review the material" jumps to (the teaching step for this check).
    reviewIndex: precedingMaterialIndex(pt, progress.index),
    canGoBack: progress.index > 0,
    dashboard: dashboard(pt, progress),
    legend: BANDS,
  };
}

/**
 * Set the current step to an arbitrary index (clamped) — powers the "← Back" and
 * "Review the material ↑" navigation. Pure position change: it doesn't touch
 * seen/correct/review stats.
 */
export async function goToStep(
  userId: string,
  topicId: string,
  index: number,
): Promise<LessonContext | null> {
  const ctx = await loadContext(userId, topicId);
  if (!ctx) return null;
  const clamped = Math.max(0, Math.min(Math.trunc(index), ctx.pt.steps.length));
  ctx.progress = await mutateProgress(userId, topicId, (p) => {
    p.index = clamped;
  });
  return ctx;
}

// ---- home hub data --------------------------------------------------------

/** Build the home-page card (progress + mastery dashboard) for one loaded topic. */
async function buildHomeCard(userId: string, t: LoadedTopic) {
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
    track: t.topic!.track ?? "core",
    built: true as const,
  };
}

export async function homeData(userId: string) {
  const lessons = await allLessons();
  const cards = await Promise.all(lessons.map((t) => buildHomeCard(userId, t)));
  const byId = new Map(cards.map((c) => [c.id, c]));

  // Core track (the original curriculum) — the top grid + the readiness stats.
  const items = cards.filter((c) => c.track !== "agentic");

  // Agentic track — the six monthly phases; unbuilt topics render as "Planned".
  const agenticPhases = AGENTIC_PHASES.map((ph) => ({
    title: ph.title,
    items: ph.slugs.map((slug) => {
      const card = byId.get(slug);
      return card ?? { id: slug, title: AGENTIC_TITLES[slug] ?? slug, built: false as const };
    }),
  }));
  const agenticBuilt = cards.filter((c) => c.track === "agentic").length;

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
    agentic: { phases: agenticPhases, built: agenticBuilt, total: AGENTIC_TOTAL },
    continueTopic: cont,
    legend: BANDS,
    readinessPct,
    dueCount: due,
    masteredTopics: items.filter((i) => i.fullyMastered).length,
  };
}

// ---- public catalog (no user, no progress) --------------------------------

/** The topic slug used as the free, no-login sample lesson (see /sample). */
export const SAMPLE_TOPIC = "agentic-tool-calling";

/**
 * The public catalog shown to anonymous visitors: every topic's title +
 * description, grouped exactly like `homeData` (core grid + the six agentic
 * phases), but WITHOUT any per-user progress or mastery. Derived purely from the
 * git-tracked content, so it needs no sign-in and no store read.
 */
export async function catalogData() {
  const lessons = await allLessons();
  const cardOf = (t: LoadedTopic) => ({
    id: t.topic!.id,
    title: t.topic!.title,
    description: t.topic!.description,
    track: (t.topic!.track ?? "core") as "core" | "agentic",
  });
  const all = lessons.map(cardOf);
  const byId = new Map(all.map((c) => [c.id, c]));

  const items = all.filter((c) => c.track !== "agentic");
  const agenticPhases = AGENTIC_PHASES.map((ph) => ({
    title: ph.title,
    items: ph.slugs.map((slug) => {
      const card = byId.get(slug);
      return card
        ? { id: card.id, title: card.title, description: card.description, built: true as const }
        : { id: slug, title: AGENTIC_TITLES[slug] ?? slug, description: "", built: false as const };
    }),
  }));
  const agenticBuilt = all.filter((c) => c.track === "agentic").length;

  return {
    items,
    agentic: { phases: agenticPhases, built: agenticBuilt, total: AGENTIC_TOTAL },
    sampleTopic: SAMPLE_TOPIC,
  };
}

/** Shape returned by `catalogData` — consumed by the public catalog UI. */
export type CatalogData = Awaited<ReturnType<typeof catalogData>>;

// ---- assessment page + quick assessments ---------------------------------

type Mcq = Extract<Question, { type: "multiple_choice" }>;
const isMcq = (q: Question): q is Mcq => q.type === "multiple_choice";

/** A topic + its major subtopics for the Assessment page. `mainTotal` / per-
 *  section `total` are the quick-assessment sizes (used for the 10%-wrong
 *  frame-color thresholds on the client). */
export interface AssessmentTopic {
  id: string;
  title: string;
  built: boolean;
  mainTotal: number;
  sections: { id: string; title: string; total: number }[];
}

/**
 * Data for the free Assessment page: every topic (the core grid + the agentic
 * phases, exactly like the home hub) with its major subtopics + quick-assessment
 * question counts. Public and progress-free — per-user status is client-side.
 */
export async function assessmentData(): Promise<{
  items: AssessmentTopic[];
  agentic: { phases: { title: string; items: AssessmentTopic[] }[]; total: number };
}> {
  const lessons = await allLessons();
  const cardOf = (t: LoadedTopic): AssessmentTopic => {
    const mcqs = t.questions.filter(isMcq);
    return {
      id: t.topic!.id,
      title: t.topic!.title,
      built: true,
      mainTotal: mcqs.length,
      sections: t.sections.map((s) => {
        const tags = new Set(s.assessment.from_tags);
        return {
          id: s.id,
          title: s.title,
          total: mcqs.filter((q) => q.tags.some((x) => tags.has(x))).length,
        };
      }),
    };
  };
  const byId = new Map(lessons.map((t) => [t.topic!.id, cardOf(t)]));
  const items = lessons
    .filter((t) => (t.topic!.track ?? "core") !== "agentic")
    .map((t) => byId.get(t.topic!.id)!);
  const agenticPhases = AGENTIC_PHASES.map((ph) => ({
    title: ph.title,
    items: ph.slugs.map(
      (slug): AssessmentTopic =>
        byId.get(slug) ?? {
          id: slug,
          title: AGENTIC_TITLES[slug] ?? slug,
          built: false,
          mainTotal: 0,
          sections: [],
        },
    ),
  }));
  return { items, agentic: { phases: agenticPhases, total: AGENTIC_TOTAL } };
}

/** Shape returned by `assessmentData` — consumed by the Assessment page UI. */
export type AssessmentData = Awaited<ReturnType<typeof assessmentData>>;

/** A single quick-assessment question, sanitized for the client (no answer key). */
export interface QuickQuestion {
  id: string;
  prompt: string;
  options: string[];
  subtopic: string;
  /** Review page whose content covers (indirectly answers) this question. */
  contextHref: string;
}
export interface QuickAssessment {
  topicId: string;
  topicTitle: string;
  sectionId: string | null;
  sectionTitle: string | null;
  /** All section ids of the topic (so a main-topic "start over" can clear subs). */
  sectionIds: string[];
  questions: QuickQuestion[];
}

/**
 * The MC-only quick assessment for a topic (or one subtopic). Draws the topic's
 * conceptual multiple-choice bank — the whole topic for the main assessment, or
 * the questions tagged to a section for a subtopic. Sanitized: no correct flags
 * leave the server (choices are graded server-side by `gradeQuickChoice`).
 */
export async function quickAssessmentData(
  topicId: string,
  sectionId?: string | null,
): Promise<QuickAssessment | null> {
  const topic = await findTopic(topicId);
  if (!topic) return null;
  const mcqs = topic.questions.filter(isMcq);
  const subtopicOf = (q: Mcq): string =>
    topic.sections.find((s) => q.tags.some((t) => s.assessment.from_tags.includes(t)))?.title ?? "";

  let pool = mcqs;
  let sectionTitle: string | null = null;
  if (sectionId) {
    const sec = topic.sections.find((s) => s.id === sectionId);
    if (!sec) return null;
    sectionTitle = sec.title;
    const tags = new Set(sec.assessment.from_tags);
    pool = mcqs.filter((q) => q.tags.some((t) => tags.has(t)));
  }
  return {
    topicId: topic.topic!.id,
    topicTitle: topic.topic!.title,
    sectionId: sectionId ?? null,
    sectionTitle,
    sectionIds: topic.sections.map((s) => s.id),
    questions: pool.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((o) => o.text),
      subtopic: sectionId ? (sectionTitle ?? "") : subtopicOf(q),
      contextHref: contextHrefFor(topic, q.id),
    })),
  };
}

/** Resolve `p`, but never wait longer than `ms` — returns `fallback` if it does.
 *  Keeps an interactive request snappy even when a best-effort LLM call is slow. */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Grade one quick-assessment choice server-side (answer keys never reach the
 * client). On a correct pick returns the authored "why it's correct" note; on a
 * wrong pick returns a plain-English "why that's wrong" (LLM best-effort, and it
 * does NOT reveal which option is correct), falling back to a neutral nudge.
 */
export async function gradeQuickChoice(
  topicId: string,
  questionId: string,
  chosen: string,
): Promise<{ correct: boolean; explanation: string }> {
  const topic = await findTopic(topicId);
  const q = topic?.questions.find((x): x is Mcq => x.id === questionId && isMcq(x));
  if (!q) return { correct: false, explanation: "" };
  if (gradeMultipleChoice(q, chosen)) {
    return { correct: true, explanation: q.explanation ?? "Correct." };
  }
  // The "why it's wrong" note is best-effort and BOUNDED: the deterministic
  // result must never wait on a slow or unreachable LLM. The grading client
  // retries with a 60s-per-attempt cap (fine for batch grading, but it would
  // hang this interactive request), so cap the whole thing and fall back.
  const why = await withTimeout(explainWrongAnswer(q, chosen), 6000, null);
  return {
    correct: false,
    explanation: why ?? "That's not the best choice here — reconsider the other options.",
  };
}

// ---- review cheat sheets --------------------------------------------------

/** Reframe one section's roadmap markdown into a compact "cheat sheet" section:
 *  drop the topic-level H1 and the "Roadmap:" heading (re-titled with the
 *  section's own title) and turn the preview-voice labels into review-voice ones.
 *  The overview diagram, the key-terms glossary, and the "why it matters"
 *  takeaway are kept verbatim — this is authored content, not generated. */
function roadmapToCheatSheet(md: string, sectionTitle: string): string {
  const lines = md.split(/\r?\n/);
  // Keep the body under the "## Roadmap: …" heading (fallback: the first H2).
  let start = lines.findIndex((l) => /^##\s+Roadmap\b/i.test(l));
  if (start < 0) start = lines.findIndex((l) => /^##\s+/.test(l));
  const body = (start >= 0 ? lines.slice(start + 1) : lines).join("\n").trim();
  const reframed = body
    .replace(/\*\*\s*What this section covers\.?\s*\*\*/gi, "**In brief.**")
    .replace(/\*\*\s*The ideas you['’]ll meet[:.]?\s*\*\*/gi, "**Key terms.**");
  return `## ${sectionTitle}\n\n${reframed}\n`;
}

// A topic MAY ship extra cheat-sheet pages under `topics/<t>/review/*.md` beyond
// page 1 (the section roadmaps): each a short, roadmap-format summary of deeper
// lesson material that a set of quiz questions needs but the roadmaps only
// preview. Authored content (YAML frontmatter: title/order/covers) read straight
// from disk like the roadmaps above — no engine schema/loader involvement.
interface ReviewExtraPage {
  id: string;
  title: string;
  order: number;
  /** Question ids whose answer this page's content provides (for the context link). */
  covers: string[];
  /** Roadmap-format markdown body (## title / **In brief.** / mermaid / **Key terms.** / …). */
  body: string;
}

function loadReviewPages(topic: LoadedTopic): ReviewExtraPage[] {
  const dir = join(topic.dir, "review");
  if (!existsSync(dir)) return [];
  const out: ReviewExtraPage[] = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const raw = readFileSync(join(dir, f), "utf8");
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
    if (!m) continue;
    let fm: { title?: unknown; order?: unknown; covers?: unknown };
    try {
      fm = (YAML.parse(m[1]) ?? {}) as typeof fm;
    } catch {
      continue;
    }
    out.push({
      id: f.replace(/\.md$/, ""),
      title: typeof fm.title === "string" ? fm.title : f,
      order: typeof fm.order === "number" ? fm.order : 999,
      covers: Array.isArray(fm.covers) ? fm.covers.map(String) : [],
      body: m[2].trim(),
    });
  }
  return out.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/** The section a question belongs to (first section whose from_tags intersect the
 *  question's tags), or null. */
function sectionOfQuestion(topic: LoadedTopic, questionId: string): string | null {
  const q = topic.questions.find((x) => x.id === questionId);
  if (!q) return null;
  return (
    topic.sections.find((s) => q.tags.some((t) => s.assessment.from_tags.includes(t)))?.id ?? null
  );
}

/** True when an extra page covers at least one question that belongs to `sectionId`. */
function pageInSection(topic: LoadedTopic, page: ReviewExtraPage, sectionId: string): boolean {
  return page.covers.some((qid) => sectionOfQuestion(topic, qid) === sectionId);
}

const reviewBase = (topicId: string, sectionId?: string | null): string =>
  `/assessment/review?topic=${encodeURIComponent(topicId)}${
    sectionId ? `&section=${encodeURIComponent(sectionId)}` : ""
  }`;

/** The "context" link target for a quiz question: the extra review page that
 *  covers it, else page 1 (the cheat sheet) scoped to the question's own
 *  section. Every question therefore resolves to a review page. */
export function contextHrefFor(topic: LoadedTopic, questionId: string): string {
  const page = loadReviewPages(topic).find((p) => p.covers.includes(questionId));
  if (page) return `${reviewBase(topic.topic!.id)}&page=${encodeURIComponent(page.id)}`;
  return reviewBase(topic.topic!.id, sectionOfQuestion(topic, questionId));
}

/** One page of a topic's Review. Page 0 (pageId null) is the "cheat sheet" (the
 *  section roadmaps, reframed); pages 1..N are the authored extra cheat sheets.
 *  Paginated with prev/next hrefs. */
export interface ReviewView {
  topicId: string;
  topicTitle: string;
  sectionId: string | null;
  sectionTitle: string | null;
  pageId: string | null;
  pageTitle: string | null;
  /** Rendered content HTML (may contain mermaid diagrams). */
  html: string;
  index: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
}

/**
 * A Review page. With no `pageId` it's the cheat sheet — the section roadmaps
 * reframed into a quick reference (the whole topic, or one subtopic). Authored
 * extra pages (`topics/<t>/review/*.md`) render deeper cheat sheets and paginate
 * after it, so a review is now potentially several short, coherent pages, each
 * in the same format. Public and progress-free; no LLM.
 */
export async function reviewData(
  topicId: string,
  sectionId?: string | null,
  pageId?: string | null,
): Promise<ReviewView | null> {
  const topic = await findTopic(topicId);
  if (!topic) return null;

  const section = sectionId ? (topic.sections.find((s) => s.id === sectionId) ?? null) : null;
  if (sectionId && !section) return null;

  // Extra pages in scope: all for a whole-topic review, else only those covering
  // a question that belongs to the chosen subtopic.
  const extras = loadReviewPages(topic).filter(
    (p) => !sectionId || pageInSection(topic, p, sectionId),
  );
  const order: (string | null)[] = [null, ...extras.map((p) => p.id)]; // [cheat sheet, ...extras]
  const hrefOf = (id: string | null): string =>
    id === null
      ? reviewBase(topicId, sectionId)
      : `${reviewBase(topicId, sectionId)}&page=${encodeURIComponent(id)}`;

  let index = 0;
  if (pageId) {
    const i = order.indexOf(pageId);
    if (i >= 0) index = i;
  }

  let html: string;
  let pageTitle: string | null = null;
  if (index === 0) {
    // The cheat sheet: the section roadmap(s), reframed from preview to review.
    const lessonById = new Map(topic.lessons.map((l) => [l.id, l]));
    const roadmapMd = (sec: LoadedTopic["sections"][number]): string | null => {
      for (const lid of sec.lessons) {
        const les = lessonById.get(lid);
        if (!les) continue;
        if (les.id.startsWith("lesson-roadmap-") || /^roadmap-/.test(les.material)) {
          const p = join(topic.dir, "lessons", les.material);
          if (existsSync(p)) return readFileSync(p, "utf8");
        }
      }
      return null;
    };
    const secs = sectionId ? topic.sections.filter((s) => s.id === sectionId) : topic.sections;
    const parts: string[] = [];
    for (const s of secs) {
      const md = roadmapMd(s);
      if (md) parts.push(roadmapToCheatSheet(md, s.title));
    }
    if (parts.length === 0) return null;
    html = renderMarkdown(parts.join("\n\n"));
  } else {
    const page = extras[index - 1];
    html = renderMarkdown(page.body);
    pageTitle = page.title;
  }

  return {
    topicId: topic.topic!.id,
    topicTitle: topic.topic!.title,
    sectionId: sectionId ?? null,
    sectionTitle: section?.title ?? null,
    pageId: index === 0 ? null : extras[index - 1].id,
    pageTitle,
    html,
    index,
    total: order.length,
    prevHref: index > 0 ? hrefOf(order[index - 1]) : null,
    nextHref: index < order.length - 1 ? hrefOf(order[index + 1]) : null,
  };
}

// ---- free sample lesson (anonymous, stateless, no LLM) --------------------

/** Client-safe question view for a sample check (never carries the answer key). */
export interface SampleQuestionView {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  inputKind?: "text";
}

/** One step of the free sample: readable material or a deterministic check. Gated
 *  essay/code/assessment steps are omitted entirely — a single "registered users
 *  only" gate is shown once at the very end of the sample (see SampleClient). */
export type SampleStep =
  | { kind: "material"; lessonTitle: string; heading: string; html: string }
  | { kind: "check"; question: SampleQuestionView };

/** Default seed for the sample when a per-load seed isn't supplied. */
export const SAMPLE_SEED = seedFromString(SAMPLE_TOPIC);

/**
 * The free sample flow: the sample topic's playthrough reduced to the steps an
 * anonymous visitor can use — the "present" material and the multiple-choice /
 * fill-in checks. Essay/code ("apply") and section assessments are OMITTED (not
 * shown inline); the UI shows a single "registered users only" gate at the end of
 * the sample instead. No store, no answer keys leave the server.
 *
 * `seed` (per page load) reshuffles the options each visit; it's echoed back so
 * grading re-derives the identical playthrough. Material prose and MCQ prompts are
 * reworded via the paraphrase cache (warmed in the background, once per process
 * for the sample) when the "lessons" surface is enabled.
 */
export async function sampleFlow(seed: number = SAMPLE_SEED): Promise<{
  topicId: string;
  topicTitle: string;
  seed: number;
  steps: SampleStep[];
} | null> {
  const topic = await findTopic(SAMPLE_TOPIC);
  if (!topic) return null;
  const pt = buildPlaythrough(topic, seed);
  // The sample is a lesson, so it uses the "lessons" surface (material + checks).
  const overrides = paraphraseLessonsEnabled()
    ? paraphrasedPrompts("sample", [...lessonPromptItems(pt), ...materialItems(pt)])
    : new Map<string, string>();
  const steps: SampleStep[] = [];
  for (const step of pt.steps) {
    if (step.kind === "material") {
      steps.push({
        kind: "material",
        lessonTitle: step.lessonTitle,
        heading: step.heading,
        html: applyMaterialOverrides(step.html, overrides),
      });
    } else if (step.kind === "check") {
      const v = step.view as SampleQuestionView;
      steps.push({
        kind: "check",
        question: {
          id: v.id,
          type: v.type,
          prompt: overrides.get(v.id) ?? v.prompt,
          options: v.options,
          inputKind: v.inputKind,
        },
      });
    }
    // apply (essay/code) and assessment steps are omitted from the sample; the
    // "registered users only" gate is shown once at the end by the client.
  }
  return { topicId: topic.topic!.id, topicTitle: pt.topicTitle, seed, steps };
}

/**
 * A short, plain-English "why that's not right" for a wrong multiple-choice
 * answer, generated by the LLM. Best-effort: returns null when the LLM isn't
 * reachable/configured (local dev, or a web tier without LLM creds), so callers
 * fall back to the question's authored explanation. MCQ only — it needs a single
 * correct option to contrast against. Runs server-side; the LLM key never reaches
 * the browser.
 */
export async function explainWrongAnswer(
  question: Question,
  studentAnswer: string,
): Promise<string | null> {
  if (question.type !== "multiple_choice") return null;
  const correct = question.options.find((o) => o.correct)?.text;
  if (!correct) return null;
  const sys =
    "You are a warm, encouraging tutor. A learner picked the wrong option on a quick " +
    "multiple-choice check. In 1–2 short, plain-English sentences, explain why THEIR choice is " +
    "not right and nudge them toward the correct idea — never condescending, and don't just restate " +
    'the correct answer verbatim. Respond with ONLY a JSON object: {"explanation": "..."}.';
  const user =
    `Question: ${question.prompt}\n` +
    `Their (incorrect) choice: ${studentAnswer}\n` +
    `The correct choice: ${correct}\n` +
    (question.explanation ? `Reference note: ${question.explanation}\n` : "");
  try {
    // Short per-attempt timeout: this is an interactive request, not batch
    // grading, so fail fast to the neutral fallback rather than blocking.
    const raw = await new LlamaClient({ timeoutMs: 4000 }).chatJson([
      { role: "system", content: sys },
      { role: "user", content: user },
    ]);
    const m = /\{[\s\S]*\}/.exec(raw);
    const parsed = m ? (JSON.parse(m[0]) as { explanation?: unknown }) : null;
    const ex = typeof parsed?.explanation === "string" ? parsed.explanation.trim() : "";
    return ex || null;
  } catch {
    return null;
  }
}

/**
 * Grade one sample check with no persistence. Re-derives the same deterministic
 * playthrough (fixed seed) and grades the check with the matching question id,
 * so the answer key never reaches the client. Only the sample topic is graded.
 * On a wrong answer it also returns a plain-English explanation (LLM best-effort,
 * else the question's authored explanation).
 */
export async function gradeSampleCheck(
  questionId: string,
  answer: string,
  seed: number = SAMPLE_SEED,
): Promise<{ correct: boolean; explanation: string }> {
  const topic = await findTopic(SAMPLE_TOPIC);
  if (!topic) return { correct: false, explanation: "" };
  const pt = buildPlaythrough(topic, seed);
  for (const step of pt.steps) {
    if (step.kind === "check" && step.question.id === questionId) {
      const q = step.question;
      const correct =
        q.type === "multiple_choice"
          ? gradeMultipleChoice(q, answer)
          : q.type === "text_input"
            ? gradeTextInput(q, answer, step.params)
            : false;
      let explanation = q.type === "multiple_choice" ? (q.explanation ?? "") : "";
      if (!correct) {
        const tailored = await explainWrongAnswer(q, answer);
        if (tailored) explanation = tailored;
      }
      return { correct, explanation };
    }
  }
  return { correct: false, explanation: "" };
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
  // Grade purely, collecting the SM-2 review updates grouped by topic so each
  // topic's Progress can be written in one atomic read-modify-write.
  const updatesByTopic = new Map<string, { qid: string; ok: boolean }[]>();
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
    const list = updatesByTopic.get(it.topicId) ?? [];
    list.push({ qid: it.question.id, ok });
    updatesByTopic.set(it.topicId, list);
    review.push({ id: it.question.id, correct: ok, topicId: it.topicId });
  }

  const total = items.length;
  const score = total ? correct / total : 0;

  // A cumulative round also records a best score on its topic, even if that
  // topic contributed no review items this round.
  if (kind === "cumulative" && topicId && !updatesByTopic.has(topicId)) {
    updatesByTopic.set(topicId, []);
  }

  // Persist each touched topic atomically (no lost updates under concurrency).
  for (const [id, ups] of updatesByTopic) {
    await mutateProgress(userId, id, (p) => {
      for (const u of ups) {
        p.review[u.qid] = scheduleReview(p.review[u.qid], u.ok, gradedNow);
      }
      if (kind === "cumulative" && id === topicId) {
        p.cumulativeBest = Math.max(p.cumulativeBest ?? 0, score);
      }
    });
  }

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
