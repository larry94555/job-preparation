export interface Tool {
  handler: (args: any) => any;
  validate?: (args: any) => boolean;
  mutating?: boolean;
}
export type CallResult = { ok: true; value: any } | { ok: false; error: string };
export interface CallOptions {
  idempotencyKey?: string;
}

export class ToolDispatcher {
  register(name: string, tool: Tool): void {
    throw new Error("not implemented");
  }

  /**
   * TODO:
   *   - unknown tool → { ok:false, error:"unknown_tool" }  (do NOT throw)
   *   - validate present and validate(args) === false → { ok:false, error:"invalid_args" } (handler not run)
   *   - mutating tool + opts.idempotencyKey already seen → return the cached prior result (handler not run)
   *   - otherwise run the handler; for mutating tools with a key, cache the result
   *   Return { ok:true, value: handler(args) }.
   */
  call(name: string, args: any, opts: CallOptions = {}): CallResult {
    throw new Error("not implemented");
  }
}
