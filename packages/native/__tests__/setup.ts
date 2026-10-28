// Uniwind's styles only exist after Metro compiles global.css, so the engine is
// stubbed: behavior specs check props/classes and accessibility, not pixels
// (resolved styles are covered by spikes/native-engine and device checks).
jest.mock("uniwind", () => ({
  withUniwind: (Component: unknown) => Component,
  useResolveClassNames: jest.fn(() => ({})),
  useUniwind: jest.fn(() => ({ theme: "light", hasAdaptiveThemes: true })),
  useCSSVariable: jest.fn((names: string | string[]) => (Array.isArray(names) ? names.map(() => undefined) : undefined)),
  Uniwind: { setTheme: jest.fn() },
}))
jest.mock("expo-system-ui", () => ({ setBackgroundColorAsync: jest.fn(() => Promise.resolve()) }))
// A host stand-in so specs can read the style ThemeRoot passes.
jest.mock("expo-status-bar", () => {
  const React = require("react")
  const { View } = require("react-native")
  return { StatusBar: ({ style }: { style?: string }) => React.createElement(View, { testID: "status-bar", barStyle: style }) }
})
// Minimal Reanimated stub for what vinui uses (Animated.View, createAnimatedComponent,
// FadeIn/FadeOut builders, ReduceMotion). Reanimated's own mock pulls in its web
// runtime (react-native-web), which this native-only package doesn't have.
// Animations are verified on devices, not here.
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native")
  const builder = (): unknown => new Proxy({}, { get: () => () => builder() })
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (component: unknown) => component },
    FadeIn: builder(),
    FadeOut: builder(),
    ReduceMotion: { System: "system", Always: "always", Never: "never" },
  }
})
jest.mock("react-native-screens", () => {
  const React = require("react")
  return { FullWindowOverlay: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children) }
})
