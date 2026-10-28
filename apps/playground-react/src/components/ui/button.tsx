import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "@/lib/utils"

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

type ButtonVariant = keyof typeof variants
type ButtonSize = keyof typeof sizes

interface ButtonVariantProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Class string for elements that should look like a button (e.g. links). */
function buttonVariants({
  variant = "primary",
  size = "md",
}: ButtonVariantProps = {}) {
  return cn("btn", variants[variant], sizes[size])
}

// className is string-only: cn() can't merge Base UI's state-function form.
// Style states with data-* variants instead (e.g. data-disabled:opacity-50).
interface ButtonProps extends Omit<ButtonPrimitive.Props, "className">, ButtonVariantProps {
  className?: string
}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps, ButtonVariant, ButtonSize }
