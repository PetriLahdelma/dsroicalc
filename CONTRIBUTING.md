# Contributing

Thanks for considering a contribution.

## Development

```bash
npm install
npm run dev:ui
```

Run checks before opening a pull request:

```bash
npm run test
npm run typecheck
npm run build
npm run audit
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings
```

## Pull Requests

- Keep changes focused and reviewable.
- Add or update tests when calculation behavior changes.
- Do not add dependencies unless the benefit is clear and documented.
- Document methodology changes in `docs/methodology.md`.
- Keep UI changes modest, accessible, and workflow-oriented.

## Decision Records

Commit messages should explain why the change exists. Prefer structured trailers
when they add useful context:

```text
Confidence: high
Scope-risk: narrow
Tested: npm run test
Not-tested: Tauri packaged installer
```
