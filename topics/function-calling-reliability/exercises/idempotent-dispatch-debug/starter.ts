/**
 * DEBUGGING EXERCISE — this dispatcher is BROKEN.
 *
 * Symptom reported in production: when the agent loop loses a tool response and
 * RETRIES a write (e.g. `refundOrder`), the refund is applied TWICE. Each retry
 * carries the SAME idempotency key, yet the side effect runs again on every
 * dispatch instead of being served from cache. A tool that should run "at most
 * once per idempotency key" is running once per call.
 *
 * The dispatcher is meant to be idempotent: `dispatch(name, args, idempotencyKey)`
 * runs the tool the first time it sees a key and, on any repeat of that key,
 * returns the cached result WITHOUT re-running the tool.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - the first dispatch for a key runs the tool and remembers its result,
 *   - any later dispatch with the SAME key returns the cached result and does
 *     NOT execute the tool again,
 *   - dispatches with DIFFERENT keys each execute the tool once.
 *
 * Do NOT rewrite the class — make the minimal correct fix.
 */
export type Tool = (args: Record<string, unknown>) => unknown;

export class ToolDispatcher {
  private tools = new Map<string, Tool>();
  private cache = new Map<string, unknown>();

  register(name: string, tool: Tool): void {
    this.tools.set(name, tool);
  }

  dispatch(name: string, args: Record<string, unknown>, idempotencyKey: string): unknown {
    if (this.cache.has(idempotencyKey)) {
      return this.cache.get(idempotencyKey);
    }
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`unknown tool: ${name}`);
    const result = tool(args);
    // BUG: the result is never stored under `idempotencyKey`, so the cache check
    // above never hits and the tool re-executes its side effect on every retry.
    return result;
  }
}
