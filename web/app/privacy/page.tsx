import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Plain-English privacy summary. Starter content — have a professional review it
// before relying on it for anything serious.
export default function PrivacyPage() {
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@example.com";
  return (
    <main className="wrap" style={{ maxWidth: 680 }}>
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost mini" href="/">
          ← Home
        </Link>
      </div>
      <div className="eyebrow">Privacy</div>
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: 13 July 2026</p>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>What we collect</h3>
        <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            <strong>Your email address</strong> — used only to sign you in (via a one-time
            link) and, if you ask, to help with support.
          </li>
          <li>
            <strong>Your lesson progress</strong> — which steps and checks you&apos;ve
            completed, so you can pick up where you left off.
          </li>
          <li>
            <strong>Donation records</strong> — if you donate, we keep the payment&apos;s
            reference id and amount. We do <strong>not</strong> store your card details.
          </li>
        </ul>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Who processes your data</h3>
        <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            <strong>Payments</strong> are handled by <strong>Stripe</strong> on their own
            secure pages — your card information goes to Stripe, never to us.
          </li>
          <li>
            <strong>Sign-in emails</strong> are delivered by <strong>Resend</strong>.
          </li>
        </ul>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Your choices</h3>
        <p style={{ marginTop: 4 }}>
          Want your account and data deleted? Email{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a> and we&apos;ll take care of it.
          We only collect what&apos;s needed to run the lessons — no advertising trackers.
        </p>
      </div>
    </main>
  );
}
