import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The "check your email" page Auth.js redirects to after sending a magic link
// (configured as `pages.verifyRequest`).
export default function CheckEmailPage() {
  return (
    <main className="wrap" style={{ maxWidth: 460 }}>
      <div className="eyebrow">Almost there</div>
      <h1>Check your email 📬</h1>
      <div className="panel">
        <p style={{ marginTop: 0 }}>
          We just sent you a sign-in link. Open it on this device to verify your email and
          finish creating your account.
        </p>
        <ul className="muted" style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>The link is single-use and expires after a while.</li>
          <li>Not there in a minute? Check your spam or promotions folder.</li>
          <li>Wrong email, or link expired? Just request a new one.</li>
        </ul>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn ghost" href="/signup">
            Request another link
          </Link>
          <Link className="btn ghost" href="/help/signup">
            Sign-up help
          </Link>
        </div>
      </div>
    </main>
  );
}
