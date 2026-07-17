"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearQA,
  clearTopicQA,
  isFinished,
  loadQA,
  newSeed,
  optionOrder,
  type QAResult,
  type QAState,
  saveQA,
  shuffleSeeded,
  tallies,
} from "@/lib/quick-store";
import { gradeQuick } from "../actions";

interface QuickQuestion {
  id: string;
  prompt: string;
  options: string[];
  subtopic: string;
}
interface Data {
  topicId: string;
  topicTitle: string;
  sectionId: string | null;
  sectionTitle: string | null;
  sectionIds: string[];
  questions: QuickQuestion[];
}
type Picked = { choice: string; correct: boolean; explanation: string };
const EMPTY: QAResult = { wrongTried: [], solved: false };

export default function QuickQuizClient({ data }: { data: Data }) {
  const qById = useMemo(() => new Map(data.questions.map((q) => [q.id, q])), [data.questions]);
  const [state, setState] = useState<QAState | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [checking, setChecking] = useState(false);

  const freshState = useCallback((): QAState => {
    const seed = newSeed();
    return { seed, order: shuffleSeeded(data.questions.map((q) => q.id), seed), index: 0, results: {} };
  }, [data.questions]);

  useEffect(() => {
    const existing = loadQA(data.topicId, data.sectionId);
    const ids = new Set(data.questions.map((q) => q.id));
    const valid =
      existing &&
      existing.order.length === data.questions.length &&
      existing.order.every((id) => ids.has(id));
    const s = valid ? existing! : freshState();
    if (!valid) saveQA(data.topicId, data.sectionId, s);
    setState(s);
    setPicked(null);
  }, [data, freshState]);

  const persist = useCallback(
    (s: QAState) => {
      saveQA(data.topicId, data.sectionId, s);
      setState({ ...s });
    },
    [data.topicId, data.sectionId],
  );

  const goTo = useCallback((idx: number) => {
    setPicked(null);
    setState((s) => {
      if (!s) return s;
      const next = { ...s, index: idx };
      saveQA(data.topicId, data.sectionId, next);
      return next;
    });
  }, [data.topicId, data.sectionId]);

  function startAgain() {
    if (!data.sectionId) {
      if (!window.confirm("Start over? This clears all tallies for this topic, including its subtopics.")) {
        return;
      }
      clearTopicQA(data.topicId, data.sectionIds);
    } else {
      clearQA(data.topicId, data.sectionId);
    }
    setPicked(null);
    persist(freshState());
  }

  if (!state) return <div className="panel">Loading…</div>;

  const t = tallies(state);
  const total = state.order.length;
  const finished = isFinished(state);
  const isSolved = (idx: number) => !!state.results[state.order[idx]]?.solved;
  const firstUnsolved = state.order.findIndex((_, idx) => !isSolved(idx));

  async function pick(choice: string) {
    if (checking) return;
    const qid = state!.order[state!.index];
    if (!qid) return;
    const cur = state!.results[qid] ?? EMPTY;
    if (!cur.solved && cur.wrongTried.includes(choice)) return; // pre-solve: don't re-try a wrong one
    setChecking(true);
    try {
      const r = await gradeQuick(data.topicId, qid, choice);
      setPicked({ choice, correct: r.correct, explanation: r.explanation });
      if (!cur.solved) {
        const next: QAResult = r.correct
          ? { ...cur, solved: true, solvedChoice: choice, solvedExplanation: r.explanation }
          : {
              ...cur,
              wrongTried: cur.wrongTried.includes(choice) ? cur.wrongTried : [...cur.wrongTried, choice],
              lastWrongExplanation: r.explanation,
            };
        persist({ ...state!, results: { ...state!.results, [qid]: next } });
      }
      // Already solved → this is exploration: show the reason, but don't change
      // results or the failed-attempts tally.
    } finally {
      setChecking(false);
    }
  }

  const header = (
    <div className="row" style={{ marginTop: 0, justifyContent: "space-between" }}>
      <Link className="btn ghost mini" href="/assessment">
        ← Assessment
      </Link>
      {!finished ? (
        <span style={{ fontWeight: 600 }}>
          Question {state.index + 1} / {total}
        </span>
      ) : null}
    </div>
  );
  const scopeTitle = data.sectionTitle ? `${data.topicTitle}: ${data.sectionTitle}` : data.topicTitle;

  if (finished) {
    return (
      <div>
        {header}
        <div className="eyebrow" style={{ marginTop: 12 }}>
          Quick assessment complete
        </div>
        <h1>{scopeTitle}</h1>
        <TallyRow t={t} total={total} />
        {firstUnsolved >= 0 ? (
          <p className="muted">You still have {total - t.correct} question(s) unanswered.</p>
        ) : null}
        <div className="row" style={{ marginTop: 12 }}>
          {firstUnsolved >= 0 ? (
            <button onClick={() => goTo(firstUnsolved)}>Review remaining →</button>
          ) : null}
          <button className="ghost" onClick={startAgain}>
            Start again
          </button>
          <Link className="btn ghost" href="/assessment">
            ← Back to assessment
          </Link>
        </div>
      </div>
    );
  }

  const qid = state.order[state.index];
  const q = qById.get(qid);
  const res = state.results[qid] ?? EMPTY;
  const opts = q ? optionOrder(q.options, state.seed, qid) : [];
  // Index of the next UNSOLVED question other than the current one (scan forward,
  // wrapping). "Proceed to next question" only appears when it lands somewhere
  // other than the plain next step (Skip/Continue → index+1); otherwise it would
  // be redundant with Skip.
  let nextUnsolvedIdx: number | null = null;
  for (let k = 1; k < state.order.length; k++) {
    const idx = (state.index + k) % state.order.length;
    if (!isSolved(idx)) {
      nextUnsolvedIdx = idx;
      break;
    }
  }
  const showProceed = nextUnsolvedIdx !== null && nextUnsolvedIdx !== state.index + 1;

  const badge = res.solved
    ? { cls: "correct", label: "✓ Correct" }
    : res.wrongTried.length > 0
      ? { cls: "wrong", label: "Incorrect — try again" }
      : { cls: "none", label: "Please select an answer." };

  // Feedback to show: the current pick, else the persisted state for this item.
  const fb: { correct: boolean; explanation: string; exploring: boolean } | null = picked
    ? { correct: picked.correct, explanation: picked.explanation, exploring: res.solved && !picked.correct }
    : res.solved && res.solvedExplanation
      ? { correct: true, explanation: res.solvedExplanation, exploring: false }
      : !res.solved && res.wrongTried.length > 0 && res.lastWrongExplanation
        ? { correct: false, explanation: res.lastWrongExplanation, exploring: false }
        : null;
  const checkedChoice = picked ? picked.choice : res.solved ? res.solvedChoice : undefined;

  return (
    <div>
      {header}
      <div className="eyebrow" style={{ marginTop: 12 }}>
        {data.sectionId ? "Subtopic quick assessment" : "Topic quick assessment"}
      </div>
      <h1 style={{ marginTop: 4 }}>{scopeTitle}</h1>
      <TallyRow t={t} total={total} />

      <div className="panel" style={{ marginTop: 14 }}>
        <div
          className="muted"
          style={{ fontSize: 13, display: "flex", justifyContent: "space-between", gap: 8 }}
        >
          <span>
            Topic: {data.topicTitle}
            {q?.subtopic ? ` · Subtopic: ${q.subtopic}` : ""}
          </span>
          <a
            className="alink"
            href={`/assessment/review/context?topic=${encodeURIComponent(data.topicId)}${
              data.sectionId ? `&section=${encodeURIComponent(data.sectionId)}` : ""
            }&q=${encodeURIComponent(qid)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            context ↗
          </a>
        </div>
        <div className="prompt" style={{ marginTop: 6 }}>
          {q?.prompt}
        </div>
        <div className={"qstate " + badge.cls}>{badge.label}</div>
        <div>
          {opts.map((opt) => {
            const triedPre = !res.solved && res.wrongTried.includes(opt);
            const checked = checkedChoice === opt;
            return (
              <label key={opt} className={"opt" + (checked ? " sel" : "") + (triedPre ? " tried" : "")}>
                <input
                  type="radio"
                  name={`q_${qid}`}
                  disabled={triedPre || checking}
                  checked={checked}
                  onChange={() => pick(opt)}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {res.solved ? (
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            Answered — you can still click any option to see why it&apos;s right or wrong.
          </div>
        ) : null}
        {fb ? (
          <div className={"feedback " + (fb.correct ? "good" : "soft")}>
            {fb.exploring ? "This option is incorrect. " : fb.correct ? "✓ Correct. " : "✗ Not quite. "}
            {fb.explanation}
            {!fb.correct && !res.solved ? (
              <div style={{ marginTop: 6 }}>Pick a different answer to try again.</div>
            ) : null}
          </div>
        ) : null}

        <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
          <span className="row" style={{ gap: 8 }}>
            {state.index > 0 ? (
              <button className="ghost" onClick={() => goTo(state.index - 1)}>
                ← Back
              </button>
            ) : null}
            <button className="ghost" onClick={startAgain}>
              Start again
            </button>
          </span>
          <span className="row" style={{ gap: 8 }}>
            {showProceed ? (
              <button className="ghost" onClick={() => goTo(nextUnsolvedIdx!)}>
                Proceed to next question →
              </button>
            ) : null}
            {res.solved ? (
              <button onClick={() => goTo(state.index + 1)}>
                {state.index + 1 < total ? "Continue →" : "Finish →"}
              </button>
            ) : (
              <button className="ghost" onClick={() => goTo(state.index + 1)}>
                Skip →
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function TallyRow({
  t,
  total,
}: {
  t: { correct: number; incorrect: number; failed: number };
  total: number;
}) {
  return (
    <div className="qtally">
      <span className="qt good">Correct {t.correct}</span>
      <span className="qt soft">Incorrect {t.incorrect}</span>
      <span className="qt">Failed attempts {t.failed}</span>
      <span className="qt muted">/ {total} questions</span>
    </div>
  );
}
