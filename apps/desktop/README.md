# Desktop App

React + Vite UI wrapped with Tauri v2.

```bash
npm run dev:ui
npm run dev
npm --workspace apps/desktop run tauri:build
```

The UI is intentionally deployable as a static web app. Tauri is the desktop
distribution shell, not the source of business logic.
