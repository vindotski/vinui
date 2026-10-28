import * as React from "react"
import { Slot } from "@rn-primitives/slot"
import { clsx, type ClassValue } from "clsx"
import { cn } from "cn"
import { Pressable } from "react-native"

import { Text, TextClassContext } from "@/components/ui/text"
import { useEngineCheck } from "@/lib/vinui-engine"

const variants = {
  default: "",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  destructive: "btn-destructive",
  link: "btn-link",
} as const

const sizes = {
  default: "",
  xs: "btn-xs",
  sm: "btn-sm",
  lg: "btn-lg",
  icon: "btn-icon",
  "icon-xs": "btn-icon-xs",
  "icon-sm": "btn-icon-sm",
  "icon-lg": "btn-icon-lg",
} as const

type ButtonVariant = keyof typeof variants
type ButtonSize = keyof typeof sizes

interface ButtonVariantProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

// Same as class-variance-authority's ClassProp: `class` or `className`, not both.
type ClassProp =
  | { class: ClassValue; className?: never }
  | { class?: never; className: ClassValue }
  | { class?: never; className?: never }

/** Container classes. Behaves like a cva function: extra classes are appended, not merged. */
function buttonVariants({
  variant = "default",
  size = "default",
  class: classValue,
  className,
}: ButtonVariantProps & ClassProp = {}) {
  return clsx("btn", variants[variant], sizes[size], classValue, className)
}

/** Label classes: React Native Text doesn't inherit color/size from the Pressable. */
function buttonTextVariants({ variant = "default", size = "default" }: ButtonVariantProps = {}) {
  return clsx("btn-label", variants[variant], sizes[size])
}

type ButtonProps = React.ComponentProps<typeof Pressable> &
  ButtonVariantProps & {
    asChild?: boolean
  }

/** Wraps bare strings/numbers in Text so `<Button>Save</Button>` works (vinui addition). */
function wrapText(children: ButtonProps["children"]) {
  if (typeof children === "function") return children
  return React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? <Text>{child}</Text> : child,
  )
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  useEngineCheck()
  const Comp = asChild ? Slot : Pressable
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Comp
        className={cn(buttonVariants({ variant, size, className }), props.disabled && "opacity-50")}
        role="button"
        {...props}
      >
        {asChild ? children : wrapText(children)}
      </Comp>
    </TextClassContext.Provider>
  )
}

export { Button, buttonTextVariants, buttonVariants }
export type { ButtonProps, ButtonSize, ButtonVariant }
