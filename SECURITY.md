# Security Policy

## Supported Versions

DS ROI Calc is pre-release. Security fixes target the current `main` branch.

## Reporting a Vulnerability

Please report vulnerabilities privately by opening a GitHub private vulnerability
report once the repository is public, or by contacting the maintainer directly.

Do not disclose security issues publicly until a fix is available.

## Scope

Relevant security concerns include:

- Incorrect ROI calculations that could materially mislead users.
- Cross-site scripting or unsafe content handling in the UI.
- Tauri permission or CSP regressions.
- Dependency vulnerabilities in the shipped application or core package.
- Supply-chain issues in release automation.
