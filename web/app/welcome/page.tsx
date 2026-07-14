import Link from "next/link";
import { redirect } from "next/navigation";
import { SAMPLE_TOPIC } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Post-verification landing. Reached right after a magic link signs the user in
// (the sign-up form sets this as `redirectTo`). Anonymous visitors are bounced to
// sign-up by the middleware, so anyone here is verified.
export default async function WelcomePage() {
  if (!(await currentUserId())) redirect("/signup");

  return (
    <main className="wrap" style={{ maxWidth: 520 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44 }}>🎉</div>
        <h1>You&apos;re verified</h1>
        <p className="muted">
          Your email is confirmed and you&apos;re signed in. Every lesson — including graded
          essays, coding exercises, and progress tracking — is now unlocked.
        </p>
        <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
          <Link className="btn" href="/">
            Go to my lessons →
          </Link>
          <Link className="btn ghost" href={`/lesson/${SAMPLE_TOPIC}`}>
            Start the first lesson
          </Link>
        </div>
      </div>
    </main>
  );
}
