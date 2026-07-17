import Link from "next/link";
import { reviewContextData } from "@/lib/lesson-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const enc = encodeURIComponent;

// A short per-question "context" page behind a quick assessment (Phase 3
// follow-up). ?topic=<id>&section=<sectionId?>&q=<questionId>. One question per
// page — the prompt, every option (correct one marked), and the authored
// explanation — so every quiz question's "context" link lands on a page that
// contains its answer. Paginated with Back/Continue; page 0 is the cheat sheet
// (/assessment/review). Public; shows answers on purpose (a review aid).
export default async function ReviewContextPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; section?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const topic = sp.topic ?? "";
  const section = sp.section ?? null;
  const data = await reviewContextData(topic, section);

  if (!data || data.items.length === 0) {
    return (
      <main className="wrap">
        <p className="muted">No context is available for that topic yet.</p>
        <Link className="btn ghost" href="/assessment">
          ← Back to assessment
        </Link>
      </main>
    );
  }

  const total = data.items.length;
  let index = sp.q ? data.items.findIndex((it) => it.id === sp.q) : 0;
  if (index < 0) index = 0;
  const item = data.items[index];

  const suffix = section ? `&section=${enc(section)}` : "";
  const ctxHref = (i: number) =>
    `/assessment/review/context?topic=${enc(topic)}${suffix}&q=${enc(data.items[i].id)}`;
  const sheetHref = `/assessment/review?topic=${enc(topic)}${suffix}`;

  const scopeTitle = data.sectionTitle
    ? `${data.topicTitle}: ${data.sectionTitle}`
    : data.topicTitle;

  return (
    <main className="wrap">
      <div className="row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <Link className="btn ghost mini" href="/assessment">
          ← Assessment
        </Link>
        <span style={{ fontWeight: 600 }}>
          Context {index + 1} / {total}
        </span>
      </div>
      <div className="eyebrow" style={{ marginTop: 12 }}>
        Review · context
      </div>
      <h1 style={{ marginTop: 4 }}>{scopeTitle}</h1>
      <p className="muted">
        The full context and answer for this question.{" "}
        <Link href={sheetHref}>See the cheat sheet ↑</Link>
      </p>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="muted" style={{ fontSize: 13 }}>
          Topic: {data.topicTitle}
          {item.subtopic ? ` · Subtopic: ${item.subtopic}` : ""}
        </div>
        <div className="prompt" style={{ marginTop: 6 }}>
          {item.prompt}
        </div>
        <div>
          {item.options.map((o) => (
            <div key={o.text} className={"opt" + (o.correct ? " correct" : "")}>
              <span aria-hidden style={{ width: 16 }}>
                {o.correct ? "✓" : ""}
              </span>
              <span>{o.text}</span>
            </div>
          ))}
        </div>
        <div className="feedback good">
          <strong>Answer:</strong> {item.answer}
          {item.explanation ? <div style={{ marginTop: 6 }}>{item.explanation}</div> : null}
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
          <Link className="btn ghost" href={index > 0 ? ctxHref(index - 1) : sheetHref}>
            ← Back
          </Link>
          {index < total - 1 ? (
            <Link className="btn" href={ctxHref(index + 1)}>
              Continue →
            </Link>
          ) : (
            <Link className="btn ghost" href={sheetHref}>
              ↑ Cheat sheet
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
