import "server-only";

/**
 * Minimal server-side email sender for transactional mail that is NOT sign-in
 * (currently the feedback form). Mirrors the sign-in transports in auth.ts so a
 * deployment configures mail once:
 *
 *  - **SMTP** (`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`) — any relay (OCI Email
 *    Delivery, SES, a smarthost). Uses the submission port (587 by default), so
 *    it works on hosts that block port 25.
 *  - **Resend** (`RESEND_API_KEY`) — HTTP API fallback when no SMTP is set.
 *
 * Best-effort throughout: returns false when mail isn't configured or sending
 * fails; callers must degrade gracefully rather than surface an error.
 */

const smtpConfigured = (): boolean =>
  !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/** True when outbound email is configured (a transport + a destination inbox). */
export function emailConfigured(): boolean {
  return !!((smtpConfigured() || process.env.RESEND_API_KEY) && process.env.SUPPORT_EMAIL);
}

interface SendArgs {
  to: string;
  subject: string;
  text: string;
  /** Set so a reply goes to the sender (only when they chose to share an email). */
  replyTo?: string;
}

export async function sendEmail(args: SendArgs): Promise<boolean> {
  if (smtpConfigured()) return sendViaSmtp(args);
  if (process.env.RESEND_API_KEY) return sendViaResend(args);
  return false;
}

async function sendViaSmtp({ to, subject, text, replyTo }: SendArgs): Promise<boolean> {
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const port = Number(process.env.SMTP_PORT ?? 587);
  try {
    // Imported lazily so a Resend-only (or mail-less) deployment never loads it.
    const { createTransport } = await import("nodemailer");
    const transport = createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 587 = STARTTLS; 465 = implicit TLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({ from, to, subject, text, ...(replyTo ? { replyTo } : {}) });
    return true;
  } catch {
    return false;
  }
}

async function sendViaResend({ to, subject, text, replyTo }: SendArgs): Promise<boolean> {
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
