"use server";

import { sendEmail } from "@/lib/email";

/** One rated aspect of the site (1–5, or 0 when the user left it blank). */
export interface FeedbackRating {
  label: string;
  value: number;
}

export interface FeedbackInput {
  ratings: FeedbackRating[];
  comment: string;
  /** Optional — provided only if the sender is open to a follow-up. Absent =
   *  anonymous (no reply-to, never falls back to a sender-revealing mailto). */
  email?: string;
}

export interface FeedbackResult {
  ok: boolean;
  /** On failure for a NON-anonymous submission, a prefilled mailto fallback. */
  mailto?: string;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Deliver site feedback to the support inbox by email. Sent server-side via
 * Resend so an "anonymous" submission never leaks the sender's address. Feedback
 * is NOT stored or shown anywhere on the site. If email delivery isn't available,
 * a non-anonymous submission falls back to a prefilled mailto the client can open.
 */
export async function submitFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  const comment = (input.comment ?? "").trim().slice(0, 5000);
  const ratings = (input.ratings ?? []).filter((r) => r.value >= 1 && r.value <= 5);
  const email = (input.email ?? "").trim().slice(0, 200);
  const anonymous = !email; // no email = anonymous

  if (ratings.length === 0 && !comment) {
    return { ok: false, error: "Please add a rating or a comment before sending." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "That email address doesn't look valid." };
  }

  const lines: string[] = ["New site feedback", ""];
  for (const r of ratings) lines.push(`${r.label}: ${r.value}/5`);
  if (comment) lines.push("", "Comment:", comment);
  lines.push("", `From: ${anonymous || !email ? "anonymous" : email}`);
  const text = lines.join("\n");
  const subject = "Site feedback";

  const support = process.env.SUPPORT_EMAIL;
  if (support && process.env.RESEND_API_KEY) {
    const sent = await sendEmail({
      to: support,
      subject,
      text,
      replyTo: !anonymous && email ? email : undefined,
    });
    if (sent) return { ok: true };
  }

  // Delivery unavailable. An anonymous submission must NOT fall back to a mailto
  // (that would expose the sender's own address, breaking the promise).
  if (anonymous) {
    return {
      ok: false,
      error: "Feedback delivery isn't available right now — please try again later.",
    };
  }
  const to = support ?? "support@example.com";
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  return { ok: false, mailto };
}
