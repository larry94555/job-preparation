import Link from "next/link";
import { assessmentData } from "@/lib/lesson-service";
import AssessmentClient from "./AssessmentClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The free Assessment page (Phase 1: UI only). Every topic + its major subtopics,
// each with Review / Quick Assessment / Full Assessment / Learn links. Public.
export default async function AssessmentPage() {
  const data = await assessmentData();
  return (
    <main className="wrap">
      <div className="row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <Link className="btn ghost mini" href="/">
          ← Home
        </Link>
      </div>
      <div className="eyebrow">Free assessment of knowledge</div>
      <h1>Assess your knowledge</h1>
      <p className="muted">
        Find your weak spots fast. Each topic shows its major subtopics; use Quick Assessment for
        a fast core-concepts check, Full Assessment for the complete quizzes and exercises, Review
        for a cheat sheet, and Learn to open the lesson. The frame around each topic will show what
        you&apos;ve mastered, what needs work, and what you haven&apos;t been tested on yet.
      </p>
      <AssessmentClient data={data} />
    </main>
  );
}
