import { type NextRequest, NextResponse } from "next/server";
import { saveModelSelection } from "@job-prep/evaluator";
import { modelConfigView } from "@/lib/model-config-view";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read/update which local open-source model fills each grader tier
 * (model_configuration.yaml). GET returns the catalog + per-tier options; POST
 * changes only the `selection`, validated against the allowed catalog. The
 * allow-list, roles, requirements, and `secondary_model_allowed` switch are
 * file-managed, not editable here.
 */

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const v = modelConfigView();
  if (!v) {
    return NextResponse.json(
      { error: "no valid model_configuration.yaml found (set MODEL_CONFIG_PATH?)" },
      { status: 404 },
    );
  }
  return NextResponse.json(v);
}

export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { primary?: unknown; secondary?: unknown };
  const sel: { primary?: string; secondary?: string } = {};
  if (typeof body.primary === "string") sel.primary = body.primary;
  if (typeof body.secondary === "string") sel.secondary = body.secondary;
  if (sel.primary === undefined && sel.secondary === undefined) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  try {
    saveModelSelection(sel);
  } catch (e) {
    // Invalid pick (not allowed for the tier, or secondary disabled).
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  return NextResponse.json(modelConfigView());
}
