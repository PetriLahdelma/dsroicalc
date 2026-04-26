import { useMemo, useState } from "react";
import {
  calculateRoiCase,
  DEFAULT_ROLE_BENCHMARKS,
  type RoiCaseResult,
  type RoiRoleResult,
} from "@petrilahdelma/dsroicalc-roi-core";
import "./App.css";

type Currency = "USD" | "EUR" | "GBP";

type CalculatorForm = {
  designersFte: string;
  developersFte: string;
  qaFte: string;
  productFte: string;
  blendedHourlyRate: string;
  designGainPct: string;
  devGainPct: string;
  qaGainPct: string;
  productGainPct: string;
  adoptionPct: string;
  rampUpMonths: string;
  analysisYears: string;
  discountRatePct: string;
  oneTimeCost: string;
  annualProgramCost: string;
  designSystemFte: string;
  maintenanceHoursPerMonth: string;
};

type NumberFieldProps = {
  label: string;
  value: string;
  suffix?: string;
  min?: number;
  max?: number;
  help?: string;
  onChange: (value: string) => void;
};

const DEFAULT_FORM: CalculatorForm = {
  designersFte: "5",
  developersFte: "10",
  qaFte: "2",
  productFte: "3",
  blendedHourlyRate: "150",
  designGainPct: "38",
  devGainPct: "31",
  qaGainPct: "12",
  productGainPct: "10",
  adoptionPct: "75",
  rampUpMonths: "6",
  analysisYears: "3",
  discountRatePct: "8",
  oneTimeCost: "80000",
  annualProgramCost: "140000",
  designSystemFte: "1.5",
  maintenanceHoursPerMonth: "24",
};

const EMPTY_FORM: CalculatorForm = {
  designersFte: "",
  developersFte: "",
  qaFte: "",
  productFte: "",
  blendedHourlyRate: "",
  designGainPct: "",
  devGainPct: "",
  qaGainPct: "",
  productGainPct: "",
  adoptionPct: "",
  rampUpMonths: "",
  analysisYears: "",
  discountRatePct: "",
  oneTimeCost: "",
  annualProgramCost: "",
  designSystemFte: "",
  maintenanceHoursPerMonth: "",
};

const FIELD_LABELS: Record<keyof CalculatorForm, string> = {
  designersFte: "Designers",
  developersFte: "Developers",
  qaFte: "QA",
  productFte: "Product",
  blendedHourlyRate: "Blended hourly rate",
  designGainPct: "Design gain",
  devGainPct: "Development gain",
  qaGainPct: "QA gain",
  productGainPct: "Product gain",
  adoptionPct: "Adoption",
  rampUpMonths: "Ramp-up",
  analysisYears: "Analysis years",
  discountRatePct: "Discount rate",
  oneTimeCost: "One-time cost",
  annualProgramCost: "Annual program cost",
  designSystemFte: "Dedicated DS FTE",
  maintenanceHoursPerMonth: "Maintenance hours",
};

const PERCENT_FIELDS = new Set<keyof CalculatorForm>([
  "designGainPct",
  "devGainPct",
  "qaGainPct",
  "productGainPct",
  "adoptionPct",
  "discountRatePct",
]);

function parseNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (normalized === "") return { value: 0, invalid: false };

  const parsed = Number(normalized);
  return {
    value: Number.isFinite(parsed) ? parsed : 0,
    invalid: !Number.isFinite(parsed) || parsed < 0,
  };
}

function bounded(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function formatMoney(value: number, currency: Currency, compact = false) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(value);
}

function formatPercent(value: number | undefined) {
  if (value == null) return "n/a";
  return `${formatNumber(value, 0)}%`;
}

function formatMonths(value: number | undefined) {
  if (value == null) return "Not reached";
  if (value < 1) return "<1 month";
  return `${formatNumber(value, 1)} months`;
}

