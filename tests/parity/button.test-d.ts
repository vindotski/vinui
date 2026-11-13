/**
 * Type-level parity: each framework's Button unions must EQUAL core's, in both
 * directions (a subset or superset fails), and buttonVariants must keep cva's
 * "class or className, not both" rule.
 */
import type { ButtonSize, ButtonVariant } from "@vinui/core"
import type * as ReactButton from "@vinui/react/ui/button"
// Vue unions come from the component's index.ts, never from a .vue file.
import type * as VueButton from "@vinui/vue/ui/button"
import type * as NativeButton from "@vinui/native/ui/button"
// Svelte unions also come from index.ts, never from a .svelte file.
import type * as SvelteButton from "@vinui/svelte/ui/button"
import { buttonVariants as reactButtonVariants } from "@vinui/react/ui/button"
import { buttonVariants as vueButtonVariants } from "@vinui/vue/ui/button"
import { buttonVariants as nativeButtonVariants } from "@vinui/native/ui/button"
import { buttonVariants as svelteButtonVariants } from "@vinui/svelte/ui/button"
import { describe, expectTypeOf, test } from "vitest"

describe("Button unions equal core", () => {
  test("variant", () => {
    expectTypeOf<ReactButton.ButtonVariant>().toEqualTypeOf<ButtonVariant>()
    expectTypeOf<VueButton.ButtonVariant>().toEqualTypeOf<ButtonVariant>()
    expectTypeOf<NativeButton.ButtonVariant>().toEqualTypeOf<ButtonVariant>()
    expectTypeOf<SvelteButton.ButtonVariant>().toEqualTypeOf<ButtonVariant>()
  })

  test("size", () => {
    expectTypeOf<ReactButton.ButtonSize>().toEqualTypeOf<ButtonSize>()
    expectTypeOf<VueButton.ButtonSize>().toEqualTypeOf<ButtonSize>()
    expectTypeOf<NativeButton.ButtonSize>().toEqualTypeOf<ButtonSize>()
    expectTypeOf<SvelteButton.ButtonSize>().toEqualTypeOf<ButtonSize>()
  })
})

describe("buttonVariants accepts cva's ClassProp", () => {
  test("class or className, each a clsx ClassValue", () => {
    reactButtonVariants({ class: ["a", { b: true }] })
    reactButtonVariants({ className: "a" })
    vueButtonVariants({ class: ["a", { b: true }] })
    vueButtonVariants({ className: "a" })
    nativeButtonVariants({ class: ["a", { b: true }] })
    nativeButtonVariants({ className: "a" })
    svelteButtonVariants({ class: ["a", { b: true }] })
    svelteButtonVariants({ className: "a" })
  })

  test("not both at once", () => {
    // @ts-expect-error class and className are mutually exclusive, as in cva
    reactButtonVariants({ class: "a", className: "b" })
    // @ts-expect-error class and className are mutually exclusive, as in cva
    vueButtonVariants({ class: "a", className: "b" })
    // @ts-expect-error class and className are mutually exclusive, as in cva
    nativeButtonVariants({ class: "a", className: "b" })
    // @ts-expect-error class and className are mutually exclusive, as in cva
    svelteButtonVariants({ class: "a", className: "b" })
  })
})
