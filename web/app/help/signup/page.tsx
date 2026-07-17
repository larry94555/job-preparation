import Link from "next/link";
import { emailAuthConfigured, emailProviderId, signIn } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sign-up troubleshooting. Also the Auth.js `pages.error` target, so it may
// arrive with an `?error=` query — we show a gentle note and the fixes.
export default async function SignupHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@example.com";
  const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(
    "Help signing up",
  )}&body=${encodeURIComponent(
    "Hi — I'm having trouble signing up.\n\nWhat happened:\n\nThe email I used:\n",
  )}`;

  return (
    <main className="wrap" style={{ maxWidth: 560 }}>
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost mini" href="/signup">
          ← Back to sign up
        </Link>
      </div>
      <div className="eyebrow">Sign-up help</div>
      <h1>Trouble signing up?</h1>

      {error ? (
        <div className="feedback soft">
          Something went wrong with that sign-in link (it may have expired or already been
          used). Request a fresh one below.
        </div>
      ) : null}

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Didn&apos;t get the email?</h3>
        <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Wait a minute — it can take a moment to arrive.</li>
          <li>Check your spam / junk / promotions folder.</li>
          <li>Make sure you typed your email correctly, then request a new link.</li>
        </ul>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Link expired or already used?</h3>
        <p className="muted" style={{ marginTop: 4 }}>
          Sign-in links are single-use and time-limited. Just request a new one — enter your
          email below.
        </p>
        {emailAuthConfigured ? (
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn(emailProviderId ?? "nodemailer", {
                email: String(formData.get("email") ?? "").trim(),
                redirectTo: "/welcome",
              });
            }}
            style={{ display: "grid", gap: 10, marginTop: 8 }}
          >
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle}
            />
            <button className="btn" type="submit">
              Send me a new link →
            </button>
          </form>
        ) : (
          <Link className="btn" href="/signup">
            Back to sign up →
          </Link>
        )}
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Used the wrong email?</h3>
        <p className="muted" style={{ marginTop: 4 }}>
          No problem — <Link href="/signup">start over</Link> with the correct address.
        </p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Still stuck?</h3>
        <p className="muted" style={{ marginTop: 4 }}>
          Email us and we&apos;ll help you get in.
        </p>
        <a className="btn ghost" href={mailto}>
          Email support →
        </a>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
  fontFamily: "inherit",
};
