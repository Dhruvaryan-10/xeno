import assert from "node:assert/strict";
import { test } from "node:test";
import { wrap } from "./screen-texture";

// Fake measurer: every character is 10px wide.
const ctx = { measureText: (text: string) => ({ width: text.length * 10 }) as TextMetrics };

test("wrap breaks lines at word boundaries within the width", () => {
  const lines = wrap(ctx, "one two three four five", 100);
  assert.deepEqual(lines, ["one two", "three four", "five"]);
  lines.forEach((line) => assert.ok(line.length * 10 <= 100));
});

test("wrap keeps a single over-long word on its own line", () => {
  assert.deepEqual(wrap(ctx, "supercalifragilistic ok", 50), ["supercalifragilistic", "ok"]);
});
