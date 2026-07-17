#!/usr/bin/env tsx
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type LoadedTopic,
  gradeMultipleChoice,
  gradeTextInput,
  loadAllTopics,
  mulberry32,
  prepareQuestion,
  seedFromString,
  shuffle,
} from "@job-prep/engine";
import { gradeOpen } from "@job-prep/evaluator";
import { runTypeScript } from "@job-prep/sandbox";
import { readProgress, writeProgress } from "@job-prep/store";
import {
  BANDS,
  buildPlaythrough,
  dashboard,
  freshProgress,
  isDue,
  masteryScore,
  type Playthrough,
  type Progress,
  recordSnapshot,
  retentionStats,
  scheduleReview,
  sectionBand,
} from "@job-prep/lesson";

// ---- args ----------------------------------------------------------------
const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const startTopic = positional[0]; // optional — jump straight into a topic
const autoContinue = argv.includes("--continue");
const portArg = argv.indexOf("--port");
const port = portArg >= 0 ? Number(argv[portArg + 1]) : 4319;
const topicsDir = "topics";

// Curated path order (foundations first); unknown topics sort after, by id.
const ORDER = [
  // foundations
  "harness-engineering",
  "loop-engineering",
  "context-engineering",
  // reliability
  "structured-output-reliability",
  "function-calling-reliability",
  "agent-guardrails-budgets",
  "model-routing-fallback",
  // retrieval
  "rag-architecture",
  "retrieval-evals",
  // quality / ops
  "eval-methodology",
  "llm-observability",
  "cost-attribution",
  // serving & inference
  "prompt-vs-semantic-caching",
  "kv-cache-management",
  "prefill-vs-decode-latency",
  "batching-paged-attention-throughput",
  "speculative-decoding-quant-distillation",
  "quantization-formats-quality",
  // safety
  "safety-engineering",
  "multi-tenant-isolation",
  // capstones (integrative — synthesize the above)
  "adaptation-strategy-selection",
  "inference-stack-tradeoffs",
  "production-failure-modes",
];

// ---- load all lesson topics ---------------------------------------------
const { topics } = loadAllTopics(topicsDir);
const lessons: LoadedTopic[] = topics
  .filter((t) => t.topic && t.sections.length > 0 && t.issues.length === 0)
  .sort((a, b) => {
    const ra = ORDER.indexOf(a.topic!.id),
      rb = ORDER.indexOf(b.topic!.id);
    return (ra < 0 ? ORDER.length : ra) - (rb < 0 ? ORDER.length : rb) || a.topic!.id.localeCompare(b.topic!.id);
  });
const topicById = new Map(lessons.map((t) => [t.topic!.id, t]));
if (lessons.length === 0) {
  console.error("No lesson topics found (a lesson needs a valid sections.yaml). Run: npm run validate");
  process.exit(1);
}

// ---- per-topic progress + sessions --------------------------------------
// Progress persists through the shared @job-prep/store file helpers. Single
// local user → a fixed base dir keeps the historical .progress/<id>.json layout.
const progressDir = join(process.cwd(), ".progress");
function loadProgress(id: string): Progress {
  const seed = seedFromString(id);
  const saved = readProgress(progressDir, id);
  if (saved && typeof saved === "object") {
    return { ...freshProgress(seed), ...(saved as Partial<Progress>) };
  }
  return freshProgress(seed);
}
function saveProgress(id: string, p: Progress): void {
  writeProgress(progressDir, id, p);
}

interface Session {
  topic: LoadedTopic;
  pt: Playthrough;
  progress: Progress;
}
const sessions = new Map<string, Session>();
function ensure(id: string): Session | null {
  const topic = topicById.get(id);
  if (!topic) return null;
  let s = sessions.get(id);
  if (!s) {
    const progress = loadProgress(id);
    const pt = buildPlaythrough(topic, progress.seed);
    progress.index = Math.min(progress.index, pt.steps.length);
    s = { topic, pt, progress };
    sessions.set(id, s);
  }
  return s;
}

// ---- practice modes (review / mock / cumulative) ------------------------
type PrepItem = { question: any; params: Record<string, string>; view: any; topicId: string };
const isDeterministic = (q: any) => q.type === "multiple_choice" || q.type === "text_input";

