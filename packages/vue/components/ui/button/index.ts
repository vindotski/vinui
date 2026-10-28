import { cn } from "@/lib/utils"

export { default as Button } from "./Button.vue"

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  destructive: "btn-destructive",
} as const

const sizes = {
  md: "btn-md",
  sm: "btn-sm",
  lg: "btn-lg",
  icon: "btn-icon",
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export interface ButtonVariantProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Class string for elements that should look like a button (e.g. links). */
export function buttonVariants({
  variant = "primary",
  size = "md",
}: ButtonVariantProps = {}) {
  return cn("btn", variants[variant], sizes[size])
}
