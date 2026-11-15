import assert from "node:assert/strict";
import { test } from "node:test";
import { allCustomers, findCustomers } from "./customers";
import { fallbackFilters, normalizeFilters } from "./filters";
import { countsAt, isFinished, recentEvents, timeline } from "./simulate";

test("customers are identical on every call (no database needed)", () => {
  const first = allCustomers().map((customer) => customer.id);
  assert.equal(first.length, 1000);
  assert.deepEqual(
    allCustomers().map((customer) => customer.id),
    first
  );
});

test("findCustomers applies filters and sorts by spend", () => {
  const matches = findCustomers({ city: "pune", minSpend: 20000 });
  assert.ok(matches.length > 0);
  assert.ok(matches.every((customer) => customer.city === "Pune" && customer.totalSpend >= 20000));
  matches.slice(1).forEach((customer, index) => assert.ok(customer.totalSpend <= matches[index]!.totalSpend));
});

test("fallbackFilters reads spend, inactivity, city and channel", () => {
  assert.deepEqual(fallbackFilters("Find customers who spent over INR 5000 and have not purchased in 60 days."), { minSpend: 5000, inactiveDays: 60 });
  assert.deepEqual(fallbackFilters("WhatsApp shoppers in Pune who spent above ₹50,000"), { minSpend: 50000, city: "pune", preferredChannel: "WHATSAPP" });
  assert.deepEqual(fallbackFilters("Customers in Pune who haven’t ordered in 45 days"), { inactiveDays: 45, city: "pune" });
  assert.deepEqual(fallbackFilters("people who like blue"), {});
});

test("normalizeFilters drops invalid values", () => {
  assert.deepEqual(normalizeFilters({ minSpend: Number.NaN, maxAge: 40, preferredChannel: "FAX" as never }), { maxAge: 40 });
});

test("timeline is deterministic and ordered", () => {
  const a = timeline("c1", "u1", 0);
  assert.deepEqual(timeline("c1", "u1", 0), a);
  a.slice(1).forEach((event, index) => assert.ok(event.at > a[index]!.at));
  assert.ok(["FAILED", "DELIVERED"].includes(a[0]!.status));
});

test("results fill in over time and the campaign finishes", () => {
  const ids = allCustomers()
    .slice(0, 200)
    .map((customer) => customer.id);
  const atLaunch = countsAt("c2", ids, 0, 0);
  assert.equal(atLaunch.QUEUED, 200);
  assert.equal(isFinished("c2", ids, 0, 0), false);

  const later = 10 * 60_000;
  const done = countsAt("c2", ids, 0, later);
  assert.equal(done.QUEUED ?? 0, 0);
  assert.equal(Object.values(done).reduce((sum, value) => sum + (value ?? 0), 0), 200);
  assert.ok((done.FAILED ?? 0) < 40, "failure rate should be near 7%");
  assert.equal(isFinished("c2", ids, 0, later), true);

  const events = recentEvents("c2", ids, 0, later, 5);
  assert.equal(events.length, 5);
  events.slice(1).forEach((event, index) => assert.ok(event.at <= events[index]!.at));
});
