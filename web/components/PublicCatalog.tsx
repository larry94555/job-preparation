import Link from "next/link";
import type { CatalogData } from "@/lib/lesson-service";

/**
 * The full topic catalog (core grid + the six agentic-track phases), rendered
 * with each topic's title + description but NO per-user progress. Used on the
 * public home page and the `/topics` page.
 *
 * `signedIn` decides where "Start lesson" points: a signed-in visitor goes
 * straight into the lesson runner; an anonymous visitor is sent to `/signup`,
 * so the whole catalog is browsable but the lessons themselves stay gated.
 */
export default function PublicCatalog({
  catalog,
  signedIn,
}: {
  catalog: CatalogData;
  signedIn: boolean;
}) {
  const startHref = (id: string) => (signedIn ? `/lesson/${id}` : "/signup");

  return (
    <>
      <div className="tgrid">
        {catalog.items.map((it) => (
          <div key={it.id} className="tcard">
            <div className="tcard-body">
              <h3>{it.title}</h3>
              <p className="desc">{it.description}</p>
            </div>
            <div className="tactions">
              <Link className="btn mini" href={startHref(it.id)}>
                Start lesson →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Independent track: Agentic AI Engineer ---- */}
      <section style={{ marginTop: 48 }}>
        <div className="eyebrow">Independent track</div>
        <h2>Becoming an Agentic AI Engineer in 6 Months</h2>
        <p className="muted">
          A complete, standalone path from Python async foundations to shipping a real agent —
          build systems that decide what to do, not just do what they&apos;re told.{" "}
          {catalog.agentic.built} of {catalog.agentic.total} topics built.
        </p>

        {catalog.agentic.phases.map((phase) => (
          <div key={phase.title} style={{ marginTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {phase.title}
            </div>
            <div className="tgrid">
              {phase.items.map((it) =>
                it.built ? (
                  <div key={it.id} className="tcard">
                    <div className="tcard-body">
                      <h3>{it.title}</h3>
                      <p className="desc">{it.description}</p>
                    </div>
                    <div className="tactions">
                      <Link className="btn ghost mini" href={startHref(it.id)}>
                        Start lesson →
                      </Link>
                    </div>
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
    </>
  );
}
