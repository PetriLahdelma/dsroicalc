# DS ROI Calc

Design system ROI calculator for turning design system work into a defensible
business case.

The app helps teams estimate saved hours, annual value, payback, year-one ROI,
and multi-year net present value from design system adoption. It is intentionally
modest: the value is in clean assumptions, reliable math, and report-ready
outputs rather than visual noise.

## Status

Pre-release. The core calculation package and desktop/web UI are usable, but the
methodology and example cases should continue to be reviewed with real client
data before a 1.0 release.

## What It Does

- Calculates role-level annual hours saved and value.
- Models ramp-up, recurring program cost, dedicated design system staffing,
  maintenance effort, and one-time launch cost.
- Produces conservative, expected, and aggressive scenario checks.
- Computes year-one ROI, payback, benefit-cost ratio, and NPV.
- Exports a Markdown memo that can be used as a client-facing starting point.
- Ships a publishable TypeScript calculation engine in `packages/roi-core`.
- Wraps the UI as a Tauri desktop app while keeping the Vite UI deployable as a
  static web app.

## Quick Start

```bash
npm install
npm run dev:ui
```

Open `http://127.0.0.1:1420`.

For the Tauri desktop shell:

```bash
npm run dev
```

## Verification

```bash
npm run test
npm run typecheck
npm run build
npm run audit
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings
```

## Repository Layout

```text
apps/desktop          React + Vite UI and Tauri v2 shell
packages/roi-core     TypeScript ROI calculation engine
docs/                 Methodology and product notes
.github/              CI, dependency updates, templates, security scanning
```

## Methodology

The default design and development gains are based on the averages cited in
Smashing Magazine's design system ROI article: 38% for design and 31% for
development. QA and product gains are intentionally editable estimates because
the evidence is less standardized and varies by organization.

Read the full methodology in [docs/methodology.md](docs/methodology.md).

## Architecture

The project is split so the calculation model can outlive the first UI:

- `@petrilahdelma/dsroicalc-roi-core`: pure TypeScript calculations, tests, and
  publishable exports.
- `apps/desktop`: React app that consumes source directly during development and
  can be bundled for desktop through Tauri.
- Tauri has a restrictive CSP and no template command/plugin surface enabled.

## GitHub Launch Checklist

- Add a social preview image in repository settings.
- Add topics: `design-system`, `roi-calculator`, `design-ops`, `tauri`,
  `react`, `vite`, `typescript`.
- Enable Dependabot alerts, secret scanning, push protection, and code scanning
  in GitHub repository settings.
- Protect `main` with required CI checks before accepting outside
  contributions.
- Publish a short launch post with a concrete example case and a link to the
  hosted app.

## License

MIT