function prepItem(q: any, rng: () => number, topicId: string): PrepItem {
  const prepared: any = prepareQuestion(q, rng);
  const view =
    q.type === "multiple_choice"
      ? { id: q.id, type: q.type, prompt: prepared.prompt, options: prepared.options.map((o: any) => o.text) }
      : { id: q.id, type: q.type, prompt: prepared.prompt, inputKind: "text" };
  const params = prepared.type === "text_input" ? prepared.params : {};
  return { question: q, params, view, topicId };
}

/** Cross-topic formative checks that are due for review (SM-2). */
function reviewCandidates(now: number): { topicId: string; question: any }[] {
  const out: { topicId: string; question: any }[] = [];
  for (const t of lessons) {
    const s = ensure(t.topic!.id)!;
    const seen = new Set<string>();
    for (const step of s.pt.steps) {
      if (step.kind !== "check") continue;
      const q = step.question;
      if (seen.has(q.id) || !isDeterministic(q)) continue;
      seen.add(q.id);
      const rs = s.progress.review[q.id];
      if (rs && isDue(rs, now)) out.push({ topicId: t.topic!.id, question: q });
    }
  }
  return out;
}

function buildReview(now: number, limit = 12): PrepItem[] {
  const rng = mulberry32((now >>> 0) ^ 0x9e3779b9);
  return shuffle(reviewCandidates(now), rng)
    .slice(0, limit)
    .map((c) => prepItem(c.question, rng, c.topicId));
}
function buildMock(topicId: string, now: number, count = 10): PrepItem[] {
  const s = ensure(topicId)!;
  const rng = mulberry32((now >>> 0) ^ 0x1234567);
  return shuffle(s.topic.questions.filter(isDeterministic), rng)
    .slice(0, count)
    .map((q) => prepItem(q, rng, topicId));
}
function buildCumulative(topicId: string, now: number, count = 10): PrepItem[] {
  const s = ensure(topicId)!;
  const rng = mulberry32((now >>> 0) ^ 0x7654321);
  const tags = new Set<string>();
  for (const sec of s.topic.sections) for (const t of sec.assessment.from_tags) tags.add(t);
  const pool = s.topic.questions.filter((q) => isDeterministic(q) && q.tags.some((t: string) => tags.has(t)));
  return shuffle(pool, rng).slice(0, count).map((q) => prepItem(q, rng, topicId));
}

let practice: { kind: "review" | "mock" | "cumulative"; topicId?: string; timeLimitSec?: number; items: PrepItem[] } | null = null;

let active: string | null = startTopic && topicById.has(startTopic) ? startTopic : null;

// ---- views ---------------------------------------------------------------
function sanitize(step: Playthrough["steps"][number]) {
  switch (step.kind) {
    case "material":
      return { kind: step.kind, sectionId: step.sectionId, lessonTitle: step.lessonTitle, heading: step.heading, html: step.html };
    case "check":
      return { kind: step.kind, sectionId: step.sectionId, question: step.view };
    case "apply":
      return { kind: step.kind, sectionId: step.sectionId, question: step.view };
    case "assessment":
      return { kind: step.kind, sectionId: step.sectionId, title: step.title, passThreshold: step.passThreshold, items: step.items.map((i) => i.view) };
  }
}

function homeData() {
  const items = lessons.map((t) => {
    const id = t.topic!.id;
    const s = ensure(id)!;
    const dash = dashboard(s.pt, s.progress);
    const done = s.progress.index >= s.pt.steps.length;
    const fullyMastered = dash.length > 0 && dash.every((d) => d.band >= 3);
    const activity = s.progress.index === 0 ? "Not started" : done ? "Played through" : `In progress — step ${s.progress.index + 1} of ${s.pt.steps.length}`;
    return { id, title: t.topic!.title, description: t.topic!.description, total: s.pt.steps.length, index: s.progress.index, done, fullyMastered, activity, dashboard: dash };
  });
  const cont = items.find((i) => i.index < i.total)?.id ?? items.find((i) => !i.fullyMastered)?.id ?? items[0].id;
  const totalSections = items.reduce((n, i) => n + i.dashboard.length, 0);
  const masteredSections = items.reduce((n, i) => n + i.dashboard.filter((d) => d.band >= 3).length, 0);
  const readinessPct = totalSections ? Math.round((100 * masteredSections) / totalSections) : 0;
  const dueCount = reviewCandidates(Date.now()).length;
  return { items, continueTopic: cont, legend: BANDS, readinessPct, dueCount, masteredTopics: items.filter((i) => i.fullyMastered).length };
}

