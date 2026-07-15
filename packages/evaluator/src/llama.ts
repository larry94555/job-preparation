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
  /** Fixed RNG seed for reproducible grading (default 0). */
  seed?: number;
  /** Cap on generated tokens per grade — bounds runaway output (default 1024). */
  maxTokens?: number;
}

/**
 * Read an LLM grader env var. The canonical prefix is `LLM_` — the grader talks
 * to any OpenAI-compatible server (llama.cpp, Ollama, vLLM, …), so the config
 * surface isn't tied to a specific model family. The older `LLAMA_` prefix is
 * still honored as a deprecated alias so existing configs keep working.
 */
export function llmEnv(suffix: string): string | undefined {
  return process.env[`LLM_${suffix}`] ?? process.env[`LLAMA_${suffix}`];
}

/**
 * Minimal client for an OpenAI-compatible chat-completions server (e.g. a
 * llama.cpp `llama-server`). Defaults target a local server; override via env
 * (`LLM_BASE_URL` / `LLM_MODEL`; the legacy `LLAMA_*` names still work).
 */
export class LlamaClient {
  baseUrl: string;
  model: string;
  timeoutMs: number;
  apiKey?: string;
  seed: number;
  maxTokens: number;

  constructor(o: LlamaOptions = {}) {
    this.baseUrl = o.baseUrl ?? llmEnv("BASE_URL") ?? "http://localhost:8080/v1";
    this.model = o.model ?? llmEnv("MODEL") ?? "local";
    // Default 60s; raise via LLM_TIMEOUT_MS for slow CPU / reasoning models
    // (e.g. DeepSeek-R1 on Oracle Cloud can take 40–90s per grading).
    this.timeoutMs = o.timeoutMs ?? (Number(llmEnv("TIMEOUT_MS")) || 60000);
    this.apiKey = o.apiKey ?? llmEnv("API_KEY");
    // Pin sampling for reproducible grades regardless of server-side defaults.
    this.seed = o.seed ?? (Number(llmEnv("SEED")) || 0);
    this.maxTokens = o.maxTokens ?? (Number(llmEnv("MAX_TOKENS")) || 1024);
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

  /**
   * Number of parallel slots the server runs, from `/props` (`total_slots`), or
   * null if unavailable. More than one slot means continuous batching, which is
   * NON-DETERMINISTIC even at temperature 0 — grading must use `--parallel 1`.
   */
  async slotCount(): Promise<number | null> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(`${this.baseUrl.replace(/\/v1$/, "")}/props`, {
        signal: ctrl.signal,
        headers: this.authHeaders(),
      });
      clearTimeout(t);
      if (!r.ok) return null;
      const data = (await r.json()) as { total_slots?: number };
      return typeof data.total_slots === "number" ? data.total_slots : null;
    } catch {
      return null;
    }
  }

  /**
   * True if the grading endpoint (`/chat/completions`) accepts an authenticated
   * request. Unlike `health()` (which probes the PUBLIC `/models`), this verifies
   * the grader can ACTUALLY grade — so callers self-skip when the model is
   * unreachable OR the API key is missing/wrong (e.g. in CI), instead of grading
   * everything as 0%. Sends a 1-token no-op completion.
   */
  async canGrade(): Promise<boolean> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), Math.min(this.timeoutMs, 15000));
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", ...this.authHeaders() },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
          temperature: 0,
        }),
        signal: ctrl.signal,
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(t);
    }
  }

  /** Chat completion constrained to JSON output. Throws on network/HTTP error. */
  async chatJson(messages: ChatMessage[]): Promise<string> {
    return this.chat(messages, true);
  }

  /**
   * Chat completion with free-form (non-JSON) output. Use when the reply must
   * carry text that would be fragile inside a JSON string — e.g. prompts that
   * themselves contain double-quotes, which the model routinely emits unescaped
   * in JSON mode and breaks JSON.parse. Callers pick a quote-proof delimiter.
   */
  async chatText(messages: ChatMessage[]): Promise<string> {
    return this.chat(messages, false);
  }

  private async chat(messages: ChatMessage[], jsonMode: boolean): Promise<string> {
    // The single-slot server (--parallel 1, required for determinism) sometimes
    // times out or returns 5xx under back-to-back grading load. Because decoding
    // is deterministic (temp 0, greedy), a short backoff + retry recovers the
    // SAME correct grade rather than a different one — so a transient hiccup no
    // longer collapses to an un-gradeable result. 4xx (e.g. missing API key) is
    // a real client error and is surfaced immediately without retrying.
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 600 * attempt));
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
            top_k: 1, // greedy — decisive with temperature 0, robust to server defaults
            seed: this.seed,
            max_tokens: this.maxTokens,
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          }),
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          return data.choices?.[0]?.message?.content ?? "";
        }
        if (res.status < 500) throw new Error(`llama-server responded ${res.status}`);
        lastErr = new Error(`llama-server responded ${res.status}`); // 5xx → retry
      } catch (e) {
        if (e instanceof Error && /responded 4\d\d/.test(e.message)) throw e; // client error
        lastErr = e; // network error / timeout abort → retry
      } finally {
        clearTimeout(t);
      }
    }
    throw lastErr ?? new Error("chat: exhausted retries");
  }
}
