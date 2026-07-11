// Reference fix — the one-line change is to STORE the result under
// `idempotencyKey` after the first run, so repeats hit the cache and the tool
// is not re-executed. (Kept out of the repo's starter; used only to
// sandbox-verify the exercise.)
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
    // Record the result under the idempotency key so any retry with the same
    // key returns this value without re-running the tool.
    this.cache.set(idempotencyKey, result);
    return result;
  }
}