function analyticsData() {
  const now = Date.now();
  const per = lessons.map((t) => {
    const id = t.topic!.id;
    const s = ensure(id)!;
    const m = masteryScore(s.pt, s.progress);
    const hist = s.progress.history ?? [];
    return {
      id,
      title: t.topic!.title,
      scorePct: Math.round(m.score * 100),
      mastered: m.mastered,
      proficient: m.proficient,
      sections: m.sections,
      points: hist.map((p) => ({ t: p.t, pct: Math.round(p.score * 100) })),
      reviews: Object.values(s.progress.review),
    };
  });

  // Global mastery-over-time: replay every topic's snapshots in time order,
  // carrying each topic's latest score forward, and average across all topics.
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

  const retention = retentionStats(per.flatMap((p) => p.reviews), now);
  const totalSections = per.reduce((n, p) => n + p.sections, 0);
  const masteredSections = per.reduce((n, p) => n + p.mastered, 0);
  const proficientSections = per.reduce((n, p) => n + p.proficient, 0);
  const avgPct = per.length ? Math.round(per.reduce((n, p) => n + p.scorePct, 0) / per.length) : 0;

  return {
    masteryNow: { avgPct, masteredSections, proficientSections, totalSections },
    trend: trend.slice(-60),
    retention,
    perTopic: per.map(({ reviews, ...rest }) => rest).sort((a, b) => b.scorePct - a.scorePct),
  };
}

function stateFor(id: string) {
  const s = ensure(id)!;
  const done = s.progress.index >= s.pt.steps.length;
  const step = done ? null : s.pt.steps[s.progress.index];
  return {
    home: false,
    topic: { id: s.pt.topicId, title: s.pt.topicTitle },
    index: s.progress.index,
    total: s.pt.steps.length,
    done,
    currentSectionId: step ? (step as { sectionId: string }).sectionId : null,
    step: step ? sanitize(step) : null,
    dashboard: dashboard(s.pt, s.progress),
    legend: BANDS,
  };
}
const state = () => (active ? stateFor(active) : { home: true });

