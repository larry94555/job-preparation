import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  auth,
  devAuthConfigured,
  emailAuthConfigured,
  SIGNUP_NAME_COOKIE,
  signIn,
} from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Passwordless registration: enter an email, receive a magic link, click it to
// verify and sign in. No password to choose or store.
export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="wrap" style={{ maxWidth: 460 }}>
      <div className="row" style={{ marginTop: 0 }}>
        <Link className="btn ghost mini" href="/">
          ← Home
        </Link>
      </div>
      <div className="eyebrow">Create your free account</div>
      <h1>Sign up</h1>
      <p className="muted">
        Signing up is easy — just enter your name and email address, then verify your email
        address. No password. Free — every lesson unlocks the moment you verify.
      </p>

      {emailAuthConfigured ? (
        <div className="panel">
          <form
            action={async (formData: FormData) => {
              "use server";
              // The magic link only carries the email, so stash the name and apply
              // it to the user row on verification (see the createUser event).
              const name = String(formData.get("name") ?? "").trim();
              if (name) {
                (await cookies()).set(SIGNUP_NAME_COOKIE, name.slice(0, 80), {
                  httpOnly: true,
                  sameSite: "lax",
                  secure: process.env.NODE_ENV === "production",
                  path: "/",
                  maxAge: 60 * 60,
                });
              }
              await signIn("resend", {
                email: String(formData.get("email") ?? "").trim(),
                redirectTo: "/welcome",
              });
            }}
            style={{ display: "grid", gap: 10 }}
          >
            <label style={{ display: "grid", gap: 4 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Name
              </span>
              <input
                name="name"
                type="text"
                placeholder="Ada Lovelace"
                autoComplete="name"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                style={inputStyle}
              />
            </label>
            <button className="btn" type="submit" style={{ marginTop: 4 }}>
              Send my verification link →
            </button>
          </form>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            Already have a link in your inbox? Just click it. Trouble?{" "}
            <Link href="/help/signup">Sign-up help</Link>.
          </p>
        </div>
      ) : (
        <div className="panel">
          <div className="eyebrow">Sign-up is temporarily unavailable</div>
          <p style={{ marginTop: 4 }}>
            We can&apos;t send verification emails right now, so new accounts can&apos;t be
            created at the moment. Sorry — please check back shortly.
          </p>
          {devAuthConfigured ? (
            <>
              <p className="muted" style={{ fontSize: 13 }}>
                Running locally? Email isn&apos;t configured in this environment — use the dev
                sign-in instead.
              </p>
              <Link className="btn" href="/login">
                Go to dev sign-in →
              </Link>
            </>
          ) : (
            <div className="row">
              <Link className="btn ghost" href="/">
                ← Home
              </Link>
              <Link className="btn ghost" href="/help/signup">
                Sign-up help
              </Link>
            </div>
          )}
        </div>
      )}
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
