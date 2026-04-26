import { describe, expect, test } from "vitest";

import {
  calculateRoi,
  calculateRoiCase,
  DEFAULT_MULTIPLIERS,
} from "../src/index.js";

describe("calculateRoi", () => {
  test("keeps the compact annual value API while using current defaults", () => {
    const r = calculateRoi({
      designersFte: 5,
      developersFte: 10,
      qaOtherFte: 2,
      blendedHourlyRate: 150,
      multipliers: DEFAULT_MULTIPLIERS,
    });

    // 5*40*0.38 = 76
    expect(r.weeklyHoursSavedDesign).toBeCloseTo(76, 8);
    // 10*40*0.31 = 124
    expect(r.weeklyHoursSavedDev).toBeCloseTo(124, 8);
    expect(r.weeklyHoursSavedTotal).toBeCloseTo(200, 8);

    // 200*52 = 10,400
    expect(r.annualHoursSaved).toBeCloseTo(10400, 8);
    // 10,400 * 150 = 1,560,000
    expect(r.annualValue).toBeCloseTo(1560000, 8);
    expect(r.valuePerFtePerYear).toBeCloseTo(1560000 / 17, 6);
  });
});

describe("calculateRoiCase", () => {
  test("models role value, ramp-up, investment, payback, and NPV", () => {
    const r = calculateRoiCase({
      blendedHourlyRate: 150,
      rampUpMonths: 6,
      analysisYears: 3,
      discountRate: 0.08,
      roles: [
        { id: "design", label: "Design", fte: 5, efficiencyGain: 0.38 },
        { id: "dev", label: "Development", fte: 10, efficiencyGain: 0.31 },
        { id: "qa", label: "QA", fte: 2, efficiencyGain: 0.12 },
      ],
      investment: {
        oneTimeCost: 100000,
        annualProgramCost: 300000,
      },
    });

    expect(r.roles).toHaveLength(3);
    expect(r.summary.annualHoursSaved).toBeCloseTo(10899.2, 6);
    expect(r.summary.annualGrossValue).toBeCloseTo(1634880, 6);

    // First six months are modeled at half benefit, then run-rate benefit.
    expect(r.summary.yearOneGrossBenefit).toBeCloseTo(1226160, 6);
    expect(r.summary.yearOneInvestmentCost).toBeCloseTo(400000, 6);
    expect(r.summary.yearOneRoiPercent).toBeCloseTo(206.54, 2);
    expect(r.summary.paybackMonths).toBeCloseTo(2.32, 2);
    expect(r.summary.npv).toBeGreaterThan(2500000);
    expect(r.summary.benefitCostRatio).toBeGreaterThan(3);
  });

  test("returns scenario summaries for sensitivity checks", () => {
    const r = calculateRoiCase({
      blendedHourlyRate: 150,
      roles: [
        { id: "design", label: "Design", fte: 5, efficiencyGain: 0.38 },
        { id: "dev", label: "Development", fte: 10, efficiencyGain: 0.31 },
      ],
      investment: {
        oneTimeCost: 100000,
        annualProgramCost: 300000,
      },
    });

    expect(r.scenarios.map((scenario) => scenario.id)).toEqual([
      "conservative",
      "expected",
      "aggressive",
    ]);
    expect(r.scenarios[0]?.npv).toBeLessThan(r.scenarios[1]?.npv ?? 0);
    expect(r.scenarios[2]?.npv).toBeGreaterThan(r.scenarios[1]?.npv ?? 0);
  });
});
