import Link from "next/link";
import { stripeConfigured } from "@/lib/stripe";
import DonateClient from "./DonateClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public "pay what you can" donation page (no sign-in required).
export default function DonatePage() {
  return (
    <main className="wrap" style={{ maxWidth: 520 }}>
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost mini" href="/">
          ← Home
        </Link>
      </div>
      <div className="eyebrow">Support the site</div>
      <h1>Enjoying this website?</h1>
      <p className="muted">
        Feel free to pay what you can afford. Every lesson stays free — donations just help
        keep the lights on. Thank you 💛
      </p>
      <DonateClient configured={stripeConfigured()} />
    </main>
  );
}
