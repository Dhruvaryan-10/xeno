import assert from "node:assert/strict";
import { test } from "node:test";
import { fallbackFilters, normalizeFilters } from "./filters.js";

test("parses spend and inactivity from a natural-language prompt", () => {
  assert.deepEqual(fallbackFilters("Find customers who spent over INR 5000 and have not purchased in 60 days."), {
    minSpend: 5000,
    inactiveDays: 60
  });
});

test("parses comma-separated amounts, city and channel", () => {
  assert.deepEqual(fallbackFilters("WhatsApp shoppers in Pune who spent above ₹50,000"), {
    minSpend: 50000,
    city: "pune",
    preferredChannel: "WHATSAPP"
  });
});

test("returns no filters for a prompt it cannot understand", () => {
  assert.deepEqual(fallbackFilters("people who like blue"), {});
});

test("normalizeFilters drops non-finite numbers and unknown keys", () => {
  assert.deepEqual(normalizeFilters({ minSpend: Number.NaN, maxAge: 40, ...({ hack: true } as object) }), { maxAge: 40 });
});
