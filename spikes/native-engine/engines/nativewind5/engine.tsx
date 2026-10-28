// Engine layer: NativeWind 5 (harness adapter, for comparisons only).
import { styled } from "nativewind"
import { Appearance } from "react-native"

import { ProbeImpl } from "./App"

export const ENGINE = "nativewind5"
export const Probe = styled(ProbeImpl, { className: "style" })
export const setTheme = (t: "light" | "dark" | "system") =>
  Appearance.setColorScheme(t === "system" ? "unspecified" : t)
