"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ---- client-safe shapes (mirror the sanitized views the API returns) -----
interface QuestionView {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  inputKind?: "text";
  referencePoints?: string[];
  language?: string;
}
type Step =
  | { kind: "material"; sectionId: string; lessonTitle: string; heading: string; html: string }
  | { kind: "check"; sectionId: string; question: QuestionView }
  | { kind: "apply"; sectionId: string; question: QuestionView }
  | {
      kind: "assessment";
      sectionId: string;
      title: string;
      passThreshold: number;
      items: QuestionView[];
    };
interface DashEntry {
  id: string;
  title: string;
  band: number;
  name: string;
  color: string;
}
interface Band {
  band: number;
  name: string;
  color: string;
}
interface State {
  topic: { id: string; title: string };
  index: number;
  total: number;
  done: boolean;
  currentSectionId: string | null;
  step: Step | null;
  reviewIndex: number | null;
  canGoBack: boolean;
  dashboard: DashEntry[];
  legend: Band[];
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body !== undefined ? "POST" : "GET",
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return (await res.json()) as T;
}

export default function LessonClient({ topic }: { topic: string }) {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const s = await api<State>(`/api/state?topic=${encodeURIComponent(topic)}`);
    setState(s);
    setLoading(false);
  }, [topic]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const advance = useCallback(async () => {
    setLoading(true);
    const s = await api<State>(`/api/next?topic=${encodeURIComponent(topic)}`, {});
    setState(s);
    setLoading(false);
  }, [topic]);

  // Jump to an arbitrary step (clamped server-side) — powers Back + Review.
  const goto = useCallback(
    async (index: number) => {
      setLoading(true);
      const s = await api<State>(`/api/goto?topic=${encodeURIComponent(topic)}`, { index });
      setState(s);
      setLoading(false);
    },
    [topic],
  );

  if (loading && !state) return <main className="wrap">Loading…</main>;
  if (!state || (state as unknown as { error?: string }).error) {
    return (
      <main className="wrap">
        <p>Topic not found.</p>
        <Link className="btn ghost" href="/">
          ← All lessons
        </Link>
      </main>
    );
  }

  const pct = state.total ? Math.round((state.index / state.total) * 100) : 0;

  return (
    <main className="wrap">
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost" href="/">
          ← All lessons
        </Link>
      </div>

      <h1 style={{ marginTop: 16 }}>{state.topic.title}</h1>
      <div className="muted">
        {state.done ? "Complete" : `Step ${state.index + 1} / ${state.total}`}
      </div>
      <div className="progressbar">
        <span style={{ width: `${pct}%` }} />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        {state.done ? (
          <DoneView state={state} />
        ) : state.step ? (
          <StepView
            key={state.index}
            topic={topic}
            step={state.step}
            onNext={advance}
            onBack={state.canGoBack ? () => goto(state.index - 1) : undefined}
            onReview={state.reviewIndex != null ? () => goto(state.reviewIndex as number) : undefined}
          />
        ) : null}
      </div>

      <MasteryPanel dashboard={state.dashboard} legend={state.legend} />
    </main>
  );
}

