export interface Section {
  id: string;
  tokens: number;
  priority: number;
}

/**
 * TODO:
 *   1. Sort sections by priority DESCENDING.
 *   2. Walk the ranked list, keeping a running token total. Include a section (push its id) if
 *      total + tokens <= tokenBudget; otherwise skip it but keep scanning (a smaller lower-priority
 *      section may still fit the remaining budget).
 *   3. Return the included ids, in priority order.
 */
export function assembleContext(sections: Section[], tokenBudget: number): string[] {
  throw new Error("not implemented");
}
