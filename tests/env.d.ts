// tsconfig `paths` maps @/* to packages/react: the React dialog imports its Button
// through the @/ alias, as it will in a user's app.
// Vue components are compiled by Vite in runtime tests. For plain `tsc` (type
// tests), a .vue import only needs to exist: the unions under test live in .ts.
// Same for Svelte: the unions under test live in each component's index.ts.
declare module "*.svelte" {
  import type { Component } from "svelte"
  const component: Component<Record<string, unknown>>
  export default component
}
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent
  export default component
}
