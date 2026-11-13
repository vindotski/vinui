/** A platform vinui ships components for. */
export type Platform = "react" | "vue" | "svelte" | "native"

/**
 * Docs metadata for a prop vinui defines or changes. Props passed straight
 * through to Radix / Reka / rn-primitives aren't listed (the docs link there).
 */
export interface PropDoc {
  /** Prop name as written on React (and the default for other platforms). */
  name: string
  /** Name where a platform's idiom differs (e.g. Vue / Svelte `class`, native `onPress`). */
  names?: Partial<Record<Platform, string>>
  values?: readonly string[]
  /** Type shown when there are no fixed `values` (e.g. `boolean`). */
  type?: string
  default?: string
  description: string
  platforms: readonly Platform[]
  /** Platforms where this is a vinui addition (not in that platform's shadcn reference). */
  addition?: readonly Platform[]
}

export const allPlatforms = ["react", "vue", "svelte", "native"] as const satisfies readonly Platform[]
