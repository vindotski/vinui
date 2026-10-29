import { allPlatforms, type PropDoc } from "./props.ts"

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

/** Button props for the docs' API reference (checked against each platform by tests). */
export const buttonProps = [
  {
    name: "variant",
    values: buttonVariantValues,
    default: "default",
    description: "Visual style.",
    platforms: allPlatforms,
  },
  {
    name: "size",
    values: buttonSizeValues,
    default: "default",
    description: "Height and padding. `icon` sizes are square.",
    platforms: allPlatforms,
  },
  {
    name: "asChild",
    type: "boolean",
    default: "false",
    description: "Render the child element instead, with the button's props and classes.",
    platforms: allPlatforms,
    // React Native Reusables' Button has no asChild; native keeps shadcn's.
    addition: ["native"],
  },
  {
    name: "className",
    names: { vue: "class" },
    type: "string",
    description: "Extra classes, merged after vinui's with `cn()`.",
    platforms: allPlatforms,
  },
] as const satisfies readonly PropDoc[]
