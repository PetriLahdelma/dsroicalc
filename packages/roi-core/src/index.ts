export type RoiMultipliers = {
  // Fractional efficiency gain (e.g. 0.38 = 38%).
  designEfficiencyGain: number;
  developmentEfficiencyGain: number;
};

export type RoiInputs = {
  // Full-time equivalents.
  designersFte: number;
  developersFte: number;
  qaOtherFte?: number;

  // Loaded blended cost per hour (salary + benefits + overhead).
  blendedHourlyRate: number;

  // Defaults follow the Smashing Magazine ROI article's cited averages:
  // 38% for design and 31% for development.
  multipliers?: RoiMultipliers;

  // Optional investment inputs if you want % ROI / payback.
  // If omitted, this library still returns annual value ("efficiency value").
  annualInvestmentCost?: number;
  oneTimeInvestmentCost?: number;
};

export type RoiResult = {
  multipliersUsed: RoiMultipliers;

  weeklyHoursSavedDesign: number;
  weeklyHoursSavedDev: number;
  weeklyHoursSavedTotal: number;

  annualHoursSaved: number;
  annualValue: number;

  valuePerFtePerYear: number;

  // Optional ROI metrics if investment inputs are provided.
  roiPercent?: number;
  paybackMonths?: number;
};

export type RoiRoleInput = {
  id: string;
  label: string;
  fte: number;
  efficiencyGain: number;
  adoptionRate?: number;
  hourlyRate?: number;
  weeklyHoursPerFte?: number;
  includeInSavings?: boolean;
};

export type RoiInvestmentInput = {
  oneTimeCost?: number;
  annualProgramCost?: number;
  designSystemFte?: number;
  designSystemHourlyRate?: number;
  designSystemAllocation?: number;
  maintenanceHoursPerMonth?: number;
  maintenanceHourlyRate?: number;
};

export type RoiScenarioInput = {
  id: "conservative" | "expected" | "aggressive" | string;
  label: string;
  benefitMultiplier: number;
  costMultiplier: number;
  description?: string;
};

export type RoiCaseInputs = {
  roles: RoiRoleInput[];
  blendedHourlyRate: number;
  investment?: RoiInvestmentInput;
  rampUpMonths?: number;
  analysisYears?: number;
  discountRate?: number;
  scenarios?: RoiScenarioInput[];
};

export type RoiRoleResult = {
  id: string;
  label: string;
  fte: number;
  hourlyRate: number;
  efficiencyGain: number;
  adoptionRate: number;
  weeklyHoursSaved: number;
  annualHoursSaved: number;
  annualValue: number;
};

export type RoiMonthCashFlow = {
  month: number;
  grossBenefit: number;
  investmentCost: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  discountedNetCashFlow: number;
};

export type RoiYearCashFlow = {
  year: number;
  grossBenefit: number;
  investmentCost: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  discountedNetCashFlow: number;
};

export type RoiScenarioResult = {
  id: string;
  label: string;
  description?: string;
  annualGrossValue: number;
  annualNetValue: number;
  yearOneRoiPercent?: number;
  paybackMonths?: number;
  npv: number;
  benefitCostRatio?: number;
};

export type RoiCaseResult = {
  roles: RoiRoleResult[];
  monthlyCashFlows: RoiMonthCashFlow[];
  yearlyCashFlows: RoiYearCashFlow[];
  scenarios: RoiScenarioResult[];
  summary: {
    annualHoursSaved: number;
    annualGrossValue: number;
    annualProgramCost: number;
    annualNetValue: number;
    yearOneGrossBenefit: number;
    yearOneInvestmentCost: number;
    yearOneNetValue: number;
    yearOneRoiPercent?: number;
    paybackMonths?: number;
    npv: number;
    benefitCostRatio?: number;
    analysisYears: number;
    rampUpMonths: number;
    discountRate: number;
  };
};

export const HOURS_PER_WEEK_PER_FTE = 40;
export const WEEKS_PER_YEAR = 52;

