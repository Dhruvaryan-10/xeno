import assert from "node:assert/strict";
import { test } from "node:test";
import { safeEqual, sign, verifySignature } from "./security.js";

const secret = "test-secret";
const body = JSON.stringify({ communicationId: "c1", status: "DELIVERED" });

test("accepts a correctly signed body", () => {
  assert.equal(verifySignature(body, sign(body, secret), secret), true);
});

test("rejects a tampered body, wrong secret, or missing signature", () => {
  assert.equal(verifySignature(body.replace("DELIVERED", "CONVERTED"), sign(body, secret), secret), false);
  assert.equal(verifySignature(body, sign(body, "other"), secret), false);
  assert.equal(verifySignature(body, undefined, secret), false);
});

test("safeEqual handles different lengths without throwing", () => {
  assert.equal(safeEqual("abc", "abcd"), false);
  assert.equal(safeEqual("abc", "abc"), true);
});
