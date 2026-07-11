"use client";

import Link from "next/link";
import { useState } from "react";

// ---- client-safe shapes (mirror lib/model-config-view.ts) ----------------
interface Requirements {
  ram_gb?: number;
  gpu_required?: boolean;
  cpu_only?: boolean;
  disk_gb?: number;
  notes?: string;
}
interface ModelEntry {
  id: string;
  name: string;
  huggingface?: string;
  roles: string[];
  status: "allowed" | "disallowed";
  requirements?: Requirements;
}
interface BackendEntry {
  id: string;
  name: string;
  kind: "ollama" | "llamacpp";
  provider?: string;
  base_url: string;
  environments: string[];
  single_model?: boolean;
  notes?: string;
}
interface TierView {
  selected: string | null;
  options: ModelEntry[];
  locked: boolean;
}
export interface ModelConfigView {
  env: "local" | "hosted";
  readOnly: boolean;
  backend: { selected: string | null; entry: BackendEntry | null; options: BackendEntry[]; locked: boolean };
  baseUrl: string | null;
  singleModel: boolean;
  secondaryAllowed: boolean;
  catalog: ModelEntry[];
  primary: TierView;
  secondary: TierView & { enabled: boolean };
}

function reqSummary(r?: Requirements): string {
  if (!r) return "—";
  const parts: string[] = [];
  if (r.ram_gb != null) parts.push(`RAM ~${r.ram_gb} GB`);
  parts.push(r.gpu_required ? "GPU required" : r.cpu_only ? "CPU-only" : "CPU ok");
  if (r.disk_gb != null) parts.push(`Disk ~${r.disk_gb} GB`);
  return parts.join(" · ");
}

function Tier({
  label,
  hint,
  tier,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  tier: TierView;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const current = tier.options.find((m) => m.id === value) ?? tier.options.find((m) => m.id === tier.selected);
  return (
    <div className="panel" style={{ opacity: disabled ? 0.55 : 1 }}>
      <div className="eyebrow">{label}</div>
      <p className="muted" style={{ marginTop: 2 }}>{hint}</p>
      {tier.locked ? (
        <div style={{ marginTop: 8 }}>
          <strong>{current?.name ?? tier.selected ?? "—"}</strong>{" "}
          <span className="muted">({current?.id ?? tier.selected})</span>
          <div className="muted" style={{ fontSize: 13 }}>Fixed — can’t be changed here.</div>
        </div>
      ) : (
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginTop: 8, padding: "6px 8px", minWidth: 320, maxWidth: "100%" }}
        >
          {tier.options.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.id}
            </option>
          ))}
        </select>
      )}
      {current ? (
        <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          {reqSummary(current.requirements)}
          {current.requirements?.notes ? ` · ${current.requirements.notes}` : ""}
          {current.huggingface ? ` · HF: ${current.huggingface}` : ""}
        </div>
      ) : null}
    </div>
  );
}

