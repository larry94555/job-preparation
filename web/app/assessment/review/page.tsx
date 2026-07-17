import Link from "next/link";
import Material from "@/components/Material";
import { reviewData } from "@/lib/lesson-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The Review "cheat sheet" (Phase 3). ?topic=<id> (whole topic) or
// ?topic=<id>&section=<sectionId> (one subtopic) shows page 1 — the section
// roadmaps reframed into a quick reference. ?page=<id> shows an authored extra
// cheat sheet (topics/<t>/review/*.md) that goes deeper on what a set of quiz
// questions needs. Paginated with Back/Continue; public; authored content.
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; section?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const data = await reviewData(sp.topic ?? "", sp.section ?? null, sp.page ?? null);

  if (!data) {
    return (
      <main className="wrap">
        <p className="muted">No review sheet is available for that topic yet.</p>
        <Link className="btn ghost" href="/assessment">
          ← Back to assessment
        </Link>
      </main>
    );
  }

  const scopeTitle = data.sectionTitle
    ? `${data.topicTitle}: ${data.sectionTitle}`
    : data.topicTitle;
  const isSheet = data.pageId === null;

  return (
    <main className="wrap">
      <div className="row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <Link className="btn ghost mini" href="/assessment">
          ← Assessment
        </Link>
        {data.total > 1 ? (
          <span style={{ fontWeight: 600 }}>
            Page {data.index + 1} / {data.total}
          </span>
        ) : null}
      </div>
      <div className="eyebrow" style={{ marginTop: 12 }}>
        Review · cheat sheet
      </div>
      <h1 style={{ marginTop: 4 }}>{isSheet ? scopeTitle : data.pageTitle}</h1>
      <p className="muted">
        {isSheet
          ? `A quick reference to the key ideas and terms${
              data.sectionTitle ? " for this subtopic" : " for each subtopic"
            }.`
          : `A deeper cheat sheet for ${scopeTitle}.`}
        {data.total > 1
          ? " The review runs across several short pages — use Continue to read on."
          : ""}
      </p>
      <div className="row" style={{ marginTop: 8 }}>
        <Link className="btn ghost mini" href={`/lesson/${data.topicId}`}>
          Need more detail? Work through the full lesson →
        </Link>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <Material html={data.html} />
      </div>

      {data.prevHref || data.nextHref ? (
        <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
          {data.prevHref ? (
            <Link className="btn ghost" href={data.prevHref}>
              ← Back
            </Link>
          ) : (
            <span />
          )}
          {data.nextHref ? (
            <Link className="btn" href={data.nextHref}>
              Continue →
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </main>
  );
}
