// Node stub for react-native: parity tests only exercise class logic
// (buttonVariants), never rendering. Native rendering is covered by Jest specs.
const host = (name: string) => Object.assign(() => null, { displayName: name })
export const Pressable = host("Pressable")
export const Text = host("Text")
export const View = host("View")
