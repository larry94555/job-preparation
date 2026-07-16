"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AssessmentData, AssessmentTopic } from "@/lib/lesson-service";

/**
 * The Assessment page grid (Phase 1). Each box shows a topic + its major
 * subtopics, and for the topic and each subtopic four links: Review, Quick
 * Assessment, Full Assessment, Learn. Only "Learn" is wired (→ the lesson); the
 * other three show a transient "not yet implemented" tip. The box FRAME color
 * reflects assessment status — all white for now (status arrives in a later
 * phase); the CSS classes + legend below already describe the intended scheme.
 */

// Frame status → CSS data-status value. Phase 1 always uses "none" (white).
type Status = "none" | "all-green" | "some-green" | "some-red" | "all-red";

const FRAME_LEGEND: { status: Status; label: string }[] = [
  { status: "none", label: "Not yet tested" },
  { status: "all-green", label: "All assessments passed" },
  { status: "some-green", label: "Some passed, some untested" },
  { status: "some-red", label: "Some failed" },
  { status: "all-red", label: "Mostly failed / main assessment failed" },
];

export default function AssessmentClient({ data }: { data: AssessmentData }) {
  const [tip, setTip] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTip = (label: string) => {
    setTip(`${label} — not yet implemented`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTip(null), 1900);
  };

  return (
    <>
      <div className="tgrid">
        {data.items.map((t) => (
          <TopicCard key={t.id} t={t} showTip={showTip} />
        ))}
      </div>

      <div className="legend" style={{ marginTop: 16 }}>
        {FRAME_LEGEND.map((f) => (
          <span key={f.status}>
            <span className={`sw frame-${f.status}`} />
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
                <TopicCard key={t.id} t={t} showTip={showTip} />
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
  showTip,
}: {
  t: AssessmentTopic;
  showTip: (label: string) => void;
}) {
  const status: Status = "none"; // per-user status arrives in a later phase

  if (!t.built) {
    return (
      <div className="acard" data-status="none" style={{ opacity: 0.5 }}>
        <div className="acard-row">
          <h3>{t.title}</h3>
        </div>
        <div className="sub-title">Planned</div>
      </div>
    );
  }

  return (
    <div className="acard" data-status={status}>
      <div className="acard-row acard-topic">
        <h3>{t.title}</h3>
        <LinkRow topicId={t.id} showTip={showTip} />
      </div>
      {t.sections.map((s) => (
        <div className="acard-row acard-sub" key={s.id}>
          <span className="sub-title">{s.title}</span>
          <LinkRow topicId={t.id} showTip={showTip} />
        </div>
      ))}
    </div>
  );
}

function LinkRow({
  topicId,
  showTip,
}: {
  topicId: string;
  showTip: (label: string) => void;
}) {
  return (
    <span className="alinks">
      <button type="button" className="alink quick" onClick={() => showTip("Quick Assessment")}>
        Quick Assessment
      </button>
      <button type="button" className="alink" onClick={() => showTip("Review")}>
        Review
      </button>
      <button type="button" className="alink" onClick={() => showTip("Full Assessment")}>
        Full Assessment
      </button>
      <Link className="alink learn" href={`/lesson/${topicId}`}>
        Learn
      </Link>
    </span>
  );
}
