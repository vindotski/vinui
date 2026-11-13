import { allPlatforms, type PropDoc } from "./props.ts"

/** SelectTrigger `size` values, in shadcn's order. */
export const selectTriggerSizeValues = ["sm", "default"] as const

export type SelectTriggerSize = (typeof selectTriggerSizeValues)[number]

/** SelectTrigger props for the docs' API reference. */
export const selectTriggerProps = [
  {
    name: "size",
    values: selectTriggerSizeValues,
    default: "default",
    description: "Height of the trigger.",
    platforms: allPlatforms,
  },
] as const satisfies readonly PropDoc[]
