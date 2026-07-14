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
 */
export default function SampleClient({ flow }: { flow: Flow }) {
  const [i, setI] = useState(0);
  const total = flow.steps.length;
  const done = i >= total;
  const step = done ? null : flow.steps[i];
  const pct = total ? Math.round((i / total) * 100) : 0;
  const next = () => setI((n) => Math.min(n + 1, total));

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
          <DoneView />
        ) : step?.kind === "material" ? (
          <MaterialStep step={step} onNext={next} />
        ) : step?.kind === "check" ? (
          <CheckStep key={i} question={step.question} onNext={next} />
        ) : step?.kind === "locked" ? (
          <LockedStep onNext={next} />
        ) : null}
      </div>
    </main>
  );
}

function MaterialStep({
  step,
  onNext,
}: {
  step: Extract<SampleStep, { kind: "material" }>;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="eyebrow">{step.lessonTitle}</div>
      <div
        className="material"
        // Server-rendered, sanitized lesson HTML from the content pipeline.
        dangerouslySetInnerHTML={{ __html: `<h2>${escapeHtml(step.heading)}</h2>` + step.html }}
      />
      <div className="row">
        <button onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function CheckStep({
  question,
  onNext,
}: {
  question: SampleQuestionView;
  onNext: () => void;
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
          {(result.correct
            ? "✓ Correct. "
            : "Almost — review the material above and keep going. ") + (result.explanation || "")}
        </div>
      ) : null}
      <div className="row">
        {result ? (
          <button className="ghost" onClick={onNext}>
            Continue →
          </button>
        ) : (
          <button onClick={check} disabled={checking}>
            {checking ? "Checking…" : "Check answer"}
          </button>
        )}
      </div>
    </div>
  );
}

function LockedStep({ onNext }: { onNext: () => void }) {
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
      <div className="row">
        <Link className="btn" href="/signup">
          Sign up free →
        </Link>
        <button className="ghost" onClick={onNext}>
          Skip for now →
        </button>
      </div>
    </div>
  );
}

function DoneView() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>🎉</div>
      <h2>That&apos;s the sample</h2>
      <p className="muted">
        Create a free account to run every lesson end-to-end — graded essays and coding
        exercises, section assessments, and mastery tracking across all topics.
      </p>
      <div className="row" style={{ justifyContent: "center" }}>
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
