// ThemeRoot: the native base layer. Uniwind is mocked (setup.ts), so these specs pin
// the wiring: classes, status bar style, root color, portal host and the opt-outs.
// Resolved colors and live theme switching are checked on devices.
import { Portal, PortalHost } from "@rn-primitives/portal"
import { render, renderHook, screen } from "@testing-library/react-native"
import * as SystemUI from "expo-system-ui"
import { Text } from "react-native"
import { useCSSVariable, useUniwind } from "uniwind"

import { ThemeRoot, useNavigationTheme } from "@/components/ui/theme-root"

const tokens: Record<string, Record<string, string>> = {
  light: {
    "--color-primary": "#171717",
    "--color-background": "#ffffff",
    "--color-foreground": "#0a0a0a",
    "--color-border": "#e5e5e5",
    "--color-destructive": "#e7000b",
  },
  dark: {
    "--color-primary": "#e5e5e5",
    "--color-background": "#0a0a0a",
    "--color-foreground": "#fafafa",
    "--color-border": "#ffffff1a",
    "--color-destructive": "#ff6467",
  },
}

function useTheme(theme: "light" | "dark", { resolved = true } = {}) {
  ;(useUniwind as jest.Mock).mockReturnValue({ theme, hasAdaptiveThemes: false })
  ;(useCSSVariable as jest.Mock).mockImplementation((names: string[]) =>
    names.map((name) => (resolved ? tokens[theme][name] : undefined)),
  )
}

function Portaled() {
  return (
    <Portal name="portaled">
      <Text>Portaled</Text>
    </Portal>
  )
}

describe("ThemeRoot", () => {
  beforeEach(() => jest.clearAllMocks())

  test("wraps children in the theme background", async () => {
    useTheme("light")
    await render(
      <ThemeRoot testID="root" className="pt-4">
        <Text>Child</Text>
      </ThemeRoot>,
    )
    expect(screen.getByTestId("root").props.className).toBe("bg-background flex-1 pt-4")
    expect(screen.getByText("Child")).toBeOnTheScreen()
  })

  test.each([
    ["light", "dark"],
    ["dark", "light"],
  ] as const)("in the %s theme the status bar uses %s content", async (theme, style) => {
    useTheme(theme)
    await render(<ThemeRoot />)
    expect(screen.getByTestId("status-bar").props.barStyle).toBe(style)
  })

  test("sets the native root background to the theme color", async () => {
    useTheme("dark")
    await render(<ThemeRoot />)
    expect(SystemUI.setBackgroundColorAsync).toHaveBeenCalledWith("#0a0a0a")
  })

  test("leaves the native root alone when the token doesn't resolve", async () => {
    useTheme("dark", { resolved: false })
    await render(<ThemeRoot />)
    expect(SystemUI.setBackgroundColorAsync).not.toHaveBeenCalled()
  })

  test("hosts portals", async () => {
    useTheme("light")
    await render(
      <ThemeRoot>
        <Portaled />
      </ThemeRoot>,
    )
    expect(screen.getAllByText("Portaled")).toHaveLength(1)
  })

  // Why the opt-out exists: an app (e.g. an RNR setup) with its own host would show every portal twice.
  test("a second PortalHost duplicates portals; portalHost={false} avoids it", async () => {
    useTheme("light")
    const app = (portalHost?: boolean) => (
      <>
        <ThemeRoot portalHost={portalHost}>
          <Portaled />
        </ThemeRoot>
        <PortalHost />
      </>
    )
    const { rerender } = await render(app())
    expect(screen.getAllByText("Portaled")).toHaveLength(2)
    await rerender(app(false))
    expect(screen.getAllByText("Portaled")).toHaveLength(1)
  })

  test("statusBar={false} leaves the status bar to the app", async () => {
    useTheme("light")
    await render(<ThemeRoot statusBar={false} />)
    expect(screen.queryByTestId("status-bar")).toBeNull()
  })
})

describe("useNavigationTheme", () => {
  test.each(["light", "dark"] as const)("maps vinui tokens in the %s theme", async (theme) => {
    useTheme(theme)
    const { result } = await renderHook(() => useNavigationTheme())
    const t = tokens[theme]
    expect(result.current).toEqual({
      dark: theme === "dark",
      colors: {
        primary: t["--color-primary"],
        background: t["--color-background"],
        card: t["--color-background"],
        text: t["--color-foreground"],
        border: t["--color-border"],
        notification: t["--color-destructive"],
      },
    })
  })

  test("leaves out tokens that don't resolve, so React Navigation's defaults stay", async () => {
    useTheme("light", { resolved: false })
    const { result } = await renderHook(() => useNavigationTheme())
    expect(result.current).toEqual({ dark: false, colors: {} })
  })
})
