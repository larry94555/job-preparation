import assert from "node:assert/strict";
import { test } from "node:test";
import { clientForSkill } from "./evaluator.js";

// Per-skill judge routing (DESIGN §7 stronger-judge tier). A skill with a
// `grader_model` is graded by that model; without one it uses the pinned default.
// Both paths return a real LlamaClient; identical models share one cached client.

test("skill without grader_model uses the default judge", () => {
  const c = clientForSkill({ frontmatter: {} });
  // Default model comes from LLAMA_MODEL or the built-in "local" fallback.
  assert.equal(c.model, process.env.LLAMA_MODEL ?? "local");
});

test("skill with grader_model routes to that model", () => {
  const c = clientForSkill({ frontmatter: { grader_model: "llama3:8b" } });
  assert.equal(c.model, "llama3:8b");
});

test("same grader_model is cached to one client; different models differ", () => {
  const a = clientForSkill({ frontmatter: { grader_model: "llama3:8b" } });
  const b = clientForSkill({ frontmatter: { grader_model: "llama3:8b" } });
  const d = clientForSkill({ frontmatter: { grader_model: "mixtral:8x7b" } });
  assert.equal(a, b); // cached: same instance
  assert.notEqual(a, d); // distinct model → distinct client
});