function NumberField({
  label,
  value,
  suffix,
  min = 0,
  max,
  help,
  onChange,
}: NumberFieldProps) {
  const parsed = parseNumber(value);
  const outsideRange =
    !parsed.invalid &&
    ((max != null && parsed.value > max) || parsed.value < min);
  const invalid = parsed.invalid || outsideRange;

  return (
    <label className={invalid ? "field isInvalid" : "field"}>
      <span className="fieldTop">
        <span className="fieldLabel">{label}</span>
        {help ? <span className="fieldHelp">{help}</span> : null}
      </span>
      <span className="inputShell">
        <input
          value={value}
          inputMode="decimal"
          onChange={(event) => onChange(event.currentTarget.value)}
          aria-invalid={invalid}
          aria-label={label}
        />
        {suffix ? <span className="inputSuffix">{suffix}</span> : null}
      </span>
    </label>
  );
}

function makeMemo(result: RoiCaseResult, currency: Currency) {
  const expected = result.scenarios.find((scenario) => scenario.id === "expected");
  const lines = [
    "# Design System ROI Case",
    "",
    "## Executive Summary",
    "",
    `- Annual gross efficiency value: ${formatMoney(result.summary.annualGrossValue, currency)}`,
    `- Annual net value after program cost: ${formatMoney(result.summary.annualNetValue, currency)}`,
    `- Year-one ROI: ${formatPercent(result.summary.yearOneRoiPercent)}`,
    `- Payback: ${formatMonths(result.summary.paybackMonths)}`,
    `- ${result.summary.analysisYears}-year NPV: ${formatMoney(result.summary.npv, currency)}`,
    `- Annual hours saved: ${formatNumber(result.summary.annualHoursSaved, 0)} hours`,
    "",
    "## Assumptions",
    "",
    `- Ramp-up: ${result.summary.rampUpMonths} months at half benefit`,
    `- Discount rate: ${formatPercent(result.summary.discountRate * 100)}`,
    `- Annual program cost: ${formatMoney(result.summary.annualProgramCost, currency)}`,
    "",
    "## Role Impact",
    "",
    "| Role | FTE | Gain | Adoption | Annual hours | Annual value |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...result.roles.map(
      (role) =>
        `| ${role.label} | ${formatNumber(role.fte, 1)} | ${formatPercent(role.efficiencyGain * 100)} | ${formatPercent(role.adoptionRate * 100)} | ${formatNumber(role.annualHoursSaved)} | ${formatMoney(role.annualValue, currency)} |`,
    ),
    "",
    "## Scenario Check",
    "",
    "| Scenario | Annual gross value | Year-one ROI | Payback | NPV |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...result.scenarios.map(
      (scenario) =>
        `| ${scenario.label} | ${formatMoney(scenario.annualGrossValue, currency)} | ${formatPercent(scenario.yearOneRoiPercent)} | ${formatMonths(scenario.paybackMonths)} | ${formatMoney(scenario.npv, currency)} |`,
    ),
    "",
    "## Methodology",
    "",
    "Benefits are calculated from FTE capacity, loaded hourly cost, expected efficiency gain, and adoption rate. Ramp-up months are counted at half benefit. NPV discounts monthly net cash flow.",
    "",
    "Benchmark basis: Smashing Magazine's design system ROI article cites averaged productivity gains of 38% for design and 31% for development. QA and product gains are intentionally editable estimates.",
    "Source: https://www.smashingmagazine.com/2022/09/formula-roi-design-system/",
  ];

  if (expected?.benefitCostRatio != null) {
    lines.splice(8, 0, `- Benefit-cost ratio: ${formatNumber(expected.benefitCostRatio, 1)}x`);
  }

  return lines.join("\n");
}

