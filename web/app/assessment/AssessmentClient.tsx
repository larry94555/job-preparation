"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AssessmentData, AssessmentTopic } from "@/lib/lesson-service";
import { clearQA, clearTopicQA, failedOver, isFinished, loadQA } from "@/lib/quick-store";

/**
 * The Assessment page grid (Phase 2). Each box shows a topic + its major
 * subtopics; the topic and each subtopic get Quick Assessment (now live) plus
 * Review / Full Assessment (still a "not yet implemented" tip) and Learn (→ the
 * lesson). Quick-assessment progress + tallies live in the browser (localStorage),
 * so the links reflect started/finished state and the box FRAME turns red when
 * more than 10% of a scope's answers were wrong (bright red for the whole-topic
 * assessment or when >80% of subtopics are red).
 */

const BRIGHT_RED = "#dc2626";
// Light red -> bright red, by fraction of subtopics that are red.
function mixRed(p: number): string {
  const a = [254, 202, 202];
  const b = [220, 38, 38];
  const f = Math.min(Math.max(p, 0), 1);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// Red frame color for a topic from its quick-assessment results, or undefined
// (neutral/white). Depends on the localStorage state → only call when mounted.
function frameColor(t: AssessmentTopic): string | undefined {
  const mainRed = failedOver(loadQA(t.id, null), t.mainTotal);
  const redSubs = t.sections.filter((s) => failedOver(loadQA(t.id, s.id), s.total)).length;
  const frac = t.sections.length ? redSubs / t.sections.length : 0;
  if (mainRed || frac > 0.8) return BRIGHT_RED;
  if (frac > 0) return mixRed(frac / 0.8);
  return undefined;
}

const FRAME_LEGEND: { color: string | undefined; label: string }[] = [
  { color: undefined, label: "Not yet tested" },
  { color: mixRed(0.35), label: "Some subtopics failed (>10% wrong)" },
  { color: BRIGHT_RED, label: "Whole topic or most subtopics failed" },
];

export default function AssessmentClient({ data }: { data: AssessmentData }) {
  const router = useRouter();
  const [tip, setTip] = useState<string | null>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Re-read localStorage after mount and whenever the tab regains focus / storage
  // changes (e.g. returning from a quiz), so links + frames stay current.
  const [tick, setTick] = useState(0);
  const mounted = tick > 0;

  useEffect(() => {
    const rerender = () => setTick((n) => n + 1);
    rerender();
    window.addEventListener("focus", rerender);
    window.addEventListener("storage", rerender);
    return () => {
      window.removeEventListener("focus", rerender);
      window.removeEventListener("storage", rerender);
    };
  }, []);

  const showTip = (label: string) => {
    setTip(`${label} — not yet implemented`);
    if (tipTimer.current) clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setTip(null), 1900);
  };

  // Clear a scope's tallies and (re)start its quiz. Main topic warns first.
  const startOver = (t: AssessmentTopic, sectionId: string | null) => {
    const href = quizHref(t.id, sectionId);
    if (!sectionId) {
      if (!window.confirm("Start over? This clears all tallies for this topic, including its subtopics.")) {
        return;
      }
      clearTopicQA(t.id, t.sections.map((s) => s.id));
    } else {
      clearQA(t.id, sectionId);
    }
    setTick((n) => n + 1);
    router.push(href);
  };

  const cardProps = (t: AssessmentTopic) => ({
    t,
    mounted,
    showTip,
    onStartOver: startOver,
  });

  return (
    <>
      <div className="tgrid">
        {data.items.map((t) => (
          <TopicCard key={t.id} {...cardProps(t)} />
        ))}
      </div>

      <div className="legend" style={{ marginTop: 16 }}>
        {FRAME_LEGEND.map((f) => (
          <span key={f.label}>
            <span className="sw" style={{ border: `2px solid ${f.color ?? "var(--line)"}` }} />
            {f.label}
          </span>
        ))}
      </div>

      <section style={{ marginTop: 40 }}>
        <div className="eyebrow">Independent track</div>
        <h2>Becoming an Agentic AI Engineer in 6 Months</h2>
        {data.agentic.phases.map((phase) => (
          <div key={phase.title} style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {phase.title}
            </div>
            <div className="tgrid">
              {phase.items.map((t) => (
                <TopicCard key={t.id} {...cardProps(t)} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {tip ? <div className="tip-toast">🚧 {tip}</div> : null}
    </>
  );
}

function TopicCard({
  t,
  mounted,
  showTip,
  onStartOver,
}: {
  t: AssessmentTopic;
  mounted: boolean;
  showTip: (label: string) => void;
  onStartOver: (t: AssessmentTopic, sectionId: string | null) => void;
}) {
  if (!t.built) {
    return (
      <div className="acard" style={{ opacity: 0.5 }}>
        <div className="acard-row">
          <h3>{t.title}</h3>
        </div>
        <div className="sub-title">Planned</div>
      </div>
    );
  }

  const frame = mounted ? frameColor(t) : undefined;

  return (
    <div className="acard" style={frame ? { borderColor: frame } : undefined}>
      <div className="acard-row acard-topic">
        <h3>{t.title}</h3>
        <LinkRow t={t} sectionId={null} total={t.mainTotal} mounted={mounted} showTip={showTip} onStartOver={onStartOver} />
      </div>
      {t.sections.map((s) => (
        <div className="acard-row acard-sub" key={s.id}>
          <span className="sub-title">{s.title}</span>
          <LinkRow t={t} sectionId={s.id} total={s.total} mounted={mounted} showTip={showTip} onStartOver={onStartOver} />
        </div>
      ))}
    </div>
  );
}

function quizHref(topicId: string, sectionId: string | null): string {
  return `/assessment/quiz?topic=${encodeURIComponent(topicId)}${
    sectionId ? `&section=${encodeURIComponent(sectionId)}` : ""
  }`;
}

function reviewHref(topicId: string, sectionId: string | null): string {
  return `/assessment/review?topic=${encodeURIComponent(topicId)}${
    sectionId ? `&section=${encodeURIComponent(sectionId)}` : ""
  }`;
}

function LinkRow({
  t,
  sectionId,
  total,
  mounted,
  showTip,
  onStartOver,
}: {
  t: AssessmentTopic;
  sectionId: string | null;
  total: number;
  mounted: boolean;
  showTip: (label: string) => void;
  onStartOver: (t: AssessmentTopic, sectionId: string | null) => void;
}) {
  const href = quizHref(t.id, sectionId);
  const state = mounted ? loadQA(t.id, sectionId) : null;
  const started = !!state;
  const finished = state ? isFinished(state) : false;

  return (
    <span className="alinks">
      {!started ? (
        <Link className="alink quick" href={href}>
          Quick Assessment
        </Link>
      ) : !finished ? (
        <>
          <Link className="alink resume" href={href}>
            Resume
          </Link>
          <button type="button" className="alink" onClick={() => onStartOver(t, sectionId)}>
            Start over
          </button>
        </>
      ) : (
        <button type="button" className="alink quick" onClick={() => onStartOver(t, sectionId)}>
          Retake
        </button>
      )}
      <Link className="alink" href={reviewHref(t.id, sectionId)}>
        Review
      </Link>
      <button type="button" className="alink" onClick={() => showTip("Full Assessment")}>
        Full Assessment
      </button>
      <Link className="alink learn" href={`/lesson/${t.id}`}>
        Learn
      </Link>
    </span>
  );
}
