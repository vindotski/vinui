/** Button `variant` values, in shadcn's order. */
export const buttonVariantValues = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const

/** Button `size` values, in shadcn's order. */
export const buttonSizeValues = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const

export type ButtonVariant = (typeof buttonVariantValues)[number]
export type ButtonSize = (typeof buttonSizeValues)[number]