export default function ModelConfigClient({ initial }: { initial: ModelConfigView }) {
  const [view, setView] = useState<ModelConfigView>(initial);
  const [backend, setBackend] = useState(initial.backend.selected ?? "");
  const [primary, setPrimary] = useState(initial.primary.selected ?? "");
  const [secondary, setSecondary] = useState(initial.secondary.selected ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const backendEditable = !view.readOnly && !view.backend.locked;
  const secEditable = !view.readOnly && view.secondary.enabled && !view.secondary.locked;
  const primEditable = !view.readOnly && !view.primary.locked;
  const activeBackend = view.backend.options.find((b) => b.id === backend) ?? view.backend.entry;

  const dirty =
    (backendEditable && backend !== (view.backend.selected ?? "")) ||
    (primEditable && primary !== (view.primary.selected ?? "")) ||
    (secEditable && secondary !== (view.secondary.selected ?? ""));

  async function save() {
    setSaving(true);
    setStatus(null);
    const payload: { primary?: string; secondary?: string; backend?: string } = {};
    if (backendEditable) payload.backend = backend;
    if (primEditable) payload.primary = primary;
    if (secEditable) payload.secondary = secondary;
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, msg: data.error ?? "Save failed." });
      } else {
        const v = data as ModelConfigView;
        setView(v);
        setBackend(v.backend.selected ?? "");
        setPrimary(v.primary.selected ?? "");
        setSecondary(v.secondary.selected ?? "");
        setStatus({ ok: true, msg: "Saved. New gradings use the selected backend/model(s)." });
      }
    } catch (e) {
      setStatus({ ok: false, msg: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="wrap">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="eyebrow">Configuration</div>
        <Link className="btn ghost mini" href="/">← Home</Link>
      </div>
      <h1>Grader backend &amp; model</h1>
      <p className="muted">
        Choose the backend that hosts the model and which local open-source model grades answers. The
        catalog and what’s allowed live in <code>model_configuration.yaml</code>; this page changes only
        the selection.
      </p>

      {view.readOnly ? (
        <div className="panel" style={{ borderLeft: "3px solid #b8860b" }}>
          <strong>Hosted environment (read-only).</strong>{" "}
          <span className="muted">
            The backend and model are fixed at deploy time (<code>DEPLOY_ENV=hosted</code>). This page shows
            the active configuration.
          </span>
        </div>
      ) : null}

      {/* ---- Backend ---- */}
      <div className="panel">
        <div className="eyebrow">Backend service</div>
        <p className="muted" style={{ marginTop: 2 }}>
          Where the model is served (OpenAI-compatible endpoint). Environment: <strong>{view.env}</strong>.
        </p>
        {view.backend.locked || !backendEditable ? (
          <div style={{ marginTop: 8 }}>
            <strong>{activeBackend?.name ?? backend}</strong>{" "}
            <span className="muted">({activeBackend?.id})</span>
            <div className="muted" style={{ fontSize: 13 }}>
              {view.readOnly
                ? "Forced in the hosted environment — the only choice."
                : "Only one backend is available here."}
            </div>
          </div>
        ) : (
          <select
            value={backend}
            onChange={(e) => setBackend(e.target.value)}
            style={{ marginTop: 8, padding: "6px 8px", minWidth: 320, maxWidth: "100%" }}
          >
            {view.backend.options.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.kind}
                {b.single_model ? " · single-model" : ""}
              </option>
            ))}
          </select>
        )}
        {activeBackend ? (
          <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
            <div>
              kind: <code>{activeBackend.kind}</code>
              {activeBackend.provider ? ` · provider: ${activeBackend.provider}` : ""} · url:{" "}
              <code>{view.baseUrl ?? activeBackend.base_url}</code>
              {activeBackend.single_model ? " · single-model" : " · multi-model"}
            </div>
            {activeBackend.notes ? <div style={{ marginTop: 4 }}>{activeBackend.notes}</div> : null}
          </div>
        ) : null}
      </div>

      {/* ---- Primary tier ---- */}
      <Tier
        label="Primary model"
        hint="Faster, less reliable. The default judge for every skill."
        tier={view.primary}
        value={primary}
        onChange={setPrimary}
        disabled={!primEditable}
      />

      {/* ---- Secondary tier ---- */}
      {view.secondary.enabled ? (
        <Tier
          label="Secondary model"
          hint="Slower, more reliable. Used for skills that opt into the stronger judge, and as the escalation tiebreaker."
          tier={view.secondary}
          value={secondary}
          onChange={setSecondary}
          disabled={!secEditable}
        />
      ) : (
        <div className="panel">
          <div className="eyebrow">Secondary model</div>
          <p className="muted" style={{ marginTop: 6 }}>
            {view.singleModel
              ? "Disabled — the active backend hosts a single model, so every skill uses the primary model only."
              : "Disabled in model_configuration.yaml (secondary_model_allowed: false). Every skill uses the primary model only."}
          </p>
        </div>
      )}

      {!view.readOnly ? (
        <div className="row" style={{ marginTop: 12, gap: 12, alignItems: "center" }}>
          <button className="btn" onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save selection"}
          </button>
          {status ? (
            <span className="muted" style={{ color: status.ok ? "inherit" : "#c0392b" }}>
              {status.msg}
            </span>
          ) : (
            <span className="muted">{dirty ? "Unsaved changes" : "Up to date"}</span>
          )}
        </div>
      ) : null}

      <h2 style={{ marginTop: 28 }}>Model catalog</h2>
      <p className="muted">
        Every known model and its footprint. <strong>Allowed</strong> models are selectable above; pull one
        into the active backend (e.g. <code>ollama pull &lt;id&gt;</code>, or load the GGUF into llama-server)
        before selecting it.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th style={{ padding: "6px 10px" }}>Model</th>
              <th style={{ padding: "6px 10px" }}>id (runtime tag)</th>
              <th style={{ padding: "6px 10px" }}>Roles</th>
              <th style={{ padding: "6px 10px" }}>Status</th>
              <th style={{ padding: "6px 10px" }}>Requirements</th>
            </tr>
          </thead>
          <tbody>
            {view.catalog.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #eee", opacity: m.status === "allowed" ? 1 : 0.5 }}>
                <td style={{ padding: "6px 10px" }}>{m.name}</td>
                <td style={{ padding: "6px 10px", fontFamily: "monospace" }}>{m.id}</td>
                <td style={{ padding: "6px 10px" }}>{m.roles.join(", ")}</td>
                <td style={{ padding: "6px 10px" }}>{m.status}</td>
                <td style={{ padding: "6px 10px" }}>
                  {reqSummary(m.requirements)}
                  {m.requirements?.notes ? (
                    <div className="muted" style={{ fontSize: 12 }}>{m.requirements.notes}</div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
