/**
 * Engine layer: Uniwind.
 *
 * Imported by every vinui native component so a broken setup fails loudly
 * instead of rendering unstyled (React Native ignores unknown `className`s):
 * - Uniwind not installed → the bundle fails: "Unable to resolve module 'uniwind'".
 * - Installed but not configured, or vinui's theme not loaded → one dev-only warning.
 * Nothing runs in production builds (`__DEV__` is false there).
 *
 * It also exposes the resolved theme to JavaScript (ThemeRoot, useNavigationTheme), so
 * code that needs color strings reads them from the same CSS as the classes.
 */
import { useCSSVariable, useResolveClassNames, useUniwind } from "uniwind"

const MESSAGE =
  "[vinui] Uniwind isn't configured (or vinui's theme isn't loaded), so vinui components render unstyled. " +
  "Wrap your Metro config with withUniwindConfig(), import global.css in the root component, " +
  "and make sure global.css imports vinui-theme.css. See the vinui React Native installation guide."

/** A class that only resolves when Uniwind compiled global.css *and* vinui's theme is in it. */
const PROBE_CLASS = "bg-background"

let checked = false
let enabled = true

/** Turn the dev-only setup check off (e.g. in a custom test environment). */
export function disableEngineCheck() {
  enabled = false
}

// Read via globalThis: user apps may not have Node's types installed.
function isTestEnvironment() {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  return env?.NODE_ENV === "test" || env?.JEST_WORKER_ID !== undefined
}

/** Warns once per app session if Uniwind can't resolve vinui's theme. Dev-only. */
export function useEngineCheck() {
  if (!__DEV__) return
  // __DEV__ is a build-time constant, so this hook call is unconditional within a build.
  const resolved = useResolveClassNames(PROBE_CLASS)
  if (checked || !enabled || isTestEnvironment()) return
  checked = true
  if (!resolved || Object.keys(resolved).length === 0) console.warn(MESSAGE)
}

export type ColorScheme = "light" | "dark"

/** The resolved vinui theme. Follows `Uniwind.setTheme()` as well as the system setting. */
export function useVinuiColorScheme(): ColorScheme {
  return useUniwind().theme === "dark" ? "dark" : "light"
}

/**
 * Resolved token colors (`["background", "primary"]` → `["#ffffff", "#171717"]`) for APIs
 * that take color strings. Uniwind returns hex (`#rrggbbaa` with alpha) and re-renders on
 * theme changes; `undefined` means the token didn't resolve.
 */
export function useThemeColors<const T extends readonly string[]>(tokens: T): { [K in keyof T]: string | undefined } {
  const values = useCSSVariable(tokens.map((token) => `--color-${token}`))
  return values.map((value) => (typeof value === "string" ? value : undefined)) as { [K in keyof T]: string | undefined }
}
