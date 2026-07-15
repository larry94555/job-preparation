"use client";

import Link from "next/link";
import { useState } from "react";
import type { SampleQuestionView, SampleStep } from "@/lib/lesson-service";
import { gradeSampleCheckAction } from "./actions";

interface Flow {
  topicId: string;
  topicTitle: string;
  steps: SampleStep[];
}

/**
 * The free sample runner — a fully client-side walk through the sample flow. It
 * keeps NO server state: material and checks are pre-rendered from the flow, and
 * a check is graded by a stateless server action (answer keys stay server-side).
 * Essay/code/assessment steps arrive as "locked" cards that invite sign-up.
 *
 * Navigation: Back / Skip on every step, and — on a wrong check — a "Review the
 * material" jump to the step that taught it, plus a plain-English explanation.
 */
export default function SampleClient({ flow }: { flow: Flow }) {
  const [i, setI] = useState(0);
  const total = flow.steps.length;
  const done = i >= total;
  const step = done ? null : flow.steps[i];
  const pct = total ? Math.round((i / total) * 100) : 0;

  const next = () => setI((n) => Math.min(n + 1, total));
  const back = () => setI((n) => Math.max(0, n - 1));
  const canBack = i > 0;
  // Jump to the material step that taught the current check (nearest one before it).
  const reviewMaterial = () => {
    for (let j = i - 1; j >= 0; j--) {
      if (flow.steps[j].kind === "material") {
        setI(j);
        return;
      }
    }
  };

  return (
    <main className="wrap">
      <div className="row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <Link className="btn ghost" href="/">
          ← Home
        </Link>
        <Link className="btn mini" href="/signup">
          Sign up free →
        </Link>
      </div>

      <div className="eyebrow" style={{ marginTop: 16 }}>
        Free sample lesson
      </div>
      <h1 style={{ marginTop: 4 }}>{flow.topicTitle}</h1>
      <p className="muted">
        A taste of the real thing — read the material and try the checks. Graded essays,
        coding exercises, and progress tracking unlock when you{" "}
        <Link href="/signup">create a free account</Link>.
      </p>
      <div className="progressbar">
        <span style={{ width: `${done ? 100 : pct}%` }} />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        {done ? (
          <DoneView onBack={back} />
        ) : step?.kind === "material" ? (
          <MaterialStep step={step} onNext={next} onBack={canBack ? back : undefined} />
        ) : step?.kind === "check" ? (
          <CheckStep
            key={i}
            question={step.question}
            onNext={next}
            onSkip={next}
            onBack={canBack ? back : undefined}
            onReview={reviewMaterial}
          />
        ) : step?.kind === "locked" ? (
          <LockedStep onNext={next} onBack={canBack ? back : undefined} />
        ) : null}
      </div>
    </main>
  );
}

// ---- shared nav row -------------------------------------------------------
function NavRow({
  onBack,
  children,
}: {
  onBack?: () => void;
  children: React.ReactNode;
}) {
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

function MaterialStep({
  step,
  onNext,
  onBack,
}: {
  step: Extract<SampleStep, { kind: "material" }>;
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

function CheckStep({
  question,
  onNext,
  onSkip,
  onBack,
  onReview,
}: {
  question: SampleQuestionView;
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  onReview: () => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    if (!value || checking) return;
    setChecking(true);
    try {
      setResult(await gradeSampleCheckAction(question.id, value));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <div className="eyebrow">Check your understanding</div>
      <div className="prompt">{question.prompt}</div>
      {question.type === "multiple_choice" && question.options ? (
        <div>
          {question.options.map((opt) => (
            <label key={opt} className={"opt" + (value === opt ? " sel" : "")}>
              <input
                type="radio"
                name={`c_${question.id}`}
                value={opt}
                checked={value === opt}
                onChange={() => setValue(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ) : (
        <input
          className="text"
          value={value}
          placeholder="Type your answer…"
          onChange={(e) => setValue(e.target.value)}
        />
      )}
      {result ? (
        <div className={"feedback " + (result.correct ? "good" : "soft")}>
          {result.correct ? "✓ Correct. " : "Not quite. "}
          {result.explanation}
          {!result.correct ? (
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
            <button className="ghost" onClick={onSkip}>
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

function LockedStep({ onNext, onBack }: { onNext: () => void; onBack?: () => void }) {
  return (
    <div>
      <div className="eyebrow">🔒 Members only</div>
      <div className="prompt" style={{ marginBottom: 8 }}>
        Sign up to unlock graded essays &amp; coding exercises
      </div>
      <p className="muted">
        This step is a graded exercise — an essay, a coding task, or a section assessment. A
        free account unlocks these, along with LLM feedback on your answers and progress
        tracking across every topic.
      </p>
      <NavRow onBack={onBack}>
        <Link className="btn" href="/signup">
          Sign up free →
        </Link>
        <button className="ghost" onClick={onNext}>
          Skip for now →
        </button>
      </NavRow>
    </div>
  );
}

function DoneView({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>🎉</div>
      <h2>That&apos;s the sample</h2>
      <p className="muted">
        Create a free account to run every lesson end-to-end — graded essays and coding
        exercises, section assessments, and mastery tracking across all topics.
      </p>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="ghost" onClick={onBack}>
          ← Back
        </button>
        <Link className="btn" href="/signup">
          Sign up free →
        </Link>
        <Link className="btn ghost" href="/topics">
          Browse all topics
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
