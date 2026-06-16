# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.9** — App Router only. APIs, conventions, and file structure may differ from training data. Read `node_modules/next/dist/docs/` before writing any code.
- **React 19.2.4** — New features (e.g. `use`, Server Actions, `useActionState`) are available.
- **Tailwind CSS v4** — Configured via `@import "tailwindcss"` in CSS (not `tailwind.config.js`). Theme tokens are declared with `@theme inline` in [app/globals.css](app/globals.css). The v3 `tailwind.config.js` pattern does not apply.
- **TypeScript** — Strict mode. Path alias `@/*` maps to the repo root.

## Architecture

This is a standard Next.js App Router project. All routes live under `app/`. The root layout ([app/layout.tsx](app/layout.tsx)) loads Geist fonts as CSS variables and wraps every page in a flex column body.

CSS custom properties for background/foreground colors are defined in [app/globals.css](app/globals.css) and wired into Tailwind via `@theme inline`.
