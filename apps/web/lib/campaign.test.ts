import assert from "node:assert/strict";
import { test } from "node:test";
import { describeFilters, funnel } from "./campaign";

test("funnel counts a message in every stage it has passed", () => {
  const result = funnel({ DELIVERED: 10, OPENED: 5, CLICKED: 3, CONVERTED: 2, FAILED: 4, QUEUED: 1 });
  assert.deepEqual(
    result.stages.map((stage) => stage.value),
    [20, 10, 5, 2]
  );
  assert.equal(result.total, 25);
  assert.equal(result.failed, 4);
  assert.equal(result.pending, 1);
});

test("funnel stages never increase", () => {
  const { stages } = funnel({ OPENED: 7, CONVERTED: 9 });
  stages.slice(1).forEach((stage, index) => assert.ok(stage.value <= stages[index]!.value));
});

test("describeFilters writes filters in plain language", () => {
  assert.deepEqual(describeFilters({ minSpend: 5000, inactiveDays: 60, city: "pune", minAge: 25, maxAge: 40, preferredChannel: "WHATSAPP" }), [
    "Spent over ₹5,000",
    "No purchase in 60+ days",
    "Lives in Pune",
    "Aged 25 to 40",
    "Prefers WhatsApp"
  ]);
  assert.deepEqual(describeFilters({}), []);
});
