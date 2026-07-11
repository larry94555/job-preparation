import Link from "next/link";
import { redirect } from "next/navigation";
import { analyticsData } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A never-red green used for the trend line + bars (mirrors app/index.html).
const TREND = "#34C759";

function Sparkline({ points }: { points: { t: number; pct: number }[] }) {
  const w = 320;
  const h = 64;
  const pad = 4;
  if (!points.length) {
    return (
      <p className="muted">
        No mastery history yet — play a lesson and it will appear here.
      </p>
    );
  }
  const xs = (i: number) =>
    pad + (points.length === 1 ? w - 2 * pad : (i * (w - 2 * pad)) / (points.length - 1));
  const ys = (v: number) => h - pad - (v / 100) * (h - 2 * pad);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(p.pct).toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="64" role="img" aria-label="Mastery trend">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
      <path d={d} fill="none" stroke={TREND} strokeWidth={2} />
      <circle cx={xs(points.length - 1)} cy={ys(last.pct)} r={3} fill={TREND} />
    </svg>
  );
}

function Stat({ big, label }: { big: string | number; label: string }) {
  return (
    <div className="stat">
      <div className="statbig">{big}</div>
      <div className="muted" style={{ fontSize: 13 }}>
        {label}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login");
  const a = await analyticsData(userId);
  const m = a.masteryNow;
  const r = a.retention;

  return (
    <main className="wrap">
      <div className="eyebrow">Analytics</div>
      <div className="row" style={{ justifyContent: "space-between", marginTop: 0 }}>
        <h1 style={{ margin: 0 }}>Mastery over time · retention</h1>
        <Link className="btn ghost" href="/">
          ← All lessons
        </Link>
      </div>

      <div className="panel">
        <div className="eyebrow">Where you are now</div>
        <div className="kpis">
          <Stat big={`${m.avgPct}%`} label="avg mastery" />
          <Stat big={`${m.proficientSections}/${m.totalSections}`} label="sections proficient+" />
          <Stat big={m.masteredSections} label="sections mastered" />
        </div>
      </div>

      <div className="panel">
        <h2>Mastery over time</h2>
        <p className="muted">
          Average mastery across all topics, each point a moment your mastery changed.
        </p>
        <Sparkline points={a.trend} />
      </div>

      <div className="panel">
        <h2>Retention (spaced repetition)</h2>
        <div className="kpis">
          <Stat big={r.dueNow} label="due now" />
          <Stat big={r.dueSoon} label="due <24h" />
          <Stat big={r.dueWeek} label="due <7d" />
          <Stat big={r.matured} label="well-retained" />
          <Stat big={r.scheduled} label="tracked" />
          <Stat big={`${r.avgIntervalDays}d`} label="avg interval" />
        </div>
      </div>

      <h2 style={{ margin: "6px 0" }}>By topic</h2>
      <div className="tgrid">
        {a.perTopic.map((t) => (
          <Link className="tcard" href={`/lesson/${t.id}`} key={t.id}>
            <h3>{t.title}</h3>
            <div className="activity">
              {t.scorePct}% · {t.proficient}/{t.sections} sections proficient+
            </div>
            <div className="progressbar" style={{ marginTop: 10 }}>
              <span style={{ width: `${t.scorePct}%`, background: TREND }} />
            </div>
          </Link>
        ))}
      </div>

      <div className="legend">
        {a.legend.map((b) => (
          <span key={b.band}>
            <span className="sw" style={{ background: b.color }} />
            {b.name}
          </span>
        ))}
      </div>
    </main>
  );
}
