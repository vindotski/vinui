/**
 * Stale-docs guard (types): every prop core's metadata lists for a platform
 * must exist on that platform's component, under that platform's name.
 * Vue is checked at runtime (props.test.ts) to keep type tests off .vue files.
 */
import { buttonProps, dialogContentProps, dialogFooterProps, selectTriggerProps, type Platform } from "@vinui/core"
import type { ButtonProps as ReactButtonProps } from "@vinui/react/ui/button"
import type { DialogContent as ReactDialogContent, DialogFooter as ReactDialogFooter } from "@vinui/react/ui/dialog"
import type { SelectTrigger as ReactSelectTrigger } from "@vinui/react/ui/select"
import type { ComponentProps } from "react"
import { describe, expectTypeOf, test } from "vitest"

type Entry = { name: string; names?: Partial<Record<Platform, string>>; platforms: readonly Platform[] }
/** The prop's name on platform P: names[P] if set, otherwise name. */
type NameOn<E, P extends Platform> = E extends { names: { readonly [K in P]: infer N } } ? N : E extends { name: infer N } ? N : never
/** Names of every entry that lists platform P. */
type NamesFor<M extends readonly Entry[], P extends Platform> = {
  [I in keyof M]: P extends M[I]["platforms"][number] ? NameOn<M[I], P> : never
}[number]
/** Documented names that the component's props don't have (must be never). */
type Missing<Props, M extends readonly Entry[], P extends Platform> = Exclude<NamesFor<M, P>, keyof Props>

describe("documented props exist", () => {
  test("React", () => {
    expectTypeOf<Missing<ReactButtonProps, typeof buttonProps, "react">>().toEqualTypeOf<never>()
    expectTypeOf<Missing<ComponentProps<typeof ReactDialogContent>, typeof dialogContentProps, "react">>().toEqualTypeOf<never>()
    expectTypeOf<Missing<ComponentProps<typeof ReactDialogFooter>, typeof dialogFooterProps, "react">>().toEqualTypeOf<never>()
    expectTypeOf<Missing<ComponentProps<typeof ReactSelectTrigger>, typeof selectTriggerProps, "react">>().toEqualTypeOf<never>()
  })

  test("the helper itself catches a stale name", () => {
    type Stale = readonly [{ name: "variants"; platforms: readonly ["react"] }]
    expectTypeOf<Missing<ReactButtonProps, Stale, "react">>().toEqualTypeOf<"variants">()
  })
})
