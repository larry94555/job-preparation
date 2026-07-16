"use client";

import { useEffect, useRef } from "react";

// Lazily load mermaid once per browser session and initialize it. Kept out of the
// initial bundle via dynamic import — only lesson/sample pages that actually show
// material pull it in, and only when a diagram is present.
let mermaidReady: Promise<(typeof import("mermaid"))["default"]> | null = null;
function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "neutral",
        fontFamily: "inherit",
      });
      return mermaid;
    });
  }
  return mermaidReady;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renders sanitized lesson material HTML and turns any `<pre class="mermaid">`
 * blocks (emitted by the markdown pipeline from ```mermaid fences) into SVG
 * diagrams on the client. Best-effort: if mermaid fails to load or a diagram is
 * invalid, the raw source stays visible instead of breaking the page.
 */
export default function Material({ heading, html }: { heading?: string; html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const full = heading ? `<h2>${escapeHtml(heading)}</h2>${html}` : html;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("pre.mermaid"));
    if (nodes.length === 0) return;
    let cancelled = false;
    void loadMermaid()
      .then((mermaid) => {
        if (!cancelled) return mermaid.run({ nodes });
      })
      .catch(() => {
        /* leave the raw diagram source visible on failure */
      });
    return () => {
      cancelled = true;
    };
  }, [full]);

  return (
    <div
      className="material"
      ref={ref}
      // Server-rendered, sanitized lesson HTML from the content pipeline.
      dangerouslySetInnerHTML={{ __html: full }}
    />
  );
}
