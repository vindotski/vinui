// Engine layer: Uniwind (harness adapter).
import { Uniwind, withUniwind } from "uniwind"

import { ProbeImpl } from "./App"

export const ENGINE = "uniwind"
export const Probe = withUniwind(ProbeImpl)
export const setTheme = (t: "light" | "dark" | "system") => Uniwind.setTheme(t)
