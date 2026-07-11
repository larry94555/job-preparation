import { auth, oauthConfigured, signIn } from "@/auth";
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

      <div className="panel">
        <div className="eyebrow">Local dev sign-in</div>
        <p className="muted" style={{ marginTop: 4 }}>
          No password — enter any name and email to log in as a test user. Your
          progress is scoped to that email.
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
            Sign in as test user →
          </button>
        </form>
      </div>

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
