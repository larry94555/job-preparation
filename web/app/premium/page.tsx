import Link from "next/link";
import PremiumClient from "./PremiumClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVICES = [
  {
    title: "Code coaching",
    body: "Line-by-line feedback on your solutions — idioms, edge cases, and how a senior engineer would refactor them.",
  },
  {
    title: "Interview coaching",
    body: "Mock interviews with targeted feedback on how you reason out loud, structure answers, and handle follow-ups.",
  },
  {
    title: "Resume coaching",
    body: "A focused review of your resume for AI-engineering roles — impact, framing, and what to cut.",
  },
];

// Premium preview. The three coaching services shown at $1/month; the subscribe
// button is inert for now (see PremiumClient) — previewed, not yet live.
export default function PremiumPage() {
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost mini" href="/">
          ← Home
        </Link>
      </div>
      <div className="eyebrow">Premium · coming soon</div>
      <h1>Premium coaching — $1/month</h1>
      <p className="muted">
        One low price unlocks personal coaching on top of the free lessons. Previewing now;
        not yet available.
      </p>

      <div className="tgrid">
        {SERVICES.map((s) => (
          <div key={s.title} className="tcard">
            <div className="tcard-body">
              <h3>{s.title}</h3>
              <p className="desc">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="eyebrow">Get premium</div>
        <p style={{ marginTop: 4 }}>
          All three services, <strong>$1/month</strong>, cancel anytime.
        </p>
        <PremiumClient />
      </div>
    </main>
  );
}