function CashFlowChart({
  result,
  currency,
}: {
  result: RoiCaseResult;
  currency: Currency;
}) {
  const width = 720;
  const height = 260;
  const padding = 34;
  const points = result.monthlyCashFlows;
  const values = points.map((point) => point.cumulativeCashFlow);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = maxValue - minValue || 1;
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const y = (value: number) =>
    padding + ((maxValue - value) / range) * (height - padding * 2);
  const path = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${padding + index * xStep} ${y(point.cumulativeCashFlow)}`;
    })
    .join(" ");
  const zeroY = y(0);

  return (
    <div className="chartBlock">
      <div className="sectionHeader">
        <div>
          <h2>Cumulative cash flow</h2>
          <p>Monthly net value across the analysis window.</p>
        </div>
        <span>{formatMoney(maxValue, currency, true)}</span>
      </div>
      <svg className="cashChart" viewBox={`0 0 ${width} ${height}`} role="img">
        <line
          x1={padding}
          y1={zeroY}
          x2={width - padding}
          y2={zeroY}
          className="axisLine"
        />
        <path d={path} className="cashPath" />
        {points
          .filter((_, index) => index % 6 === 0 || index === points.length - 1)
          .map((point, index) => (
            <circle
              key={`${point.month}-${index}`}
              cx={padding + (point.month - 1) * xStep}
              cy={y(point.cumulativeCashFlow)}
              r="3"
              className="cashDot"
            />
          ))}
      </svg>
      <div className="chartLegend">
        <span>Month 1</span>
        <span>{formatMoney(minValue, currency, true)}</span>
        <span>Month {points.length}</span>
      </div>
    </div>
  );
}

function RoleBars({
  roles,
  currency,
}: {
  roles: RoiRoleResult[];
  currency: Currency;
}) {
  const maxValue = Math.max(...roles.map((role) => role.annualValue), 1);

  return (
    <div className="roleBars">
      {roles.map((role) => (
        <div className="roleRow" key={role.id}>
          <div className="roleText">
            <strong>{role.label}</strong>
            <span>
              {formatNumber(role.annualHoursSaved)}h saved / {formatMoney(role.annualValue, currency)}
            </span>
          </div>
          <div className="roleTrack" aria-hidden="true">
            <span style={{ width: `${(role.annualValue / maxValue) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [form, setForm] = useState<CalculatorForm>(DEFAULT_FORM);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [copied, setCopied] = useState(false);

  function updateField(key: keyof CalculatorForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const validationIssues = useMemo(() => {
    return (Object.entries(form) as Array<[keyof CalculatorForm, string]>)
      .filter(([key, value]) => {
        const parsed = parseNumber(value);
        if (parsed.invalid) return true;
        if (PERCENT_FIELDS.has(key) && parsed.value > 100) return true;
        if (key === "analysisYears" && value.trim() !== "" && parsed.value < 1) return true;
        return false;
      })
      .map(([key]) => FIELD_LABELS[key]);
  }, [form]);

  const result = useMemo(() => {
    const n = (key: keyof CalculatorForm, max = Number.POSITIVE_INFINITY) =>
      bounded(parseNumber(form[key]).value, 0, max);
    const pct = (key: keyof CalculatorForm) => n(key, 100) / 100;
    const adoptionRate = pct("adoptionPct");

    return calculateRoiCase({
      blendedHourlyRate: n("blendedHourlyRate"),
      rampUpMonths: n("rampUpMonths"),
      analysisYears: Math.max(1, Math.round(n("analysisYears") || 1)),
      discountRate: pct("discountRatePct"),
      roles: [
        {
          id: "design",
          label: DEFAULT_ROLE_BENCHMARKS.design.label,
          fte: n("designersFte"),
          efficiencyGain: pct("designGainPct"),
          adoptionRate,
        },
        {
          id: "development",
          label: DEFAULT_ROLE_BENCHMARKS.development.label,
          fte: n("developersFte"),
          efficiencyGain: pct("devGainPct"),
          adoptionRate,
        },
        {
          id: "qa",
          label: DEFAULT_ROLE_BENCHMARKS.qa.label,
          fte: n("qaFte"),
          efficiencyGain: pct("qaGainPct"),
          adoptionRate,
        },
        {
          id: "product",
          label: DEFAULT_ROLE_BENCHMARKS.product.label,
          fte: n("productFte"),
          efficiencyGain: pct("productGainPct"),
          adoptionRate,
        },
      ],
      investment: {
        oneTimeCost: n("oneTimeCost"),
        annualProgramCost: n("annualProgramCost"),
        designSystemFte: n("designSystemFte"),
        designSystemHourlyRate: n("blendedHourlyRate"),
        maintenanceHoursPerMonth: n("maintenanceHoursPerMonth"),
        maintenanceHourlyRate: n("blendedHourlyRate"),
      },
    });
  }, [form]);

  const memo = useMemo(() => makeMemo(result, currency), [currency, result]);

  async function copyMemo() {
    await navigator.clipboard.writeText(memo);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadMemo() {
    const blob = new Blob([memo], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "design-system-roi-case.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  const expected = result.scenarios.find((scenario) => scenario.id === "expected");

  return (
    <div className="appShell">
      <header className="topbar">
        <div>
          <p className="eyebrow">DS ROI Calc</p>
          <h1>Design system business case</h1>
        </div>
        <div className="topActions">
          <label className="currencySelect">
            <span>Currency</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.currentTarget.value as Currency)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <button type="button" className="secondaryButton" onClick={() => setForm(DEFAULT_FORM)}>
            Example
          </button>
          <button type="button" className="secondaryButton" onClick={() => setForm(EMPTY_FORM)}>
            Reset
          </button>
          <button type="button" className="primaryButton" onClick={copyMemo}>
            {copied ? "Copied" : "Copy memo"}
          </button>
        </div>
      </header>

      {validationIssues.length > 0 ? (
        <div className="validationBar" role="status">
          Check these inputs: {validationIssues.join(", ")}.
        </div>
      ) : null}

      <main className="workspace">
        <section className="inputPanel" aria-label="ROI inputs">
          <div className="panelHeader">
            <h2>Inputs</h2>
            <p>Capacity, assumptions, and investment.</p>
          </div>

          <div className="inputSection">
            <h3>Team</h3>
            <div className="fieldGrid">
              <NumberField
                label="Designers"
                value={form.designersFte}
                suffix="FTE"
                onChange={(value) => updateField("designersFte", value)}
              />
              <NumberField
                label="Developers"
                value={form.developersFte}
                suffix="FTE"
                onChange={(value) => updateField("developersFte", value)}
              />
              <NumberField
                label="QA"
                value={form.qaFte}
                suffix="FTE"
                onChange={(value) => updateField("qaFte", value)}
              />
              <NumberField
                label="Product"
                value={form.productFte}
                suffix="FTE"
                onChange={(value) => updateField("productFte", value)}
              />
              <NumberField
                label="Blended hourly rate"
                value={form.blendedHourlyRate}
                suffix="/hr"
                onChange={(value) => updateField("blendedHourlyRate", value)}
              />
            </div>
          </div>

          <div className="inputSection">
            <h3>Efficiency assumptions</h3>
            <div className="fieldGrid">
              <NumberField
                label="Design gain"
                value={form.designGainPct}
                suffix="%"
                max={100}
                help="benchmark"
                onChange={(value) => updateField("designGainPct", value)}
              />
              <NumberField
                label="Development gain"
                value={form.devGainPct}
                suffix="%"
                max={100}
                help="benchmark"
                onChange={(value) => updateField("devGainPct", value)}
              />
              <NumberField
                label="QA gain"
                value={form.qaGainPct}
                suffix="%"
                max={100}
                help="estimate"
                onChange={(value) => updateField("qaGainPct", value)}
              />
              <NumberField
                label="Product gain"
                value={form.productGainPct}
                suffix="%"
                max={100}
                help="estimate"
                onChange={(value) => updateField("productGainPct", value)}
              />
              <NumberField
                label="Adoption"
                value={form.adoptionPct}
                suffix="%"
                max={100}
                onChange={(value) => updateField("adoptionPct", value)}
              />
              <NumberField
                label="Ramp-up"
                value={form.rampUpMonths}
                suffix="mo"
                onChange={(value) => updateField("rampUpMonths", value)}
              />
            </div>
          </div>

          <div className="inputSection">
            <h3>Investment</h3>
            <div className="fieldGrid">
              <NumberField
                label="One-time launch"
                value={form.oneTimeCost}
                suffix={currency}
                onChange={(value) => updateField("oneTimeCost", value)}
              />
              <NumberField
                label="Annual tools/services"
                value={form.annualProgramCost}
                suffix={currency}
                onChange={(value) => updateField("annualProgramCost", value)}
              />
              <NumberField
                label="Dedicated DS team"
                value={form.designSystemFte}
                suffix="FTE"
                onChange={(value) => updateField("designSystemFte", value)}
              />
              <NumberField
                label="Maintenance"
                value={form.maintenanceHoursPerMonth}
                suffix="h/mo"
                onChange={(value) => updateField("maintenanceHoursPerMonth", value)}
              />
              <NumberField
                label="Analysis window"
                value={form.analysisYears}
                suffix="yr"
                min={1}
                onChange={(value) => updateField("analysisYears", value)}
              />
              <NumberField
                label="Discount rate"
                value={form.discountRatePct}
                suffix="%"
                max={100}
                onChange={(value) => updateField("discountRatePct", value)}
              />
            </div>
          </div>
        </section>

        <section className="resultsPanel" aria-label="ROI results">
          <div className="resultHero">
            <div>
              <p className="eyebrow">Net present value</p>
              <div className="heroValue">{formatMoney(result.summary.npv, currency)}</div>
              <p>
                {formatNumber(result.summary.annualHoursSaved)} hours saved per year at
                run-rate.
              </p>
            </div>
            <button type="button" className="secondaryButton" onClick={downloadMemo}>
              Export .md
            </button>
          </div>

          <div className="metricGrid">
            <div className="metricTile">
              <span>Annual gross value</span>
              <strong>{formatMoney(result.summary.annualGrossValue, currency)}</strong>
            </div>
            <div className="metricTile">
              <span>Annual net value</span>
              <strong>{formatMoney(result.summary.annualNetValue, currency)}</strong>
            </div>
            <div className="metricTile">
              <span>Year-one ROI</span>
              <strong>{formatPercent(result.summary.yearOneRoiPercent)}</strong>
            </div>
            <div className="metricTile">
              <span>Payback</span>
              <strong>{formatMonths(result.summary.paybackMonths)}</strong>
            </div>
            <div className="metricTile">
              <span>Annual program cost</span>
              <strong>{formatMoney(result.summary.annualProgramCost, currency)}</strong>
            </div>
            <div className="metricTile">
              <span>Benefit-cost ratio</span>
              <strong>
                {expected?.benefitCostRatio == null
                  ? "n/a"
                  : `${formatNumber(expected.benefitCostRatio, 1)}x`}
              </strong>
            </div>
          </div>

          <CashFlowChart result={result} currency={currency} />

          <div className="splitGrid">
            <div className="sectionBlock">
              <div className="sectionHeader">
                <div>
                  <h2>Scenario check</h2>
                  <p>Sensitivity to benefit and cost assumptions.</p>
                </div>
              </div>
              <div className="scenarioGrid">
                {result.scenarios.map((scenario) => (
                  <div className="scenarioTile" key={scenario.id}>
                    <div>
                      <span>{scenario.label}</span>
                      <strong>{formatMoney(scenario.npv, currency)}</strong>
                    </div>
                    <p>
                      {formatPercent(scenario.yearOneRoiPercent)} ROI /{" "}
                      {formatMonths(scenario.paybackMonths)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sectionBlock">
              <div className="sectionHeader">
                <div>
                  <h2>Role impact</h2>
                  <p>Annual value by contributor group.</p>
                </div>
              </div>
              <RoleBars roles={result.roles} currency={currency} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
