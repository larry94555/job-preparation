import "server-only";

/**
 * Minimal server-side email sender using Resend's REST API directly (the app
 * already uses Resend for magic-link sign-in, so no new dependency is needed).
 * Best-effort: returns false when email isn't configured or the API errors.
 */

/** True when outbound email is configured (a Resend key + a destination inbox). */
export function emailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.SUPPORT_EMAIL);
}

interface SendArgs {
  to: string;
  subject: string;
  text: string;
  /** Set so a reply goes to the sender (only when they chose to share an email). */
  replyTo?: string;
}

export async function sendEmail({ to, subject, text, replyTo }: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
