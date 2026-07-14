import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, emailAuthConfigured, signIn } from "@/auth";

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
        Enter your email and we&apos;ll send you a sign-in link. No password. Free — every
        lesson unlocks the moment you verify.
      </p>

      {emailAuthConfigured ? (
        <div className="panel">
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("resend", {
                email: String(formData.get("email") ?? "").trim(),
                redirectTo: "/welcome",
              });
            }}
            style={{ display: "grid", gap: 10 }}
          >
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
              Email me a sign-in link →
            </button>
          </form>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            Already have a link in your inbox? Just click it. Trouble?{" "}
            <Link href="/help/signup">Sign-up help</Link>.
          </p>
        </div>
      ) : (
        <div className="panel">
          <div className="eyebrow">Email sign-in not enabled here</div>
          <p style={{ marginTop: 4 }}>
            This environment has no email provider configured. Use the local dev sign-in
            instead.
          </p>
          <Link className="btn" href="/login">
            Go to dev sign-in →
          </Link>
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