// ---- request handling ----------------------------------------------------
const appDir = fileURLToPath(new URL(".", import.meta.url));
function readBody(req: import("node:http").IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  const json = (obj: unknown) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(obj));
  };

  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(readFileSync(join(appDir, "index.html")));
    return;
  }

  // Serve the bundled mermaid UMD build from node_modules so ```mermaid diagrams
  // render offline (no CDN). If the dep isn't installed, the raw source shows.
  if (req.method === "GET" && url === "/vendor/mermaid.min.js") {
    const mermaidPath = join(process.cwd(), "node_modules", "mermaid", "dist", "mermaid.min.js");
    if (existsSync(mermaidPath)) {
      res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      res.end(readFileSync(mermaidPath));
    } else {
      res.writeHead(404);
      res.end("mermaid not installed");
    }
    return;
  }

  if (req.method === "GET" && url === "/api/state") return json(state());
  if (req.method === "GET" && url === "/api/home") return json(homeData());
  if (req.method === "GET" && url === "/api/analytics") return json(analyticsData());

  if (req.method === "POST" && url === "/api/home") {
    active = null;
    return json(state());
  }
  if (req.method === "POST" && url === "/api/select") {
    const body = await readBody(req);
    const id = String(body.topic ?? "");
    if (!topicById.has(id)) return json({ error: "unknown topic" });
    active = id;
    ensure(id);
    return json(state());
  }
  if (req.method === "POST" && url === "/api/continue") {
    const cont = homeData().continueTopic;
    active = cont;
    const s = ensure(cont)!;
    if (s.progress.index >= s.pt.steps.length) {
      s.progress.index = 0; // played all the way through → start it over
      saveProgress(cont, s.progress);
    }
    return json(state());
  }

  const s = active ? sessions.get(active)! : null;

  if (req.method === "POST" && url === "/api/next") {
    if (!s) return json({ error: "no active lesson" });
    const cur = s.pt.steps[s.progress.index];
    if (cur?.kind === "material" && !s.progress.viewedSections.includes(cur.sectionId)) s.progress.viewedSections.push(cur.sectionId);
    if (s.progress.index < s.pt.steps.length) s.progress.index++;
    recordSnapshot(s.progress, s.pt, Date.now());
    saveProgress(active!, s.progress);
    return json(state());
  }

  if (req.method === "POST" && url === "/api/reset") {
    if (!s) return json({ error: "no active lesson" });
    Object.assign(s.progress, freshProgress(s.progress.seed));
    saveProgress(active!, s.progress);
    return json(state());
  }

  if (req.method === "POST" && url === "/api/answer") {
    if (!s) return json({ error: "no active lesson" });
    const body = await readBody(req);
    const cur = s.pt.steps[s.progress.index];
    if (cur?.kind !== "check") return json({ error: "not a check step" });
    const answer = String(body.answer ?? "");
    const correct =
      cur.question.type === "multiple_choice"
        ? gradeMultipleChoice(cur.question, answer)
        : cur.question.type === "text_input"
          ? gradeTextInput(cur.question, answer, cur.params)
          : false;
    if (!s.progress.seenChecks.includes(cur.question.id)) s.progress.seenChecks.push(cur.question.id);
    if (correct && !s.progress.correctChecks.includes(cur.question.id)) s.progress.correctChecks.push(cur.question.id);
    s.progress.review[cur.question.id] = scheduleReview(s.progress.review[cur.question.id], correct, Date.now());
    recordSnapshot(s.progress, s.pt, Date.now());
    saveProgress(active!, s.progress);
    return json({ correct, explanation: cur.question.type === "multiple_choice" ? cur.question.explanation ?? "" : "" });
  }

  if (req.method === "POST" && url === "/api/apply") {
    if (!s) return json({ error: "no active lesson" });
    const body = await readBody(req);
    const cur = s.pt.steps[s.progress.index];
    if (cur?.kind !== "apply") return json({ error: "not an apply step" });
    const q = cur.question;
    const answer = String(body.answer ?? "");
    const skillId = q.type === "essay" || q.type === "code" ? q.eval_skill : undefined;
    const skill = skillId ? s.topic.skills.find((sk) => sk.frontmatter.id === skillId) : undefined;

    if (q.type === "code") {
      let testsPassed: boolean | undefined;
      let testOutput = "";
      if (q.test_file && existsSync(join(s.topic.dir, q.test_file))) {
        const res2 = await runTypeScript({ solutionCode: answer, testCode: readFileSync(join(s.topic.dir, q.test_file), "utf8"), timeoutMs: 15000, repoRoot: process.cwd() });
        testsPassed = res2.passed;
        testOutput = res2.timedOut ? "Timed out." : res2.output;
      }
      const concept = skill ? await gradeOpen({ skill, answer, evidence: `tests_passed: ${testsPassed}\n\nCode under review:\n${answer}` }) : null;
      const conceptVerdict = concept && concept.graded ? concept.aggregate.verdict : undefined;
      const verdict = testsPassed === false ? "fail" : conceptVerdict ?? (testsPassed ? "pass" : "borderline");
      return json({ graded: true, tests_ran: testsPassed !== undefined, tests_passed: testsPassed, test_output: testOutput.slice(-600), verdict, conceptVerdict, feedback: concept && concept.graded ? concept.feedback : "", checks: concept && concept.graded ? concept.checks : undefined, concept_offline: concept ? !concept.graded : true });
    }

    if (!skill) return json({ graded: false, offline: false, reason: "no eval skill for this task" });
    const calibration = s.topic.calibration.find((c) => c.skill === skill.frontmatter.id);
    const referencePoints = q.type === "essay" ? q.reference_points : [];
    const r = await gradeOpen({ skill, answer, referencePoints, calibration });
    if (!r.graded) return json({ graded: false, offline: r.offline, reason: r.reason });
    return json({ graded: true, verdict: r.aggregate.verdict, score: r.aggregate.score, feedback: r.feedback, checks: r.checks });
  }

  if (req.method === "POST" && url === "/api/assessment") {
    if (!s) return json({ error: "no active lesson" });
    const body = await readBody(req);
    const cur = s.pt.steps[s.progress.index];
    if (cur?.kind !== "assessment") return json({ error: "not an assessment step" });
    const answers = (body.answers ?? {}) as Record<string, string>;
    const nowTs = Date.now();
    const review = cur.items.map((it) => {
      const a = String(answers[it.question.id] ?? "");
      const correct = it.question.type === "multiple_choice" ? gradeMultipleChoice(it.question, a) : gradeTextInput(it.question, a, it.params);
      s.progress.review[it.question.id] = scheduleReview(s.progress.review[it.question.id], correct, nowTs);
      return { id: it.question.id, correct };
    });
    const correct = review.filter((r) => r.correct).length;
    const score = cur.items.length ? correct / cur.items.length : 0;
    s.progress.assessmentBest[cur.sectionId] = Math.max(s.progress.assessmentBest[cur.sectionId] ?? 0, score);
    recordSnapshot(s.progress, s.pt, nowTs);
    saveProgress(active!, s.progress);
    const band = sectionBand(s.pt, s.progress, cur.sectionId);
    return json({ correct, total: cur.items.length, score, passed: score >= cur.passThreshold, passThreshold: cur.passThreshold, band, bandName: BANDS[band].name, review });
  }

  // ---- practice modes: review / mock / cumulative ----
  if (req.method === "POST" && url === "/api/practice/start") {
    const body = await readBody(req);
    const kind = String(body.kind ?? "");
    const now = Date.now();
    if (kind === "review") {
      const items = buildReview(now);
      if (items.length === 0) return json({ empty: true, kind });
      practice = { kind, items };
      return json({ kind, title: "Review — due & weak items", items: items.map((i) => i.view) });
    }
    const topic = String(body.topic ?? "");
    if (!topicById.has(topic)) return json({ error: "unknown topic" });
    if (kind === "mock") {
      const items = buildMock(topic, now);
      practice = { kind, topicId: topic, timeLimitSec: 600, items };
      return json({ kind, topic, title: `Mock interview — ${topicById.get(topic)!.topic!.title}`, timeLimitSec: 600, items: items.map((i) => i.view) });
    }
    if (kind === "cumulative") {
      const items = buildCumulative(topic, now);
      practice = { kind, topicId: topic, items };
      return json({ kind, topic, title: `Cumulative assessment — ${topicById.get(topic)!.topic!.title}`, items: items.map((i) => i.view) });
    }
    return json({ error: "unknown practice kind" });
  }

  if (req.method === "POST" && url === "/api/practice/grade") {
    if (!practice) return json({ error: "no active practice" });
    const body = await readBody(req);
    const answers = (body.answers ?? {}) as Record<string, string>;
    const now = Date.now();
    let correct = 0;
    const review = practice.items.map((it) => {
      const a = String(answers[it.question.id] ?? "");
      const ok = it.question.type === "multiple_choice" ? gradeMultipleChoice(it.question, a) : gradeTextInput(it.question, a, it.params);
      if (ok) correct++;
      if (practice!.kind === "review") {
        const s2 = ensure(it.topicId)!;
        s2.progress.review[it.question.id] = scheduleReview(s2.progress.review[it.question.id], ok, now);
      }
      return { id: it.question.id, correct: ok, topicId: it.topicId };
    });
    const total = practice.items.length;
    const score = total ? correct / total : 0;
    if (practice.kind === "review") {
      for (const id of new Set(practice.items.map((i) => i.topicId))) saveProgress(id, sessions.get(id)!.progress);
    }
    if (practice.kind === "cumulative" && practice.topicId) {
      const s2 = ensure(practice.topicId)!;
      s2.progress.cumulativeBest = Math.max(s2.progress.cumulativeBest ?? 0, score);
      saveProgress(practice.topicId, s2.progress);
    }
    return json({ kind: practice.kind, correct, total, score, passed: score >= 0.8, review });
  }

  res.writeHead(404);
  res.end("not found");
});

// Land on the requested topic, or auto-continue, or the home page.
if (autoContinue && !active) active = homeData().continueTopic;
if (active) ensure(active);

server.listen(port, () => {
  const link = `http://localhost:${port}/`;
  console.log(`\n  Interview-prep lessons — ${lessons.length} available`);
  console.log(`  ${active ? `Opening "${active}"` : "Opening the lesson home page"}`);
  console.log(`\n  ▶  Open ${link}\n`);
  console.log(`  (Ctrl+C to stop. Progress saves to .progress/ — retry anytime.)\n`);
  if (process.env.LESSON_NO_OPEN === "1") return;
  try {
    const cmd = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
    const a = process.platform === "win32" ? ["/c", "start", "", link] : [link];
    spawn(cmd, a, { detached: true, stdio: "ignore" }).unref();
  } catch {
    /* best effort */
  }
});