export const DEFAULT_MULTIPLIERS: RoiMultipliers = {
  designEfficiencyGain: 0.38,
  developmentEfficiencyGain: 0.31,
};

export const DEFAULT_ROLE_BENCHMARKS = {
  design: {
    label: "Design",
    efficiencyGain: 0.38,
  },
  development: {
    label: "Development",
    efficiencyGain: 0.31,
  },
  qa: {
    label: "QA",
    efficiencyGain: 0.12,
  },
  product: {
    label: "Product",
    efficiencyGain: 0.1,
  },
} as const;

export const DEFAULT_SCENARIOS: RoiScenarioInput[] = [
  {
    id: "conservative",
    label: "Conservative",
    benefitMultiplier: 0.7,
    costMultiplier: 1.15,
    description: "Lower adoption and higher delivery cost.",
  },
  {
    id: "expected",
    label: "Expected",
    benefitMultiplier: 1,
    costMultiplier: 1,
    description: "Current assumptions.",
  },
  {
    id: "aggressive",
    label: "Aggressive",
    benefitMultiplier: 1.25,
    costMultiplier: 0.95,
    description: "Faster adoption and tighter delivery.",
  },
];

function assertFiniteNonNegative(n: number, field: string) {
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${field} must be a finite, non-negative number.`);
  }
}

function assertRate(n: number, field: string) {
  assertFiniteNonNegative(n, field);
  if (n > 1) {
    throw new Error(`${field} must be a fraction between 0 and 1.`);
  }
}

function positiveIntOrDefault(n: number | undefined, fallback: number, field: string) {
  if (n == null) return fallback;
  assertFiniteNonNegative(n, field);
  const rounded = Math.round(n);
  if (rounded < 1) {
    throw new Error(`${field} must be at least 1.`);
  }
  return rounded;
}

function optionalNonNegative(n: number | undefined, fallback: number, field: string) {
  if (n == null) return fallback;
  assertFiniteNonNegative(n, field);
  return n;
}

function roleToResult(role: RoiRoleInput, blendedHourlyRate: number): RoiRoleResult {
  assertFiniteNonNegative(role.fte, `roles.${role.id}.fte`);
  assertRate(role.efficiencyGain, `roles.${role.id}.efficiencyGain`);

  const adoptionRate = role.adoptionRate ?? 1;
  assertRate(adoptionRate, `roles.${role.id}.adoptionRate`);

  const hourlyRate = role.hourlyRate ?? blendedHourlyRate;
  const weeklyHoursPerFte = role.weeklyHoursPerFte ?? HOURS_PER_WEEK_PER_FTE;
  assertFiniteNonNegative(hourlyRate, `roles.${role.id}.hourlyRate`);
  assertFiniteNonNegative(weeklyHoursPerFte, `roles.${role.id}.weeklyHoursPerFte`);

  const savingsEnabled = role.includeInSavings ?? true;
  const weeklyHoursSaved = savingsEnabled
    ? role.fte * weeklyHoursPerFte * role.efficiencyGain * adoptionRate
    : 0;
  const annualHoursSaved = weeklyHoursSaved * WEEKS_PER_YEAR;

  return {
    id: role.id,
    label: role.label,
    fte: role.fte,
    hourlyRate,
    efficiencyGain: role.efficiencyGain,
    adoptionRate,
    weeklyHoursSaved,
    annualHoursSaved,
    annualValue: annualHoursSaved * hourlyRate,
  };
}

function annualInvestmentCost(investment: RoiInvestmentInput | undefined, blendedHourlyRate: number) {
  const annualProgramCost = optionalNonNegative(
    investment?.annualProgramCost,
    0,
    "investment.annualProgramCost",
  );
  const designSystemFte = optionalNonNegative(
    investment?.designSystemFte,
    0,
    "investment.designSystemFte",
  );
  const designSystemHourlyRate = optionalNonNegative(
    investment?.designSystemHourlyRate,
    blendedHourlyRate,
    "investment.designSystemHourlyRate",
  );
  const designSystemAllocation = investment?.designSystemAllocation ?? 1;
  assertRate(designSystemAllocation, "investment.designSystemAllocation");

  const maintenanceHoursPerMonth = optionalNonNegative(
    investment?.maintenanceHoursPerMonth,
    0,
    "investment.maintenanceHoursPerMonth",
  );
  const maintenanceHourlyRate = optionalNonNegative(
    investment?.maintenanceHourlyRate,
    blendedHourlyRate,
    "investment.maintenanceHourlyRate",
  );

  return (
    annualProgramCost +
    designSystemFte * HOURS_PER_WEEK_PER_FTE * WEEKS_PER_YEAR * designSystemHourlyRate * designSystemAllocation +
    maintenanceHoursPerMonth * 12 * maintenanceHourlyRate
  );
}

function oneTimeInvestmentCost(investment: RoiInvestmentInput | undefined) {
  return optionalNonNegative(investment?.oneTimeCost, 0, "investment.oneTimeCost");
}

function buildMonthlyCashFlows(params: {
  annualGrossValue: number;
  annualProgramCost: number;
  oneTimeCost: number;
  analysisYears: number;
  rampUpMonths: number;
  discountRate: number;
}) {
  const months = params.analysisYears * 12;
  const grossRunRateMonth = params.annualGrossValue / 12;
  const programCostMonth = params.annualProgramCost / 12;
  const monthlyDiscountRate = Math.pow(1 + params.discountRate, 1 / 12) - 1;

  const monthlyCashFlows: RoiMonthCashFlow[] = [];
  let cumulativeCashFlow = 0;

  for (let month = 1; month <= months; month += 1) {
    const rampFactor = params.rampUpMonths > 0 && month <= params.rampUpMonths ? 0.5 : 1;
    const grossBenefit = grossRunRateMonth * rampFactor;
    const investmentCost = programCostMonth + (month === 1 ? params.oneTimeCost : 0);
    const netCashFlow = grossBenefit - investmentCost;
    cumulativeCashFlow += netCashFlow;

    monthlyCashFlows.push({
      month,
      grossBenefit,
      investmentCost,
      netCashFlow,
      cumulativeCashFlow,
      discountedNetCashFlow: netCashFlow / Math.pow(1 + monthlyDiscountRate, month),
    });
  }

  return monthlyCashFlows;
}

function summarizeYears(monthlyCashFlows: RoiMonthCashFlow[]): RoiYearCashFlow[] {
  const yearlyCashFlows: RoiYearCashFlow[] = [];

  for (let i = 0; i < monthlyCashFlows.length; i += 12) {
    const months = monthlyCashFlows.slice(i, i + 12);
    const last = months[months.length - 1];

    yearlyCashFlows.push({
      year: Math.floor(i / 12) + 1,
      grossBenefit: months.reduce((sum, month) => sum + month.grossBenefit, 0),
      investmentCost: months.reduce((sum, month) => sum + month.investmentCost, 0),
      netCashFlow: months.reduce((sum, month) => sum + month.netCashFlow, 0),
      cumulativeCashFlow: last?.cumulativeCashFlow ?? 0,
      discountedNetCashFlow: months.reduce((sum, month) => sum + month.discountedNetCashFlow, 0),
    });
  }

  return yearlyCashFlows;
}

function paybackMonths(monthlyCashFlows: RoiMonthCashFlow[]) {
  for (const month of monthlyCashFlows) {
    if (month.cumulativeCashFlow >= 0) {
      const previousCumulative = month.cumulativeCashFlow - month.netCashFlow;
      if (month.netCashFlow <= 0) return month.month;
      const fraction = Math.max(0, Math.min(1, -previousCumulative / month.netCashFlow));
      return month.month - 1 + fraction;
    }
  }

  return undefined;
}

function benefitCostRatio(monthlyCashFlows: RoiMonthCashFlow[]) {
  const benefit = monthlyCashFlows.reduce((sum, month) => sum + month.grossBenefit, 0);
  const cost = monthlyCashFlows.reduce((sum, month) => sum + month.investmentCost, 0);
  return cost > 0 ? benefit / cost : undefined;
}

function scenarioResult(
  scenario: RoiScenarioInput,
  params: {
    annualGrossValue: number;
    annualProgramCost: number;
    oneTimeCost: number;
    analysisYears: number;
    rampUpMonths: number;
    discountRate: number;
  },
): RoiScenarioResult {
  assertFiniteNonNegative(scenario.benefitMultiplier, `scenarios.${scenario.id}.benefitMultiplier`);
  assertFiniteNonNegative(scenario.costMultiplier, `scenarios.${scenario.id}.costMultiplier`);

  const annualGrossValue = params.annualGrossValue * scenario.benefitMultiplier;
  const annualProgramCost = params.annualProgramCost * scenario.costMultiplier;
  const oneTimeCost = params.oneTimeCost * scenario.costMultiplier;
  const monthlyCashFlows = buildMonthlyCashFlows({
    annualGrossValue,
    annualProgramCost,
    oneTimeCost,
    analysisYears: params.analysisYears,
    rampUpMonths: params.rampUpMonths,
    discountRate: params.discountRate,
  });
  const firstYear = summarizeYears(monthlyCashFlows)[0];
  const totalInvestment = monthlyCashFlows.reduce((sum, month) => sum + month.investmentCost, 0);

  return {
    id: scenario.id,
    label: scenario.label,
    description: scenario.description,
    annualGrossValue,
    annualNetValue: annualGrossValue - annualProgramCost,
    yearOneRoiPercent:
      firstYear && firstYear.investmentCost > 0
        ? ((firstYear.grossBenefit - firstYear.investmentCost) / firstYear.investmentCost) * 100
        : undefined,
    paybackMonths: paybackMonths(monthlyCashFlows),
    npv: monthlyCashFlows.reduce((sum, month) => sum + month.discountedNetCashFlow, 0),
    benefitCostRatio: totalInvestment > 0 ? benefitCostRatio(monthlyCashFlows) : undefined,
  };
}

export function calculateRoiCase(inputs: RoiCaseInputs): RoiCaseResult {
  assertFiniteNonNegative(inputs.blendedHourlyRate, "blendedHourlyRate");

  const analysisYears = positiveIntOrDefault(inputs.analysisYears, 3, "analysisYears");
  const rampUpMonths = Math.round(optionalNonNegative(inputs.rampUpMonths, 6, "rampUpMonths"));
  const discountRate = optionalNonNegative(inputs.discountRate, 0.08, "discountRate");
  assertRate(discountRate, "discountRate");

  const roles = inputs.roles.map((role) => roleToResult(role, inputs.blendedHourlyRate));
  const annualGrossValue = roles.reduce((sum, role) => sum + role.annualValue, 0);
  const annualHoursSaved = roles.reduce((sum, role) => sum + role.annualHoursSaved, 0);
  const annualProgramCost = annualInvestmentCost(inputs.investment, inputs.blendedHourlyRate);
  const oneTimeCost = oneTimeInvestmentCost(inputs.investment);

  const monthlyCashFlows = buildMonthlyCashFlows({
    annualGrossValue,
    annualProgramCost,
    oneTimeCost,
    analysisYears,
    rampUpMonths,
    discountRate,
  });
  const yearlyCashFlows = summarizeYears(monthlyCashFlows);
  const yearOne = yearlyCashFlows[0];
  const scenarios = (inputs.scenarios ?? DEFAULT_SCENARIOS).map((scenario) =>
    scenarioResult(scenario, {
      annualGrossValue,
      annualProgramCost,
      oneTimeCost,
      analysisYears,
      rampUpMonths,
      discountRate,
    }),
  );
  const totalInvestmentCost = monthlyCashFlows.reduce((sum, month) => sum + month.investmentCost, 0);

  return {
    roles,
    monthlyCashFlows,
    yearlyCashFlows,
    scenarios,
    summary: {
      annualHoursSaved,
      annualGrossValue,
      annualProgramCost,
      annualNetValue: annualGrossValue - annualProgramCost,
      yearOneGrossBenefit: yearOne?.grossBenefit ?? 0,
      yearOneInvestmentCost: yearOne?.investmentCost ?? 0,
      yearOneNetValue: yearOne?.netCashFlow ?? 0,
      yearOneRoiPercent:
        yearOne && yearOne.investmentCost > 0
          ? ((yearOne.grossBenefit - yearOne.investmentCost) / yearOne.investmentCost) * 100
          : undefined,
      paybackMonths: paybackMonths(monthlyCashFlows),
      npv: monthlyCashFlows.reduce((sum, month) => sum + month.discountedNetCashFlow, 0),
      benefitCostRatio: totalInvestmentCost > 0 ? benefitCostRatio(monthlyCashFlows) : undefined,
      analysisYears,
      rampUpMonths,
      discountRate,
    },
  };
}

export function calculateRoi(inputs: RoiInputs): RoiResult {
  assertFiniteNonNegative(inputs.designersFte, "designersFte");
  assertFiniteNonNegative(inputs.developersFte, "developersFte");
  assertFiniteNonNegative(inputs.qaOtherFte ?? 0, "qaOtherFte");
  assertFiniteNonNegative(inputs.blendedHourlyRate, "blendedHourlyRate");

  const multipliersUsed = inputs.multipliers ?? DEFAULT_MULTIPLIERS;
  assertRate(multipliersUsed.designEfficiencyGain, "multipliers.designEfficiencyGain");
  assertRate(multipliersUsed.developmentEfficiencyGain, "multipliers.developmentEfficiencyGain");

  const weeklyHoursSavedDesign = inputs.designersFte * 40 * multipliersUsed.designEfficiencyGain;
  const weeklyHoursSavedDev = inputs.developersFte * 40 * multipliersUsed.developmentEfficiencyGain;
  const weeklyHoursSavedTotal = weeklyHoursSavedDesign + weeklyHoursSavedDev;

  const annualHoursSaved = weeklyHoursSavedTotal * 52;
  const annualValue = annualHoursSaved * inputs.blendedHourlyRate;

  const totalFte = inputs.designersFte + inputs.developersFte + (inputs.qaOtherFte ?? 0);
  const valuePerFtePerYear = totalFte > 0 ? annualValue / totalFte : 0;

  let roiPercent: number | undefined;
  let paybackMonthsResult: number | undefined;

  const oneTime = inputs.oneTimeInvestmentCost;
  const annual = inputs.annualInvestmentCost;

  if (oneTime != null) assertFiniteNonNegative(oneTime, "oneTimeInvestmentCost");
  if (annual != null) assertFiniteNonNegative(annual, "annualInvestmentCost");

  if ((oneTime != null && oneTime > 0) || (annual != null && annual > 0)) {
    const annualizedCost = (annual ?? 0) + (oneTime ?? 0);
    roiPercent = annualizedCost > 0 ? ((annualValue - annualizedCost) / annualizedCost) * 100 : undefined;

    const monthlyBenefit = annualValue / 12;
    const monthlyCost = (annual ?? 0) / 12;
    const upfront = oneTime ?? 0;
    const netMonthly = monthlyBenefit - monthlyCost;
    paybackMonthsResult = netMonthly > 0 ? upfront / netMonthly : undefined;
  }

  return {
    multipliersUsed,
    weeklyHoursSavedDesign,
    weeklyHoursSavedDev,
    weeklyHoursSavedTotal,
    annualHoursSaved,
    annualValue,
    valuePerFtePerYear,
    roiPercent,
    paybackMonths: paybackMonthsResult,
  };
}
