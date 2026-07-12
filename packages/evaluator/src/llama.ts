export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlamaOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  /** Bearer token sent as `Authorization` (for a llama-server started with --api-key). */
  apiKey?: string;
}

/**
 * Minimal client for a llama.cpp `llama-server` (OpenAI-compatible endpoint).
 * Defaults target a local server; override via env (LLAMA_BASE_URL / LLAMA_MODEL).
 */
export class LlamaClient {
  baseUrl: string;
  model: string;
  timeoutMs: number;
  apiKey?: string;

  constructor(o: LlamaOptions = {}) {
    this.baseUrl = o.baseUrl ?? process.env.LLAMA_BASE_URL ?? "http://localhost:8080/v1";
    this.model = o.model ?? process.env.LLAMA_MODEL ?? "local";
    this.timeoutMs = o.timeoutMs ?? 60000;
    this.apiKey = o.apiKey ?? process.env.LLAMA_API_KEY;
  }

  /** Auth header for a secured llama-server (--api-key); empty when open. */
  private authHeaders(): Record<string, string> {
    return this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {};
  }

  /** Returns true if the server answers a models/health probe quickly. */
  async health(): Promise<boolean> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(`${this.baseUrl}/models`, {
        signal: ctrl.signal,
        headers: this.authHeaders(),
      });
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
        headers: { "content-type": "application/json", ...this.authHeaders() },
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
