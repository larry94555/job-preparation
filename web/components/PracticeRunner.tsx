"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// ---- client-safe shapes (mirror the sanitized views the API returns) -----
interface ItemView {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  inputKind?: "text";
}
interface Descriptor {
  kind: "review" | "mock" | "cumulative";
  topic?: string;
  now: number;
}
interface StartResult {
  empty?: boolean;
  kind: "review" | "mock" | "cumulative";
  topic?: string;
  title: string;
  timeLimitSec?: number;
  items: ItemView[];
  descriptor: Descriptor;
  error?: string;
}
interface GradeResult {
  kind: "review" | "mock" | "cumulative";
  correct: number;
  total: number;
  score: number;
  passed: boolean;
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body !== undefined ? "POST" : "GET",
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return (await res.json()) as T;
}

function fmtClock(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = String(Math.max(0, sec) % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Question-by-question practice flow (review / mock / cumulative). Mirrors the
 * behavior of app/index.html's renderPractice: a countdown timer for mock, and
 * a friendly, never-red end report.
 */
export default function PracticeRunner({
  kind,
  topic,
  backHref = "/",
}: {
  kind: "review" | "mock" | "cumulative";
  topic?: string;
  backHref?: string;
}) {
  const [start, setStart] = useState<StartResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // (Re)load the practice set whenever kind/topic/attempt changes.
  useEffect(() => {
    let alive = true;
    setStart(null);
    setResult(null);
    setAnswers({});
    setRemaining(null);
    clearTimer();
    api<StartResult>("/api/practice/start", topic ? { kind, topic } : { kind }).then((s) => {
      if (!alive) return;
      setStart(s);
      if (s.timeLimitSec) setRemaining(s.timeLimitSec);
    });
    return () => {
      alive = false;
    };
  }, [kind, topic, attempt, clearTimer]);

  const submit = useCallback(async () => {
    if (!start || submitting) return;
    clearTimer();
    setSubmitting(true);
    const r = await api<GradeResult>("/api/practice/grade", {
      descriptor: start.descriptor,
      answers,
    });
    setResult(r);
    setSubmitting(false);
  }, [start, answers, submitting, clearTimer]);

  // Countdown timer (mock only). Auto-submits at zero.
  useEffect(() => {
    if (remaining === null || result) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null) return r;
        if (r <= 1) {
          clearTimer();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return clearTimer;
  }, [remaining !== null, result, clearTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (remaining === 0 && start && !result && !submitting) void submit();
  }, [remaining, start, result, submitting, submit]);

  if (!start) {
    return (
      <div className="panel">
        <p className="muted">Loading practice…</p>
      </div>
    );
  }

  if (start.error) {
    return (
      <div className="panel">
        <p className="muted">Couldn&apos;t start practice: {start.error}</p>
        <div className="row">
          <Link className="btn ghost" href={backHref}>
            Back
          </Link>
        </div>
      </div>
    );
  }

  if (start.empty) {
    return (
      <div className="panel" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44 }}>✓</div>
        <h2>Nothing due right now</h2>
        <p className="muted">
          You&apos;re caught up on reviews. Come back later, or keep going through the lessons.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link className="btn" href={backHref}>
            Back to lessons
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    const pct = Math.round(result.score * 100);
    const label =
      result.kind === "review"
        ? "Review complete"
        : result.passed
          ? "Strong result"
          : "Good practice";
    const note =
      result.kind === "review"
        ? "Items you missed will come back sooner; the rest are scheduled further out."
        : "Retry any time — mastery only moves forward.";
    return (
      <div className="panel">
        <div className="feedback good">
          {label}: {result.correct} / {result.total} ({pct}%). {note}
        </div>
        <div className="row">
          <button type="button" onClick={() => setAttempt((a) => a + 1)}>
            Try again
          </button>
          <Link className="btn ghost" href={backHref}>
            Back to lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: "space-between", marginTop: 0 }}>
        <h2 style={{ margin: 0 }}>{start.title}</h2>
        <span className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>
          {remaining !== null ? `⏱ ${fmtClock(remaining)}` : `${start.items.length} questions`}
        </span>
      </div>
      {start.items.map((q, i) => (
        <div className="qblock" key={q.id}>
          <div className="qnum">Q{i + 1}</div>
          <div className="prompt">{q.prompt}</div>
          {q.options ? (
            <div>
              {q.options.map((opt) => {
                const sel = answers[q.id] === opt;
                return (
                  <label className={`opt${sel ? " sel" : ""}`} key={opt}>
                    <input
                      type="radio"
                      name={`p_${q.id}`}
                      checked={sel}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <input
              className="text"
              placeholder="Type your answer…"
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <div className="row">
        <button type="button" onClick={submit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
        <Link className="btn ghost" href={backHref}>
          Cancel
        </Link>
      </div>
    </div>
  );
}
