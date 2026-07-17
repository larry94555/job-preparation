import Link from "next/link";
import Material from "@/components/Material";
import { reviewData } from "@/lib/lesson-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The Review "cheat sheet" (Phase 3). ?topic=<id> (whole topic) or
// ?topic=<id>&section=<sectionId> (one subtopic). Public; an authored summary
// (key terms + overview diagram + takeaway) derived from each section's roadmap.
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; section?: string }>;
}) {
  const sp = await searchParams;
  const data = await reviewData(sp.topic ?? "", sp.section ?? null);

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

  return (
    <main className="wrap">
      <div className="row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <Link className="btn ghost mini" href="/assessment">
          ← Assessment
        </Link>
      </div>
      <div className="eyebrow" style={{ marginTop: 12 }}>
        Review · cheat sheet
      </div>
      <h1 style={{ marginTop: 4 }}>{scopeTitle}</h1>
      <p className="muted">
        A quick reference to the key ideas and terms
        {data.sectionTitle ? " for this subtopic" : " for each subtopic"} — skim it before an
        assessment, or to refresh after one.
      </p>
      <div className="panel" style={{ marginTop: 14 }}>
        <Material html={data.html} />
      </div>
    </main>
  );
}
