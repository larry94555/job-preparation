import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Where Stripe returns the donor after a successful payment.
export default function DonateThanksPage() {
  return (
    <main className="wrap" style={{ maxWidth: 520 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44 }}>💛</div>
        <h1>Thank you!</h1>
        <p className="muted">
          Your donation came through — it genuinely helps keep this site free for everyone.
          We really appreciate it.
        </p>
        <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
          <Link className="btn" href="/">
            Back to lessons →
          </Link>
        </div>
      </div>
    </main>
  );
}
