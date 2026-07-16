import Link from "next/link";
import PublicCatalog from "@/components/PublicCatalog";
import UserBar from "@/components/UserBar";
import { catalogData, homeData } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Home hub — a Server Component that reads content + progress directly via the
// lesson service (no client fetch needed for the initial render). Anonymous
// visitors get a public catalog + a sign-up call to action; signed-in users get
// the full progress-aware hub below (unchanged).
export default async function HomePage() {
  const userId = await currentUserId();
  if (!userId) {
    const catalog = await catalogData();
    return (
      <main className="wrap">
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 0 }}>
          <Link className="btn ghost mini" href="/login">
            Sign in
          </Link>
        </div>
        <div className="eyebrow">Interview prep</div>
        <h1>AI-engineering lessons</h1>
        <p className="muted">
          {catalog.items.length} core topics plus a {catalog.agentic.total}-topic agentic
          track — browse every topic free with sign up.
        </p>
        <p style={{ marginTop: 4 }}>
          <Link className="btn ghost" href="/assessment">
            Free Assessment of Knowledge →
          </Link>
        </p>

        <div className="panel">
          <div className="eyebrow">Free</div>
          <p style={{ marginTop: 4 }}>
            <strong>Free — create an account to unlock every lesson.</strong> No credit card.
            You can try one sample lesson right now without signing up.
          </p>
          <div className="row">
            <Link className="btn" href="/signup">
              Sign up free →
            </Link>
            <Link className="btn ghost" href="/sample">
              Try the sample lesson →
            </Link>
          </div>
        </div>

        <PublicCatalog catalog={catalog} signedIn={false} />
      </main>
    );
  }
  const data = await homeData(userId);

  return (
    <main className="wrap">
      <UserBar />
      <div className="eyebrow">Interview prep</div>
      <h1>AI-engineering lessons</h1>
      <p className="muted">
        {data.items.length} topics · {data.readinessPct}% section readiness ·{" "}
        {data.masteredTopics} topics fully proficient
      </p>
      <p style={{ marginTop: 4 }}>
        <Link className="btn ghost" href="/assessment">
          Free Assessment of Knowledge →
        </Link>
      </p>

      <div className="panel">
        <div className="eyebrow">Pick up where you left off</div>
        <div className="row">
          {data.continueTopic ? (
            <Link className="btn" href={`/lesson/${data.continueTopic}`}>
              Continue →
            </Link>
          ) : null}
          {data.dueCount > 0 ? (
            <Link className="btn ghost" href="/practice?kind=review">
              Review {data.dueCount} due →
            </Link>
          ) : null}
          <Link className="btn ghost" href="/analytics">
            Analytics →
          </Link>
          <Link className="btn ghost" href="/models" target="_blank" rel="noopener noreferrer">
            Grader model ↗
          </Link>
        </div>
      </div>

      <div className="tgrid">
        {data.items.map((it) => (
          <div key={it.id} className="tcard">
            <Link className="tcard-body" href={`/lesson/${it.id}`}>
              <h3>{it.title}</h3>
              <p className="desc">{it.description}</p>
              <div className="activity">
                {it.activity}
                {it.fullyMastered ? " · mastered" : ""}
              </div>
              <div className="bands" aria-label="section mastery">
                {it.dashboard.map((d) => (
                  <span
                    key={d.id}
                    className="band"
                    style={{ background: d.color }}
                    title={`${d.title}: ${d.name}`}
                  />
                ))}
              </div>
            </Link>
            <div className="tactions">
              <Link className="btn ghost mini" href={`/practice?kind=mock&topic=${it.id}`}>
                Mock
              </Link>
              <Link className="btn ghost mini" href={`/practice?kind=cumulative&topic=${it.id}`}>
                Cumulative
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="legend">
        {data.legend.map((b) => (
          <span key={b.band}>
            <span className="sw" style={{ background: b.color }} />
            {b.name}
          </span>
        ))}
      </div>

      {/* ---- Independent track: Agentic AI Engineer ---- */}
      <section style={{ marginTop: 48 }}>
        <div className="eyebrow">Independent track</div>
        <h2>Becoming an Agentic AI Engineer in 6 Months</h2>
        <p className="muted">
          A complete, standalone path from Python async foundations to shipping a real agent — build
          systems that decide what to do, not just do what they&apos;re told. {data.agentic.built} of{" "}
          {data.agentic.total} topics built.
        </p>

        {data.agentic.phases.map((phase) => (
          <div key={phase.title} style={{ marginTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{phase.title}</div>
            <div className="tgrid">
              {phase.items.map((it) =>
                it.built ? (
                  <div key={it.id} className="tcard">
                    <Link className="tcard-body" href={`/lesson/${it.id}`}>
                      <h3>{it.title}</h3>
                      <p className="desc">{it.description}</p>
                      <div className="activity">
                        {it.activity}
                        {it.fullyMastered ? " · mastered" : ""}
                      </div>
                      <div className="bands" aria-label="section mastery">
                        {it.dashboard.map((d) => (
                          <span
                            key={d.id}
                            className="band"
                            style={{ background: d.color }}
                            title={`${d.title}: ${d.name}`}
                          />
                        ))}
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div key={it.id} className="tcard" style={{ opacity: 0.5 }}>
                    <div className="tcard-body">
                      <h3>{it.title}</h3>
                      <div className="activity">Planned</div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
