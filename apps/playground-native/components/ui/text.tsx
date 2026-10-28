import * as React from "react"
import { Slot } from "@rn-primitives/slot"
import { cn } from "cn"
import { Text as RNText } from "react-native"

import { useEngineCheck } from "@/lib/vinui-engine"

/** Classes a parent (e.g. Button) passes to the Text inside it. */
const TextClassContext = React.createContext<string | undefined>(undefined)

type TextProps = React.ComponentProps<typeof RNText> & {
  asChild?: boolean
}

function Text({ className, asChild = false, ...props }: TextProps) {
  useEngineCheck()
  const textClass = React.useContext(TextClassContext)
  const Component = asChild ? Slot : RNText
  // A parent's text classes (e.g. Button's `btn-label …`) replace the defaults rather than
  // stacking on them: Tailwind sorts single-property utilities like text-foreground after
  // multi-property ones, so they would override the parent's color and size.
  return <Component className={cn(textClass ?? "text-foreground text-base", className)} {...props} />
}

export { Text, TextClassContext }
export type { TextProps }
