import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState, reducer, budget } from "./reducer";
import review from "./review.json";
test("governance blocks publication after reviewed configuration change", () => {
  let s = reducer(initialState, { type: "publish" });
  assert.equal(s.published, false);
  s = reducer(s, { type: "submit" });
  s = reducer(s, { type: "approve" });
  s = reducer(s, { type: "change" });
  s = reducer(s, { type: "publish" });
  assert.equal(s.published, false);
  assert.equal(s.reviewStatus, "需重新复核");
  s = reducer(s, { type: "restore" });
  s = reducer(s, { type: "approve" });
  s = reducer(s, { type: "publish" });
  assert.equal(s.published, true);
});
test("claim, redeem and settlement preserve budget semantics and idempotency", () => {
  let s = { ...initialState };
  assert.equal(reducer(s, { type: "claim" }).claimStatus, "可领取");
  for (const type of [
    "submit",
    "approve",
    "publish",
    "claim",
    "redeem",
  ] as const)
    s = reducer(s, { type });
  assert.equal(budget(s).committed, 1200);
  s = reducer(s, { type: "redeem" });
  assert.equal(budget(s).committed, 1200);
  assert.match(s.notice, /不重复/);
  s = reducer(s, { type: "end" });
  assert.equal(s.fulfillmentStatus, "进行中");
  s = reducer(s, { type: "settle" });
  assert.deepEqual(budget(s), {
    total: 600000,
    reserved: 0,
    committed: 330000,
    released: 270000,
    available: 270000,
  });
  assert.equal(reducer(s, { type: "claim" }).claimStatus, "已领取");
  assert.deepEqual(reducer(s, { type: "reset" }), initialState);
});
test("fixture is the current accepted complete case", () => {
  assert.equal(review.funnel.SNAPSHOT, 2166);
  assert.equal(review.funnel.DELIVERED, 1563);
  assert.equal(review.funnel.PARTICIPATED, 964);
  assert.equal(review.funnel.CLAIMED, 500);
  assert.equal(review.funnel.REDEEMED, 275);
  assert.equal(review.target_actual, 224);
  assert.equal(review.target_value, 150);
  assert.equal(review.budget.committed, 330000);
  assert.equal(review.budget.released, 270000);
  assert.equal(review.merchant_contribution, 220000);
  assert.equal(
    review.breakdown.merchant.reduce((n, x) => n + x.bank_cost, 0),
    330000,
  );
});
