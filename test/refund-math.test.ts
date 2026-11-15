import { test } from "node:test";
import assert from "node:assert/strict";
import { computeRefundAmountCents } from "../src/refund-math.js";

test("computes a 25% refund", () => {
  assert.equal(computeRefundAmountCents(10000, 25), 2500);
});

test("rounds half cents", () => {
  assert.equal(computeRefundAmountCents(999, 50), 500);
});

test("rejects invalid percent", () => {
  assert.throws(() => computeRefundAmountCents(1000, 120));
});
