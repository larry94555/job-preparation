import Link from "next/link";
import PublicCatalog from "@/components/PublicCatalog";
import UserBar from "@/components/UserBar";
import { catalogData } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public topic catalog — the full list of every topic with its title and
// description, browsable without signing in. "Start lesson" links into the
// runner for signed-in users, or to /signup for anonymous visitors.
export default async function TopicsPage() {
  const userId = await currentUserId();
  const signedIn = !!userId;
  const catalog = await catalogData();

  return (
    <main className="wrap">
      {signedIn ? (
        <UserBar />
      ) : (
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 0 }}>
          <Link className="btn ghost mini" href="/login">
            Sign in
          </Link>
        </div>
      )}

      <div className="eyebrow">Interview prep</div>
      <h1>All topics</h1>
      <p className="muted">
        Every topic in the curriculum, with what it covers. {catalog.items.length} core topics
        plus a {catalog.agentic.total}-topic agentic track.
      </p>

      {signedIn ? null : (
        <div className="panel">
          <div className="eyebrow">Free</div>
          <p style={{ marginTop: 4 }}>
            <strong>Free — create an account to unlock every lesson.</strong>
          </p>
          <div className="row">
            <Link className="btn" href="/signup">
              Sign up free →
            </Link>
            <Link className="btn ghost" href="/">
              Home →
            </Link>
          </div>
        </div>
      )}

      <PublicCatalog catalog={catalog} signedIn={signedIn} />
    </main>
  );
}
