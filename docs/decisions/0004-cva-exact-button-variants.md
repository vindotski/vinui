# 0004: cva-exact `buttonVariants`, `cn` from "cn", explicit `clsx`

- **Status:** Accepted
- **Date:** 2026-10-28

## Context
- shadcn's `buttonVariants` is a cva function.
- Current shadcn components import `cn` from the `cn` package.
- A vinui-owned `lib/utils.ts` caused an overwrite prompt in every shadcn project.

## Decision
- `buttonVariants()` mirrors cva exactly:
  - `class` **or** `className` (mutually exclusive), any clsx `ClassValue`,
  - **appended** with real `clsx`, with no tailwind-merge inside.
  - `cn()` merging happens in the components.
- Components `import { cn } from "cn"` and never ship a `lib/utils.ts`. `init` installs shadcn's standard `utils` for user code.
- Items that import `clsx` list it explicitly. `cn` bundles its own clsx, and stock projects have no direct `clsx`.

## Consequences
- vinui's output matches shadcn's byte for byte at the `buttonVariants` level.
- `add` never hits a `utils.ts` overwrite prompt.
- A fault-injection test proved the explicit `clsx` dependency is required: without it, the build fails.
