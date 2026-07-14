import Link from "next/link";
import { redirect } from "next/navigation";
import { SAMPLE_TOPIC, sampleFlow } from "@/lib/lesson-service";
import { currentUserId } from "@/lib/session";
import SampleClient from "./SampleClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The free, no-login sample lesson. Signed-in visitors are sent to the real,
// full lesson instead; anonymous visitors get the deterministic-only sample.
export default async function SamplePage() {
  if (await currentUserId()) redirect(`/lesson/${SAMPLE_TOPIC}`);

  const flow = await sampleFlow();
  if (!flow) {
    return (
      <main className="wrap">
        <p>The sample lesson is unavailable right now.</p>
        <Link className="btn ghost" href="/">
          ← Home
        </Link>
      </main>
    );
  }

  return <SampleClient flow={flow} />;
}
