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

export default function QuickQuizClient({ data }: { data: Data }) {
  const qById = useMemo(() => new Map(data.questions.map((q) => [q.id, q])), [data.questions]);
  const [state, setState] = useState<QAState | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [checking, setChecking] = useState(false);

  const freshState = useCallback((): QAState => {
    const seed = newSeed();
    return { seed, order: shuffleSeeded(data.questions.map((q) => q.id), seed), index: 0, results: {} };
  }, [data.questions]);

  // Resume a valid saved attempt, or start a fresh one.
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
  const qid = state.order[state.index];
  const q = qid ? qById.get(qid) : undefined;
  const res = (qid && state.results[qid]) || { wrongTried: [], solved: false };

  async function pick(choice: string) {
    if (checking || !qid || res.wrongTried.includes(choice) || res.solved) return;
    setChecking(true);
    try {
      const r = await gradeQuick(data.topicId, qid, choice);
      setPicked({ choice, correct: r.correct, explanation: r.explanation });
      const cur = state!.results[qid] ?? { wrongTried: [], solved: false };
      const next: typeof cur = {
        wrongTried: r.correct || cur.wrongTried.includes(choice) ? cur.wrongTried : [...cur.wrongTried, choice],
        solved: cur.solved || r.correct,
      };
      persist({ ...state!, results: { ...state!.results, [qid]: next } });
    } finally {
      setChecking(false);
    }
  }
  function advance() {
    setPicked(null);
    persist({ ...state!, index: state!.index + 1 });
  }

  const header = (
    <div className="row" style={{ marginTop: 0, justifyContent: "space-between" }}>
      <Link className="btn ghost mini" href="/assessment">
        ← Assessment
      </Link>
      {!finished ? (
        <span className="muted">
          Question {state.index + 1} of {total}
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
        <div className="row" style={{ marginTop: 12 }}>
          <button onClick={startAgain}>Start again</button>
          <Link className="btn ghost" href="/assessment">
            ← Back to assessment
          </Link>
        </div>
      </div>
    );
  }

  const opts = q ? optionOrder(q.options, state.seed, qid) : [];

  return (
    <div>
      {header}
      <div className="eyebrow" style={{ marginTop: 12 }}>
        {data.sectionId ? "Subtopic quick assessment" : "Topic quick assessment"}
      </div>
      <h1 style={{ marginTop: 4 }}>{scopeTitle}</h1>
      <TallyRow t={t} total={total} />

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="muted" style={{ fontSize: 13 }}>
          Topic: {data.topicTitle}
          {q?.subtopic ? ` · Subtopic: ${q.subtopic}` : ""}
        </div>
        <div className="prompt" style={{ marginTop: 6 }}>
          {q?.prompt}
        </div>
        <div>
          {opts.map((opt) => {
            const tried = res.wrongTried.includes(opt);
            const chosenRight = picked?.correct && picked.choice === opt;
            return (
              <label key={opt} className={"opt" + (chosenRight ? " sel" : "") + (tried ? " tried" : "")}>
                <input
                  type="radio"
                  name={`q_${qid}`}
                  disabled={tried || checking || res.solved}
                  checked={!!chosenRight}
                  onChange={() => pick(opt)}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {picked ? (
          <div className={"feedback " + (picked.correct ? "good" : "soft")}>
            {picked.correct ? "✓ Correct. " : "✗ Not quite. "}
            {picked.explanation}
            {!picked.correct ? (
              <div style={{ marginTop: 6 }}>Pick a different answer to try again.</div>
            ) : null}
          </div>
        ) : null}
        <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
          <button className="ghost" onClick={startAgain}>
            Start again
          </button>
          {res.solved || picked?.correct ? (
            <button onClick={advance}>
              {state.index + 1 < total ? "Continue →" : "Finish →"}
            </button>
          ) : (
            <span />
          )}
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
