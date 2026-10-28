/// <reference path="../packages/native/env.d.ts" />
// tsconfig `paths` maps @/* to packages/native: of the component files the type tests
// import, only native ones use the @/ alias (React/Vue button files don't).
// Vue components are compiled by Vite in runtime tests. For plain `tsc` (type
// tests), a .vue import only needs to exist: the unions under test live in .ts.
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent
  export default component
}
