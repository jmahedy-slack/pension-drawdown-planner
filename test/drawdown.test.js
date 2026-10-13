import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateDrawdown, formatDuration, PROJECTION_HORIZON } from "../src/drawdown.js";

test("£500k, £30k/yr, 4% growth, inflation off → 26 years", () => {
  const result = calculateDrawdown({
    potSize: 500_000,
    annualWithdrawal: 30_000,
    annualGrowthPercent: 4,
    inflationLinked: false,
  });
  assert.equal(result.yearsLast, 26);
  assert.equal(result.lastsBeyondHorizon, false);
  assert.equal(formatDuration(result), "Your pot lasts 26 years");
});

test("£500k, £30k/yr, 4% growth, inflation-linked → 18 years", () => {
  const result = calculateDrawdown({
    potSize: 500_000,
    annualWithdrawal: 30_000,
    annualGrowthPercent: 4,
    inflationLinked: true,
  });
  assert.equal(result.yearsLast, 18);
  assert.equal(result.lastsBeyondHorizon, false);
  assert.equal(formatDuration(result), "Your pot lasts 18 years");
});

test("£500k, £20k/yr, 4% growth → lasts beyond 40 years", () => {
  const result = calculateDrawdown({
    potSize: 500_000,
    annualWithdrawal: 20_000,
    annualGrowthPercent: 4,
    inflationLinked: false,
  });
  assert.equal(result.yearsLast, PROJECTION_HORIZON);
  assert.equal(result.lastsBeyondHorizon, true);
  assert.equal(formatDuration(result), `Lasts beyond ${PROJECTION_HORIZON} years`);
  assert.equal(result.yearlyPotAtStart.length, PROJECTION_HORIZON);
});
