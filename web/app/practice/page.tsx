import Link from "next/link";
import { redirect } from "next/navigation";
import PracticeRunner from "@/components/PracticeRunner";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Search = { kind?: string; topic?: string };

// /practice?kind=review|mock|cumulative&topic=... — the question-by-question
// practice experience. All grading/answer keys stay server-side; this page just
// mounts the client runner.
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!(await currentUserId())) redirect("/login");
  const { kind, topic } = await searchParams;
  const valid = kind === "review" || kind === "mock" || kind === "cumulative";

  return (
    <main className="wrap">
      <div className="eyebrow">Practice</div>
      <h1 style={{ marginBottom: 16 }}>
        {kind === "mock"
          ? "Mock interview"
          : kind === "cumulative"
            ? "Cumulative assessment"
            : "Review"}
      </h1>
      {valid ? (
        <PracticeRunner kind={kind} topic={topic} backHref="/" />
      ) : (
        <div className="panel">
          <p className="muted">Pick a practice mode from the home hub.</p>
          <div className="row">
            <Link className="btn" href="/">
              Back to lessons
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
