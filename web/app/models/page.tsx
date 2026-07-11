import Link from "next/link";
import { redirect } from "next/navigation";
import ModelConfigClient from "@/components/ModelConfigClient";
import { modelConfigView } from "@/lib/model-config-view";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Grader-model configuration. Opened in a new tab from the home page. Reads the
// config server-side and hands it to a client component for selection + save.
export default async function ModelsPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/login");

  const view = modelConfigView();
  if (!view) {
    return (
      <main className="wrap">
        <h1>Grader model</h1>
        <p className="muted">
          No valid <code>model_configuration.yaml</code> was found. Create one at the project root
          (or set <code>MODEL_CONFIG_PATH</code>) to configure the grader model.
        </p>
        <Link className="btn ghost" href="/">
          ← Home
        </Link>
      </main>
    );
  }

  return <ModelConfigClient initial={view} />;
}
