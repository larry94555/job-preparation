export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlamaOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

/**
 * Minimal client for a llama.cpp `llama-server` (OpenAI-compatible endpoint).
 * Defaults target a local server; override via env (LLAMA_BASE_URL / LLAMA_MODEL).
 */
export class LlamaClient {
  baseUrl: string;
  model: string;
  timeoutMs: number;

  constructor(o: LlamaOptions = {}) {
    this.baseUrl = o.baseUrl ?? process.env.LLAMA_BASE_URL ?? "http://localhost:8080/v1";
    this.model = o.model ?? process.env.LLAMA_MODEL ?? "local";
    this.timeoutMs = o.timeoutMs ?? 60000;
  }

  /** Returns true if the server answers a models/health probe quickly. */
  async health(): Promise<boolean> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(`${this.baseUrl}/models`, { signal: ctrl.signal });
      clearTimeout(t);
      return r.ok;
    } catch {
      return false;
    }
  }

  /** Chat completion constrained to JSON output. Throws on network/HTTP error. */
  async chatJson(messages: ChatMessage[]): Promise<string> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0,
          response_format: { type: "json_object" },
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`llama-server responded ${res.status}`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(t);
    }
  }
}
