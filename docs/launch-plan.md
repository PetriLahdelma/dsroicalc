# Launch Plan

The goal is not to manufacture attention. The goal is to make the repository
easy to trust, easy to try, and easy to recommend.

## Positioning

DS ROI Calc is for design system leads, design ops teams, consultants, and
engineering managers who need to justify system work with a transparent business
case. The strongest message is:

> Turn design system work into a defensible ROI memo in minutes.

## Public Launch Checklist

- Keep the hosted demo green at `https://petrilahdelma.github.io/dsroicalc/`.
- Add repository topics: `design-system`, `roi-calculator`, `design-ops`,
  `tauri`, `react`, `vite`, `typescript`, `github-pages`.
- Set `docs/assets/social-preview.svg` as the repository social preview.
- Pin a short README demo path: open the app, review assumptions, export memo.
- Create a first release after CI, CodeQL, Scorecard, and Pages are green.
- Open focused roadmap issues with `good first issue` and `help wanted` labels.
- Share one concrete example case, not a generic announcement.

## Launch Copy

Short version:

```text
I released DS ROI Calc: a small open-source calculator for turning design system work into a stakeholder-ready ROI memo.

It models saved hours, ramp-up, program cost, payback, NPV, and conservative/expected/aggressive scenarios.

Repo: https://github.com/PetriLahdelma/dsroicalc
Demo: https://petrilahdelma.github.io/dsroicalc/
```

Longer version:

```text
Design systems are often defended with vague productivity claims. DS ROI Calc is a modest open-source tool for making those claims inspectable.

It separates assumptions from outputs, models both benefit and investment cost, and exports a Markdown memo that can become a client-facing business case.

The project is built with React, Vite, TypeScript, Tauri, GitHub Actions, CodeQL, OpenSSF Scorecard, Dependabot, and a small publishable ROI core package.

Repo: https://github.com/PetriLahdelma/dsroicalc
Demo: https://petrilahdelma.github.io/dsroicalc/
```

## Momentum Issues

- Import/export saved cases as JSON.
- Add a sensitivity chart for the assumptions that drive ROI most.
- Add PDF export for stakeholder-ready reports.
- Add a benchmark preset library with citations and confidence notes.
- Add shareable URL state for web demos.
- Add Storybook or design token adoption imports.

## Channels

- GitHub: topics, release notes, examples, project board, good first issues.
- LinkedIn: design ops and design system practitioner audience.
- Hacker News: only after the demo is live and README is concise.
- Reddit and Slack communities: share the example case and ask for critique.
- Personal site/portfolio: short case study with screenshots and methodology.

## Guardrails

- Do not buy stars, traffic, or engagement.
- Do not claim financial precision; frame outputs as decision support.
- Keep defaults conservative and editable.
- Invite corrections to methodology through issues and examples.
- Treat every launch post as a request for expert critique, not applause.
