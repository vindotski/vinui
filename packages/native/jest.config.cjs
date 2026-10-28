// Packages that ship untranspiled JSX/ESM and must go through Babel. With pnpm a
// path contains node_modules twice (.pnpm/<pkg>/node_modules/<name>), so both
// segments must be allowlisted.
const transpile = [
  "\\.pnpm",
  "react-native",
  "@react-native",
  "@react-native-community",
  "expo",
  "@expo",
  "react-native-reanimated",
  "react-native-worklets",
  "react-native-screens",
  "react-native-svg",
  "@rn-primitives",
  "lucide-react-native",
  "uniwind",
]

/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  // Worklets (used by Reanimated) skips its .native files under Jest via this resolver.
  resolver: require.resolve("react-native-worklets/jest/resolver.js"),
  setupFiles: ["<rootDir>/__tests__/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // lucide-react-native resolves to its .mjs build under Jest; use the CommonJS one.
    "^lucide-react-native$": "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.tsx"],
  transformIgnorePatterns: [`/node_modules/(?!(${transpile.join("|")}))`],
}
