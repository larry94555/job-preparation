"use client";

import Link from "next/link";
import { useState } from "react";
import { type FeedbackResult, submitFeedback } from "./actions";

// The aspects a visitor can rate 1–5 (0 = left blank). Kept short on purpose.
const ASPECTS = ["Overall experience", "Lesson content quality", "Ease of use"] as const;

export default function FeedbackClient() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);

  const setRating = (label: string, value: number) =>
    setRatings((r) => ({ ...r, [label]: r[label] === value ? 0 : value }));

  async function send() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await submitFeedback({
        ratings: ASPECTS.map((label) => ({ label, value: ratings[label] ?? 0 })),
        comment,
        anonymous,
        email: anonymous ? undefined : email,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="eyebrow">Thank you 💛</div>
        <p className="muted">
          Your feedback was sent. It goes straight to us by email and isn&apos;t shown anywhere
          on the site.
        </p>
        <div className="row" style={{ marginTop: 8 }}>
          <Link className="btn ghost" href="/">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: 18 }}>
      <div className="eyebrow">Rate a few things (optional)</div>
      {ASPECTS.map((label) => (
        <div
          key={label}
          className="row"
          style={{ justifyContent: "space-between", margin: "8px 0" }}
        >
          <span>{label}</span>
          <span className="row" style={{ gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${label}: ${n} of 5`}
                onClick={() => setRating(label, n)}
                className={(ratings[label] ?? 0) === n ? "" : "ghost"}
                style={{ minWidth: 34, padding: "4px 8px" }}
              >
                {n}
              </button>
            ))}
          </span>
        </div>
      ))}

      <div className="eyebrow" style={{ marginTop: 12 }}>
        Anything else?
      </div>
      <textarea
        value={comment}
        placeholder="What worked, what didn't, what you'd like to see…"
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="eyebrow" style={{ marginTop: 12 }}>
        How should we treat this?
      </div>
      <label className={"opt" + (anonymous ? " sel" : "")}>
        <input
          type="radio"
          name="anon"
          checked={anonymous}
          onChange={() => setAnonymous(true)}
        />
        <span>Send anonymously (we won&apos;t know who you are)</span>
      </label>
      <label className={"opt" + (!anonymous ? " sel" : "")}>
        <input
          type="radio"
          name="anon"
          checked={!anonymous}
          onChange={() => setAnonymous(false)}
        />
        <span>Include my email so you can follow up</span>
      </label>
      {!anonymous ? (
        <input
          className="text"
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      ) : null}

      {result?.error ? <div className="feedback soft">{result.error}</div> : null}
      {result?.mailto ? (
        <div className="feedback soft">
          We couldn&apos;t send it automatically.{" "}
          <a href={result.mailto}>Open your email app to send it →</a>
        </div>
      ) : null}

      <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
        <Link className="btn ghost" href="/">
          ← Home
        </Link>
        <button onClick={send} disabled={submitting}>
          {submitting ? "Sending…" : "Send feedback"}
        </button>
      </div>
    </div>
  );
}