// ---- mastery dashboard ----------------------------------------------------
function MasteryPanel({ dashboard, legend }: { dashboard: DashEntry[]; legend: Band[] }) {
  return (
    <div className="panel">
      <div className="eyebrow">Mastery</div>
      <div className="dash">
        {dashboard.map((d) => (
          <div className="drow" key={d.id}>
            <span className="chip" style={{ background: d.color }} />
            <span>{d.title}</span>
            <span className="dname">{d.name}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        {legend.map((b) => (
          <span key={b.band}>
            <span className="sw" style={{ background: b.color }} />
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- option inputs (multiple choice / text) -------------------------------
function OptionInputs({
  q,
  name,
  value,
  onChange,
}: {
  q: QuestionView;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  if (q.type === "multiple_choice" && q.options) {
    return (
      <div>
        {q.options.map((opt) => (
          <label key={opt} className={"opt" + (value === opt ? " sel" : "")}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }
  return (
    <input
      className="text"
      value={value}
      placeholder="Type your answer…"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ---- shared nav row (Back on the left, primary actions on the right) ------
function NavRow({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
      <span>
        {onBack ? (
          <button className="ghost" onClick={onBack}>
            ← Back
          </button>
        ) : (
          <span />
        )}
      </span>
      <span className="row" style={{ gap: 8 }}>
        {children}
      </span>
    </div>
  );
}

// ---- step dispatcher ------------------------------------------------------
function StepView({
  topic,
  step,
  onNext,
  onBack,
  onReview,
}: {
  topic: string;
  step: Step;
  onNext: () => void;
  onBack?: () => void;
  onReview?: () => void;
}) {
  if (step.kind === "material") return <MaterialStep step={step} onNext={onNext} onBack={onBack} />;
  if (step.kind === "check")
    return <CheckStep topic={topic} step={step} onNext={onNext} onBack={onBack} onReview={onReview} />;
  if (step.kind === "apply")
    return <ApplyStep topic={topic} step={step} onNext={onNext} onBack={onBack} />;
  return <AssessmentStep topic={topic} step={step} onNext={onNext} onBack={onBack} />;
}

function MaterialStep({
  step,
  onNext,
  onBack,
}: {
  step: Extract<Step, { kind: "material" }>;
  onNext: () => void;
  onBack?: () => void;
}) {
  return (
    <div>
      <div className="eyebrow">{step.lessonTitle}</div>
      <div
        className="material"
        // Server-rendered, sanitized lesson HTML from the content pipeline.
        dangerouslySetInnerHTML={{ __html: `<h2>${escapeHtml(step.heading)}</h2>` + step.html }}
      />
      <NavRow onBack={onBack}>
        <button onClick={onNext}>Continue →</button>
      </NavRow>
    </div>
  );
}

interface AnswerResult {
  correct: boolean;
  explanation: string;
}
function CheckStep({
  topic,
  step,
  onNext,
  onBack,
  onReview,
}: {
  topic: string;
  step: Extract<Step, { kind: "check" }>;
  onNext: () => void;
  onBack?: () => void;
  onReview?: () => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const q = step.question;

  async function check() {
    if (!value || checking) return;
    setChecking(true);
    try {
      const r = await api<AnswerResult>(`/api/answer?topic=${encodeURIComponent(topic)}`, {
        answer: value,
      });
      setResult(r);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <div className="eyebrow">Check your understanding</div>
      <div className="prompt">{q.prompt}</div>
      <OptionInputs q={q} name={`c_${q.id}`} value={value} onChange={setValue} />
      {result ? (
        <div className={"feedback " + (result.correct ? "good" : "soft")}>
          {result.correct ? "✓ Correct. " : "Not quite. "}
          {result.explanation}
          {!result.correct && onReview ? (
            <div style={{ marginTop: 8 }}>
              <button className="ghost mini" onClick={onReview}>
                ↑ Review the material
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <NavRow onBack={onBack}>
        {result ? (
          <button className="ghost" onClick={onNext}>
            Continue →
          </button>
        ) : (
          <>
            <button className="ghost" onClick={onNext}>
              Skip →
            </button>
            <button onClick={check} disabled={checking}>
              {checking ? "Checking…" : "Check answer"}
            </button>
          </>
        )}
      </NavRow>
    </div>
  );
}

// The worker's result (DESIGN §8), returned by the polling route once terminal.
interface JobResult {
  verdict?: string;
  score?: number;
  feedback?: string;
  needsReview?: boolean;
  testsPassed?: boolean;
  testOutput?: string;
}
interface EnqueueResult {
  jobId?: string;
  status?: string;
  error?: string;
}
interface PollResult {
  jobId: string;
  status: "queued" | "running" | "done" | "flagged" | "failed";
  result: JobResult | null;
}
function ApplyStep({
  topic,
  step,
  onNext,
  onBack,
}: {
  topic: string;
  step: Extract<Step, { kind: "apply" }>;
  onNext: () => void;
  onBack?: () => void;
}) {
  const [value, setValue] = useState("");
  const [grading, setGrading] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const q = step.question;

  // Enqueue the submission, then poll the grading job until it reaches a terminal
  // state (done/flagged/failed). The single-slot model grades off-request (§8);
  // the UI honestly shows "grading in progress" meanwhile — never a fake spinner
  // over a synchronous call.
  async function submit() {
    setGrading(true);
    setError(null);
    const enq = await api<EnqueueResult>(`/api/apply?topic=${encodeURIComponent(topic)}`, {
      answer: value,
    });
    if (!enq.jobId) {
      setError(enq.error ?? "Could not submit for grading.");
      setGrading(false);
      return;
    }
    await poll(enq.jobId);
  }

  async function poll(jobId: string) {
    for (let i = 0; i < 60; i++) {
      const r = await api<PollResult>(`/api/grading/${encodeURIComponent(jobId)}`);
      if (r.status === "done" || r.status === "flagged") {
        setResult(r.result);
        setFlagged(r.status === "flagged");
        setGrading(false);
        return;
      }
      if (r.status === "failed") {
        setError("Grading didn't complete — your answer is recorded. Compare with the guidance below.");
        setGrading(false);
        return;
      }
      await new Promise((res) => setTimeout(res, 1000));
    }
    setError("Still grading — your answer is recorded. Compare with the guidance below.");
    setGrading(false);
  }

  const verdictLabel: Record<string, string> = {
    pass: "Mastered",
    borderline: "Almost there",
    fail: "Keep going",
  };

  return (
    <div>
      <div className="eyebrow">Apply it — {q.type}</div>
      <div className="prompt">{q.prompt}</div>
      <textarea
        value={value}
        placeholder={q.type === "code" ? "Write your code here…" : "Write your answer here…"}
        onChange={(e) => setValue(e.target.value)}
      />
      {grading ? (
        <div className="feedback soft">Grading in progress… your answer is submitted; this can take a few seconds.</div>
      ) : null}
      {error ? <div className="feedback soft">{error}</div> : null}
      {result ? (
        <div>
          {result.testsPassed !== undefined ? (
            <div className={"feedback " + (result.testsPassed ? "good" : "soft")}>
              {result.testsPassed
                ? "✓ Tests passed."
                : "Tests not passing yet — check the output and try again."}
            </div>
          ) : null}
          {result.testOutput ? <pre className="out">{result.testOutput}</pre> : null}
          {flagged ? (
            <div className="feedback soft">
              Flagged for human review — the grader wasn&apos;t confident. Your answer is recorded;
              compare with the guidance below meanwhile.
            </div>
          ) : null}
          <div className={"feedback " + (result.verdict === "pass" ? "good" : "soft")}>
            {(result.verdict === "pass" ? "✓ " : "") +
              (verdictLabel[result.verdict ?? ""] ?? result.verdict ?? "") +
              " — " +
              (result.feedback || "")}
          </div>
        </div>
      ) : null}
      {q.referencePoints && q.referencePoints.length ? (
        <div className="refs">
          <div className="eyebrow">What a strong answer covers</div>
          <ul>
            {q.referencePoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <NavRow onBack={onBack}>
        {result ? (
          <button className="ghost" onClick={onNext}>
            Continue →
          </button>
        ) : (
          <button onClick={submit} disabled={grading}>
            Submit for grading
          </button>
        )}
      </NavRow>
    </div>
  );
}

interface AssessResult {
  correct: number;
  total: number;
  score: number;
  passed: boolean;
  bandName: string;
}
function AssessmentStep({
  topic,
  step,
  onNext,
  onBack,
}: {
  topic: string;
  step: Extract<Step, { kind: "assessment" }>;
  onNext: () => void;
  onBack?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessResult | null>(null);

  async function submit() {
    const r = await api<AssessResult>(`/api/assessment?topic=${encodeURIComponent(topic)}`, {
      answers,
    });
    setResult(r);
  }

  const pct = result ? Math.round(result.score * 100) : 0;

  return (
    <div>
      <div className="eyebrow">Section assessment</div>
      <div className="prompt">
        {step.title} — answer all, then submit. Retry as many times as you like.
      </div>
      {step.items.map((q, i) => (
        <div className="qblock" key={q.id}>
          <div className="qnum">Q{i + 1}</div>
          <div className="prompt">{q.prompt}</div>
          <OptionInputs
            q={q}
            name={`a_${q.id}`}
            value={answers[q.id] ?? ""}
            onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
          />
        </div>
      ))}
      {result ? (
        <div className={"feedback " + (result.passed ? "good" : "soft")}>
          {result.passed
            ? `✓ Mastered ${result.correct} / ${result.total} (${pct}%). Section mastery: ${result.bandName}.`
            : `You've got ${result.correct} / ${result.total} (${pct}%). Almost there — review the material and try again whenever you like.`}
        </div>
      ) : null}
      <NavRow onBack={onBack}>
        {result ? (
          <>
            <button onClick={() => setResult(null)}>Try again</button>
            <button className="ghost" onClick={onNext}>
              Continue →
            </button>
          </>
        ) : (
          <button onClick={submit}>Submit assessment</button>
        )}
      </NavRow>
    </div>
  );
}

function DoneView({ state }: { state: State }) {
  const mastered = state.dashboard.filter((s) => s.band >= 3).length;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>🎉</div>
      <h2>You reached the end of this lesson</h2>
      <p className="muted">
        {mastered} of {state.dashboard.length} sections at proficient or above. Retry any
        assessment to push toward bright green.
      </p>
      <div className="row" style={{ justifyContent: "center" }}>
        <Link className="btn" href="/">
          All lessons
        </Link>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
