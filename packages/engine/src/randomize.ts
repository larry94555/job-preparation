import type { MultipleChoiceQuestion, Question, TextInputQuestion } from "@job-prep/schema";

/**
 * Deterministic, seedable randomization. Every quiz session stores its seed so
 * any attempt can be reproduced exactly for review.
 */

/** mulberry32 PRNG — small, fast, deterministic. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash an arbitrary string (e.g. a session id) into a 32-bit seed. */
export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** In-place-free Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Resolve a question's `parameters` block to concrete string values. */
export function resolveParameters(
  parameters: TextInputQuestion["parameters"],
  rng: () => number,
): Record<string, string> {
  const values: Record<string, string> = {};
  if (!parameters) return values;
  for (const [name, gen] of Object.entries(parameters)) {
    const [lo, hi] = gen.random_int;
    const n = lo + Math.floor(rng() * (hi - lo + 1));
    values[name] = String(n);
  }
  return values;
}

/** Substitute `{{name}}` placeholders with resolved values. */
export function applyParams(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, name) =>
    name in values ? values[name] : whole,
  );
}

export interface PreparedMcqOption {
  text: string;
  /** Kept server-side; never send to the client. */
  correct: boolean;
}

export type PreparedQuestion =
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      options: PreparedMcqOption[];
    }
  | {
      id: string;
      type: "text_input";
      prompt: string;
      params: Record<string, string>;
    }
  | { id: string; type: "essay"; prompt: string }
  | { id: string; type: "code"; prompt: string };

/**
 * Produce a presentation-ready question for a given seed: MCQ options shuffled
 * (correctness preserved), text-input parameters resolved and substituted.
 */
export function prepareQuestion(question: Question, rng: () => number): PreparedQuestion {
  switch (question.type) {
    case "multiple_choice": {
      const q = question as MultipleChoiceQuestion;
      const options = q.shuffle_options ? shuffle(q.options, rng) : q.options.slice();
      return {
        id: q.id,
        type: "multiple_choice",
        prompt: q.prompt,
        options: options.map((o) => ({ text: o.text, correct: o.correct })),
      };
    }
    case "text_input": {
      const q = question as TextInputQuestion;
      const params = resolveParameters(q.parameters, rng);
      return {
        id: q.id,
        type: "text_input",
        prompt: applyParams(q.prompt, params),
        params,
      };
    }
    case "essay":
      return { id: question.id, type: "essay", prompt: question.prompt };
    case "code":
      return { id: question.id, type: "code", prompt: question.prompt };
  }
}
