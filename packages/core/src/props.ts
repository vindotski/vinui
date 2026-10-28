/** A platform vinui ships components for. */
export type Platform = "react" | "vue" | "native"

/**
 * Docs metadata for a prop vinui defines or changes. Props passed straight
 * through to Radix / Reka / rn-primitives aren't listed (the docs link there).
 */
export interface PropDoc {
  /** Prop name as written on React (and the default for other platforms). */
  name: string
  /** Name where a platform's idiom differs (e.g. Vue `class`, native `onPress`). */
  names?: Partial<Record<Platform, string>>
  values?: readonly string[]
  default?: string
  description: string
  platforms: readonly Platform[]
  /** vinui-only: not in the platform's shadcn reference. */
  addition?: boolean
}

export const allPlatforms = ["react", "vue", "native"] as const satisfies readonly Platform[]
