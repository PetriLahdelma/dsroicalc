# Enterprise SaaS Example Case

This example gives evaluators a concrete starting point for judging the model.
It is intentionally conservative: it treats adoption as partial, includes
dedicated team cost, and uses a three-year analysis window.

## Inputs

| Input | Value | Rationale |
| --- | ---: | --- |
| Designers | 5 FTE | Product design capacity affected by reusable patterns. |
| Developers | 10 FTE | Engineers regularly building product UI. |
| QA | 2 FTE | UI regression and acceptance testing capacity. |
| Product | 3 FTE | Product managers and leads involved in repeated UI decisions. |
| Blended hourly rate | $150 | Loaded cost including overhead. |
| Design gain | 38% | Default published benchmark. |
| Development gain | 31% | Default published benchmark. |
| QA gain | 12% | Conservative estimate for fewer repeated UI checks. |
| Product gain | 10% | Conservative estimate for less alignment churn. |
| Adoption | 75% | Not all product work uses the system yet. |
| Ramp-up | 6 months | Benefits are phased in during rollout. |
| Analysis window | 3 years | Common planning horizon for platform investment. |
| Discount rate | 8% | Practical baseline when finance has not supplied a rate. |
| One-time launch cost | $80,000 | Discovery, migration, audits, and enablement. |
| Annual program cost | $140,000 | Tooling, research, vendor support, training, audits. |
| Dedicated DS team | 1.5 FTE | Maintainers allocated to system delivery and support. |
| Maintenance | 24 hours/month | Distributed support and dependency upkeep. |

## Expected Output

The default app state should produce a positive expected case with:

- annual saved hours across design, development, QA, and product roles
- annual gross value before investment costs
- year-one net value after launch and program costs
- payback timing
- three-year NPV
- conservative and aggressive scenario checks

## How To Use It

Use this example in launch posts, README screenshots, and stakeholder demos. It
shows that the calculator is not just a toy percentage multiplier: it makes the
investment side visible and lets reviewers challenge the assumptions.
