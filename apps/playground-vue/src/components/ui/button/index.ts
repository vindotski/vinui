import { cn } from "cn"

export { default as Button } from "./Button.vue"

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

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export interface ButtonVariantProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Class string for elements that should look like a button (e.g. links). */
export function buttonVariants({
  variant = "default",
  size = "default",
}: ButtonVariantProps = {}) {
  return cn("btn", variants[variant], sizes[size])
}
