import * as React from "react"
import { PortalHost } from "@rn-primitives/portal"
import { cn } from "cn"
import { StatusBar } from "expo-status-bar"
import * as SystemUI from "expo-system-ui"
import { View, type ViewProps } from "react-native"

import { useEngineCheck, useThemeColors, useVinuiColorScheme } from "@/lib/vinui-engine"

type ThemeRootProps = ViewProps & {
  className?: string
  /**
   * Render vinui's `<PortalHost />` (needed by Dialog and other overlays).
   * Pass `false` if your app already renders one: two hosts with the same name show every portal twice.
   */
  portalHost?: boolean
  /** Render a `<StatusBar />` that follows the vinui theme. Pass `false` if your app manages its own. */
  statusBar?: boolean
}

/**
 * The native base layer (web's `body { bg-background }`): wrap your app in it once.
 * Paints the theme background, keeps the status bar and the native root view in sync
 * with the theme (including a manual `Uniwind.setTheme()`), and hosts portals.
 */
function ThemeRoot({ className, children, portalHost = true, statusBar = true, ...props }: ThemeRootProps) {
  useEngineCheck()
  const scheme = useVinuiColorScheme()
  const [background] = useThemeColors(["background"])

  // The native root view shows behind screen transitions, rotations and the keyboard.
  React.useEffect(() => {
    if (background) void SystemUI.setBackgroundColorAsync(background)
  }, [background])

  return (
    <View className={cn("bg-background flex-1", className)} {...props}>
      {children}
      {statusBar && <StatusBar style={scheme === "dark" ? "light" : "dark"} />}
      {portalHost && <PortalHost />}
    </View>
  )
}

type NavigationColors = {
  primary: string
  background: string
  card: string
  text: string
  border: string
  notification: string
}

/**
 * React Navigation colors built from vinui's tokens, so navigation follows the same theme.
 * Spread over React Navigation's own theme (tokens that don't resolve are left out):
 * `{ ...(dark ? DarkTheme : DefaultTheme), dark, colors: { ...base.colors, ...colors } }`.
 */
function useNavigationTheme(): { dark: boolean; colors: Partial<NavigationColors> } {
  const scheme = useVinuiColorScheme()
  const [primary, background, text, border, notification] = useThemeColors([
    "primary",
    "background",
    "foreground",
    "border",
    "destructive",
  ])
  return React.useMemo(() => {
    const colors: Partial<NavigationColors> = {}
    const entries = { primary, background, card: background, text, border, notification }
    for (const [key, value] of Object.entries(entries)) {
      if (value) colors[key as keyof NavigationColors] = value
    }
    return { dark: scheme === "dark", colors }
  }, [scheme, primary, background, text, border, notification])
}

export { ThemeRoot, useNavigationTheme }
export type { ThemeRootProps }
