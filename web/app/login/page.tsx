import Link from "next/link";
import { auth, devAuthConfigured, emailAuthConfigured, oauthConfigured, signIn } from "@/auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Local dev sign-in. The credentials form performs a server action that calls
// signIn("credentials", ...) — no password check (dev stub, DESIGN.md §12).
// OAuth buttons appear only when those providers are configured via env.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";

  // Already signed in → don't show the form.
  if (session?.user) redirect(redirectTo);

  return (
    <main className="wrap" style={{ maxWidth: 460 }}>
      <div className="eyebrow">Interview prep</div>
      <h1>Sign in</h1>

      {emailAuthConfigured ? (
        <div className="panel">
          <div className="eyebrow">Sign in by email</div>
          <p className="muted" style={{ marginTop: 4 }}>
            Signing up is easy — just enter your name and email address, then verify your
            email address. No password.
          </p>
          <div className="row">
            <Link className="btn" href="/signup">
              Continue with email →
            </Link>
          </div>
        </div>
      ) : null}

      {/* The credentials stub is registered ONLY outside production (see auth.ts).
          Rendering its form anywhere else would offer a sign-in that can only fail. */}
      {devAuthConfigured ? (
        <div className="panel">
          <div className="eyebrow">Local dev sign-in</div>
          <p className="muted" style={{ marginTop: 4 }}>
            Development only — no password. Enter a name and email to sign in; your progress
            is scoped to that email.
          </p>
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("credentials", {
                name: String(formData.get("name") ?? ""),
                email: String(formData.get("email") ?? ""),
                redirectTo,
              });
            }}
            style={{ display: "grid", gap: 10, marginTop: 12 }}
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
              Sign in →
            </button>
          </form>
        </div>
      ) : null}

      {!emailAuthConfigured && !devAuthConfigured && !oauthConfigured ? (
        <div className="panel">
          <div className="eyebrow">Sign-in is temporarily unavailable</div>
          <p style={{ marginTop: 4 }}>
            No sign-in method is configured on this deployment yet. Please check back shortly.
          </p>
          <div className="row">
            <Link className="btn ghost" href="/">
              ← Home
            </Link>
          </div>
        </div>
      ) : null}

      {oauthConfigured ? (
        <div className="panel">
          <div className="eyebrow">Or continue with</div>
          <div className="row">
            {process.env.AUTH_GITHUB_ID ? (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo });
                }}
              >
                <button className="btn ghost" type="submit">
                  GitHub
                </button>
              </form>
            ) : null}
            {process.env.AUTH_GOOGLE_ID ? (
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo });
                }}
              >
                <button className="btn ghost" type="submit">
                  Google
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
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
