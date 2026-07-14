"use client";

import { useState } from "react";

const PRESETS = [3, 5, 10];

/**
 * "Pay what you can" donation form. The donor picks a preset or types any
 * amount (min $1), we create a Stripe Checkout Session server-side, and redirect
 * to Stripe's hosted payment page. No card details are handled here.
 */
export default function DonateClient({ configured }: { configured: boolean }) {
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function donate() {
    setError(null);
    const dollars = Number(amount);
    if (!Number.isFinite(dollars) || dollars < 1) {
      setError("Please enter an amount of $1 or more.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: dollars }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Couldn't reach the payment service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="panel">
        <p style={{ marginTop: 0 }}>
          Donations aren&apos;t switched on just yet — please check back soon. Thank you for
          wanting to support the site!
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="row" style={{ gap: 8 }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={"btn" + (Number(amount) === p ? "" : " ghost")}
            onClick={() => setAmount(String(p))}
          >
            ${p}
          </button>
        ))}
      </div>
      <label style={{ display: "grid", gap: 4, marginTop: 12 }}>
        <span className="muted" style={{ fontSize: 13 }}>
          Or enter any amount (USD)
        </span>
        <div className="row" style={{ gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>$</span>
          <input
            className="text"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ maxWidth: 140 }}
          />
        </div>
      </label>
      {error ? (
        <div className="feedback soft" style={{ marginTop: 10 }}>
          {error}
        </div>
      ) : null}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={donate} disabled={busy}>
          {busy ? "Redirecting to secure checkout…" : `Donate $${amount || "0"} →`}
        </button>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        Secure payment handled by Stripe. We never see your card details.
      </p>
    </div>
  );
}
