import Link from "next/link";
import FeedbackClient from "./FeedbackClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public feedback page (no sign-in required). Feedback is emailed to the support
// inbox and is NOT stored or displayed anywhere on the site.
export default function FeedbackPage() {
  return (
    <main className="wrap" style={{ maxWidth: 560 }}>
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost mini" href="/">
          ← Home
        </Link>
      </div>
      <div className="eyebrow">Feedback</div>
      <h1>Tell us how it&apos;s going</h1>
      <p className="muted">
        Rate a few aspects and leave a comment. Your feedback is emailed straight to us — it
        isn&apos;t posted or shown anywhere on the site.
      </p>
      <FeedbackClient />
    </main>
  );
}
