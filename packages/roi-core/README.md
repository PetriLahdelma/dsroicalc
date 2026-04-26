# @petrilahdelma/dsroicalc-roi-core

Pure TypeScript ROI model for design system business cases.

## Usage

```ts
import { calculateRoiCase } from "@petrilahdelma/dsroicalc-roi-core";

const result = calculateRoiCase({
  blendedHourlyRate: 150,
  roles: [
    { id: "design", label: "Design", fte: 5, efficiencyGain: 0.38 },
    { id: "dev", label: "Development", fte: 10, efficiencyGain: 0.31 },
  ],
  investment: {
    oneTimeCost: 80000,
    annualProgramCost: 140000,
    designSystemFte: 1.5,
  },
});

console.log(result.summary.npv);
```

`calculateRoi` remains available for the older compact annual-value API.
