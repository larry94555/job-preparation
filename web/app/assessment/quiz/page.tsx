import Link from "next/link";
import { quickAssessmentData } from "@/lib/lesson-service";
import QuickQuizClient from "./QuickQuizClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The quick-assessment runner (Phase 2). ?topic=<id> (whole topic) or
// ?topic=<id>&section=<sectionId> (one subtopic). Public; MC-only.
export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; section?: string }>;
}) {
  const sp = await searchParams;
  const data = await quickAssessmentData(sp.topic ?? "", sp.section ?? null);

  if (!data || data.questions.length === 0) {
    return (
      <main className="wrap">
        <p className="muted">No quick assessment is available for that topic yet.</p>
        <Link className="btn ghost" href="/assessment">
          ← Back to assessment
        </Link>
      </main>
    );
  }

  return (
    <main className="wrap">
      <QuickQuizClient data={data} />
    </main>
  );
}
