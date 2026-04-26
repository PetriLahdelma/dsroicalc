# Methodology

DS ROI Calc estimates the financial case for design system work from capacity,
efficiency, adoption, ramp-up, and investment assumptions.

## Core Model

For each role:

```text
annual hours saved =
  FTE * weekly hours per FTE * 52 * efficiency gain * adoption rate

annual value =
  annual hours saved * loaded hourly rate
```

The run-rate annual gross value is the sum of all role values.

## Investment Model

Annual program cost includes:

- Direct annual tools, services, agency, training, or research cost.
- Dedicated design system staffing cost.
- Monthly maintenance hours.

One-time launch cost is charged in month one.

## Ramp-Up

Ramp-up months are modeled at half benefit. After ramp-up, the full run-rate
benefit is applied.

This keeps the model conservative while still showing early value.

## Multi-Year Value

Monthly net cash flow is:

```text
gross monthly benefit - monthly program cost - one-time launch cost if month 1
```

NPV discounts monthly net cash flow by the supplied annual discount rate.

## Scenario Check

The default scenarios are:

| Scenario | Benefit multiplier | Cost multiplier |
| --- | ---: | ---: |
| Conservative | 0.70x | 1.15x |
| Expected | 1.00x | 1.00x |
| Aggressive | 1.25x | 0.95x |

These are not predictions. They are stress tests for the business case.

## Benchmark Basis

The design and development defaults follow the productivity-gain averages cited
in Smashing Magazine's design system ROI article:

- Design: 38%
- Development: 31%

Source:
https://www.smashingmagazine.com/2022/09/formula-roi-design-system/

QA and product defaults are editable estimates. They should be replaced with
organization-specific evidence whenever possible.

## Known Limits

- The model estimates efficiency value, not all value. It does not yet quantify
  brand consistency, accessibility risk reduction, usability quality, or reduced
  design/development rework from fewer defects.
- Adoption is represented as a single rate across roles in the UI. The core can
  support role-level adoption when the UI exposes it.
- Benchmarks are useful for framing, but real client cases should be calibrated
  with delivery data, contribution data, and component adoption data.
