"use client";

import Link from "next/link";
import { useState } from "react";
import Material from "@/components/Material";
import type { SampleQuestionView, SampleStep } from "@/lib/lesson-service";
import { gradeSampleCheckAction } from "./actions";

interface Flow {
  topicId: string;
  topicTitle: string;
  seed: number;
  steps: SampleStep[];
}

/**
 * The free sample runner — a fully client-side walk through the sample flow. It
 * keeps NO server state: material and checks are pre-rendered from the flow, and
 * a check is graded by a stateless server action (answer keys stay server-side).
 * Gated essay/code/assessment steps are omitted; a single "registered users only"
 * gate is shown once at the very end (never inline).
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
          <EndGate onBack={back} />
        ) : step?.kind === "material" ? (
          <MaterialStep step={step} onNext={next} onBack={canBack ? back : undefined} />
        ) : step?.kind === "check" ? (
          <CheckStep
            key={i}
            question={step.question}
            seed={flow.seed}
            onNext={next}
            onSkip={next}
            onBack={canBack ? back : undefined}
            onReview={reviewMaterial}
          />
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
      <Material heading={step.heading} html={step.html} />
      <NavRow onBack={onBack}>
        <button onClick={onNext}>Continue →</button>
      </NavRow>
    </div>
  );
}

function CheckStep({
  question,
  seed,
  onNext,
  onSkip,
  onBack,
  onReview,
}: {
  question: SampleQuestionView;
  seed: number;
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
      setResult(await gradeSampleCheckAction(question.id, value, seed));
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

// The single end-of-sample gate. Shown ONCE, only after the last material/check —
// never inline. Graded essays, coding, section assessments, and progress tracking
// are for registered users. Choices: Back, Provide feedback, Sign up.
function EndGate({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <div className="eyebrow">🔒 Registered users only</div>
      <h2 style={{ marginTop: 4 }}>That&apos;s the free sample</h2>
      <p className="muted">
        You&apos;ve reached the end of the sample. Graded essays and coding exercises, section
        assessments, LLM feedback on your answers, and mastery tracking across every topic are
        for registered users — and creating an account is free.
      </p>
      <NavRow onBack={onBack}>
        <Link className="btn ghost" href="/feedback">
          Provide feedback
        </Link>
        <Link className="btn" href="/signup">
          Sign up free →
        </Link>
      </NavRow>
    </div>
  );
}

