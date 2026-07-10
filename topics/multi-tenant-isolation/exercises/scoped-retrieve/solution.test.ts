import assert from "node:assert/strict";
import { test } from "node:test";
import { scopedRetrieve } from "./solution.js";

test("excludes another tenant's doc even when it has the highest score", () => {
  const docs = [
    { id: "other-top", tenantId: "globex", score: 0.99 }, // highest overall, WRONG tenant
    { id: "mine-1", tenantId: "acme", score: 0.80 },
    { id: "mine-2", tenantId: "acme", score: 0.60 },
  ];
  // acme must never see globex's doc, despite its 0.99 score.
  assert.deepEqual(scopedRetrieve(docs, "acme", 2), ["mine-1", "mine-2"]);
});

test("ranks within-tenant matches by score descending", () => {
  const docs = [
    { id: "low", tenantId: "acme", score: 0.10 },
    { id: "high", tenantId: "acme", score: 0.90 },
    { id: "mid", tenantId: "acme", score: 0.50 },
  ];
  assert.deepEqual(scopedRetrieve(docs, "acme", 3), ["high", "mid", "low"]);
});

test("k caps the number of results", () => {
  const docs = [
    { id: "a", tenantId: "acme", score: 0.90 },
    { id: "b", tenantId: "acme", score: 0.80 },
    { id: "c", tenantId: "acme", score: 0.70 },
  ];
  assert.deepEqual(scopedRetrieve(docs, "acme", 1), ["a"]);
});

test("fewer than k matches returns all of the tenant's matches", () => {
  const docs = [
    { id: "only", tenantId: "acme", score: 0.42 },
    { id: "foreign", tenantId: "globex", score: 0.95 },
  ];
  assert.deepEqual(scopedRetrieve(docs, "acme", 5), ["only"]);
});
