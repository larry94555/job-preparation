"use client";

import { useState } from "react";

/**
 * The premium "Subscribe" control — deliberately inert for now. Clicking it does
 * NOT contact Stripe; it just shows a "not ready yet" note. Phase I wires the
 * real $1/month subscription.
 */
export default function PremiumClient() {
  const [clicked, setClicked] = useState(false);
  return (
    <div>
      <div className="row">
        <button className="btn" onClick={() => setClicked(true)}>
          Subscribe — $1/month
        </button>
      </div>
      {clicked ? (
        <div className="feedback soft" style={{ marginTop: 10 }}>
          Premium isn&apos;t currently ready — it&apos;s coming soon. In the meantime, every
          lesson is free. Thanks for your interest!
        </div>
      ) : null}
    </div>
  );
}
