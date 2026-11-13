/** Type-level parity for Select: SelectTrigger's `size` union equals core's, both ways. */
import type { SelectTriggerSize } from "@vinui/core"
import type { SelectTrigger as ReactSelectTrigger, SelectTriggerSize as ReactSelectTriggerSize } from "@vinui/react/ui/select"
import type { ComponentProps } from "react"
// Vue unions come from the component's index.ts, never from a .vue file.
import type { SelectTriggerSize as VueSelectTriggerSize } from "@vinui/vue/ui/select"
import type { SelectTriggerSize as SvelteSelectTriggerSize } from "@vinui/svelte/ui/select"
import { describe, expectTypeOf, test } from "vitest"

describe("SelectTrigger size equals core", () => {
  test("React", () => {
    expectTypeOf<ReactSelectTriggerSize>().toEqualTypeOf<SelectTriggerSize>()
    expectTypeOf<NonNullable<ComponentProps<typeof ReactSelectTrigger>["size"]>>().toEqualTypeOf<SelectTriggerSize>()
  })

  test("Vue", () => {
    expectTypeOf<VueSelectTriggerSize>().toEqualTypeOf<SelectTriggerSize>()
  })

  test("Svelte", () => {
    expectTypeOf<SvelteSelectTriggerSize>().toEqualTypeOf<SelectTriggerSize>()
  })
})
