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

test("decision requires completed fulfillment and a reason, and saves a metric snapshot", () => {
  const decision = { type: "decision", value: "保持", reason: "先核实低使用率商户的使用门槛" } as const;
  assert.equal(reducer(initialState, decision).decision, "");
  let s = { ...initialState };
  for (const type of ["submit", "approve", "publish", "claim", "redeem", "end", "settle"] as const) s = reducer(s, { type });
  assert.equal(reducer(s, { ...decision, reason: "  " }).decision, "");
  s = reducer(s, decision);
  assert.equal(s.decisionReason, decision.reason);
  assert.deepEqual(s.decisionMetrics, { claimed: 500, redeemed: 275, bankCost: 330000, target: 224 });
  assert.deepEqual(reducer(s, { type: "end" }), s);
  assert.deepEqual(reducer(s, { type: "restore" }), s);
  assert.deepEqual(reducer(s, { type: "reset" }), initialState);
});

import { readFileSync } from "node:fs";
import { fixtures as f } from "./fixtures";
test("every published case aggregate matches full-system acceptance evidence", () => {
  const evidence = JSON.parse(readFileSync(new URL("../../../verification/final-patch/targeted-acceptance.json", import.meta.url), "utf8")).demo;
  for (const key of Object.keys(review) as (keyof typeof review)[]) assert.deepEqual(review[key], evidence[key], key);
  const config = JSON.parse(evidence.run.config_json);
  assert.equal(f.campaign.budget, config.bank_budget_total);
  assert.equal(f.campaign.goal, config.target_value);
  assert.equal(f.campaign.start, config.start_time);
  assert.equal(f.campaign.end, config.end_time);
  assert.equal(f.segment.count, evidence.funnel.SNAPSHOT);
  assert.deepEqual(f.benefit, { name: config.benefit.name, face: config.benefit.face_value, minSpend: config.benefit.minimum_spend, bankCost: config.benefit.bank_cost, merchantCost: config.benefit.merchant_cost, days: config.benefit.valid_days });
  assert.deepEqual(f.merchants.slice(0,8).map(m=>m.name), config.merchants.map((m:{name:string})=>m.name));
  assert.deepEqual(config.segment_rule_json, {logic:'AND', conditions:[{op:'=',field:'district',value:'涪陵'},{op:'>=',field:'last_active_days',value:60},{op:'<=',field:'last_active_days',value:180},{op:'>=',field:'points_balance',value:2000},{op:'=',field:'preferred_scene',value:'COMMUNITY'},{op:'=',field:'marketing_consent',value:true}]});
  assert.equal(review.breakdown.merchant.reduce((sum,m)=>sum+m.claimed,0), review.funnel.CLAIMED);
  assert.equal(review.breakdown.merchant.reduce((sum,m)=>sum+m.redeemed,0), review.funnel.REDEEMED);
  assert.equal((review.funnel.CLAIMED-review.funnel.REDEEMED)*f.benefit.bankCost, review.budget.released);
});
