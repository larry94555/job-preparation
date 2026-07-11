import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { allowedModels, getModelConfig, resolveModels, saveModelSelection } from "./model-config.js";

function writeConfig(body: string): string {
  const dir = mkdtempSync(join(tmpdir(), "job-prep-modelcfg-"));
  const path = join(dir, "model_configuration.yaml");
  writeFileSync(path, body);
  return path;
}

const TWO_TIER = `
secondary_model_allowed: true
selection:
  primary: fast-a
  secondary: slow-b
models:
  - id: fast-a
    name: Fast A
    roles: [primary]
    status: allowed
    requirements: { ram_gb: 2, cpu_only: true, gpu_required: false, disk_gb: 1 }
  - id: fast-c
    name: Fast C
    roles: [primary, secondary]
    status: allowed
  - id: slow-b
    name: Slow B
    roles: [secondary]
    status: allowed
  - id: hidden
    name: Hidden
    roles: [primary, secondary]
    status: disallowed
`;

test("getModelConfig returns null for a missing/invalid file, parses a valid one", () => {
  assert.equal(getModelConfig(join(tmpdir(), "does-not-exist-xyz.yaml")), null);
  const path = writeConfig(TWO_TIER);
  try {
    const cfg = getModelConfig(path);
    assert.ok(cfg, "valid config parses");
    assert.equal(cfg?.models.length, 4);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});

test("allowedModels excludes disallowed and role-mismatched entries", () => {
  const path = writeConfig(TWO_TIER);
  try {
    const cfg = getModelConfig(path)!;
    assert.deepEqual(allowedModels(cfg, "primary").map((m) => m.id), ["fast-a", "fast-c"]);
    assert.deepEqual(allowedModels(cfg, "secondary").map((m) => m.id), ["fast-c", "slow-b"]);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});

test("resolveModels honors selection when allowed", () => {
  const path = writeConfig(TWO_TIER);
  try {
    assert.deepEqual(resolveModels(getModelConfig(path)!), { primary: "fast-a", secondary: "slow-b" });
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});

test("resolveModels: secondary_model_allowed:false disables the secondary tier", () => {
  const path = writeConfig(TWO_TIER.replace("secondary_model_allowed: true", "secondary_model_allowed: false"));
  try {
    assert.deepEqual(resolveModels(getModelConfig(path)!), { primary: "fast-a", secondary: null });
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});

test("resolveModels falls back to the first allowed model when the selection isn't allowed", () => {
  const path = writeConfig(TWO_TIER.replace("primary: fast-a", "primary: hidden"));
  try {
    // 'hidden' is disallowed → fall back to first allowed primary, 'fast-a'.
    assert.equal(resolveModels(getModelConfig(path)!).primary, "fast-a");
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});

test("saveModelSelection validates picks, writes, and preserves the file", () => {
  const path = writeConfig(TWO_TIER);
  try {
    const updated = saveModelSelection({ primary: "fast-c", secondary: "fast-c" }, path);
    assert.equal(updated.selection.primary, "fast-c");
    assert.equal(updated.selection.secondary, "fast-c");
    // Persisted to disk and reloads identically.
    assert.equal(getModelConfig(path)!.selection.primary, "fast-c");

    // Rejects a model that isn't allowed for the tier.
    assert.throws(() => saveModelSelection({ primary: "slow-b" }, path), /not an allowed primary/);
    assert.throws(() => saveModelSelection({ secondary: "fast-a" }, path), /not an allowed secondary/);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});

test("saveModelSelection refuses to set a secondary when the tier is disabled", () => {
  const path = writeConfig(TWO_TIER.replace("secondary_model_allowed: true", "secondary_model_allowed: false"));
  try {
    assert.throws(() => saveModelSelection({ secondary: "slow-b" }, path), /disabled/);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});
