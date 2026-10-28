import { clsx, type ClassValue } from "clsx"

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

// Same as class-variance-authority's ClassProp: `class` or `className`, not both.
type ClassProp =
  | { class: ClassValue; className?: never }
  | { class?: never; className: ClassValue }
  | { class?: never; className?: never }

/**
 * Class string for elements that should look like a button (e.g. links).
 * Behaves like a cva function: extra classes are appended, not merged.
 */
export function buttonVariants({
  variant = "default",
  size = "default",
  class: classValue,
  className,
}: ButtonVariantProps & ClassProp = {}) {
  return clsx("btn", variants[variant], sizes[size], classValue, className)
}
