import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"

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

/** Class string for elements that should look like a button (e.g. links). */
function buttonVariants({
  variant = "default",
  size = "default",
}: ButtonVariantProps = {}) {
  return cn("btn", variants[variant], sizes[size])
}

type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariantProps & {
    asChild?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps, ButtonVariant, ButtonSize }
