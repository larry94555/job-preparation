import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Plain-English terms summary. Starter content — have a professional review it
// before relying on it for anything serious.
export default function TermsPage() {
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@example.com";
  return (
    <main className="wrap" style={{ maxWidth: 680 }}>
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost mini" href="/">
          ← Home
        </Link>
      </div>
      <div className="eyebrow">Terms</div>
      <h1>Terms of Use</h1>
      <p className="muted">Last updated: 13 July 2026</p>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>The basics</h3>
        <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            This site offers educational lessons, provided <strong>as-is</strong>, for your
            personal learning. We do our best to keep it accurate and available, but we
            can&apos;t guarantee it&apos;s perfect or never down.
          </li>
          <li>
            Please use it respectfully — don&apos;t try to break, overload, or abuse the
            service.
          </li>
        </ul>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Donations</h3>
        <p style={{ marginTop: 4 }}>
          Donations are entirely <strong>voluntary</strong> — every lesson is free either way.
          Because they&apos;re gifts of support, donations are{" "}
          <strong>non-refundable</strong>. If something went wrong with a payment, email us and
          we&apos;ll help.
        </p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Premium</h3>
        <p style={{ marginTop: 4 }}>
          Premium coaching is <strong>previewed but not yet available</strong>. No premium
          charges are taken at this time. These terms will be updated before it launches.
        </p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Questions</h3>
        <p style={{ marginTop: 4 }}>
          Reach us any time at <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      </div>
    </main>
  );
}
