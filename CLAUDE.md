# vinui

A shadcn-style component library with one API across React, Vue and React Native, distributed through its own shadcn-compatible registry.

## Read first
- **[docs/CONVENTIONS.md](docs/CONVENTIONS.md)**: the rules (API, styling, registry, dependencies, testing, docs, commits). Follow them.
- **[docs/decisions/](docs/decisions/README.md)**: the why: ADRs, the running decision log, cross-framework differences, tooling quirks.
- **Record every new decision, trade-off or cross-framework difference in `docs/decisions/` in the same change.**
  - Big decisions get a new ADR (with status and date).
  - Smaller ones get a row in the running log.

## Layout
```
packages/
  tailwind/   tokens + @utility component classes (single styling source)
  react/      Radix components (registry source)
  vue/        Reka UI components (registry source)
  native/     React Native components on rn-primitives + Uniwind (registry source; Jest specs)
  core/       repo-only: variant/size unions + prop metadata for parity tests and docs
  registry/   builds /r/{react,vue,native}/*.json into apps/docs/public/r
              (engines/uniwind.ts = the Uniwind engine layer)
spikes/native-engine/   native engine harness (outside the workspace): `pnpm spike:native-engine`
apps/
  docs/       Astro docs site (React + Vue islands); serves the registry
  playground-react/, playground-vue/   install from the local registry like a user
tests/        parity tests (Vitest) + browser specs (Playwright)
```

## Commands
- `pnpm registry:build` builds the registry. `VINUI_REGISTRY_URL` sets its public URL.
- `pnpm dev:docs` runs the docs and serves the registry at `http://localhost:4321/r`.
- `pnpm test` runs, in order:
  1. the type + class parity tests,
  2. the native Jest specs,
  3. the browser specs (docs, web playgrounds, and the native playground's web build).
  - Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to reuse an installed Chromium, or run `pnpm --filter @vinui/tests exec playwright install chromium` once.
- `pnpm -r typecheck` typechecks every package.
- In a playground, `pnpm --filter playground-<react|vue> registry:add` reinstalls from the local registry (the docs dev server must be running).

## Working agreements
- Don't commit or push. Suggest a Conventional Commits message (see CONVENTIONS) and let the maintainer commit.
- Work in reviewable steps and stop after each one.
- Verify behaviour, don't assume it: fresh-app installs, dev **and** production builds, and fault injection for new tests.
