import { allPlatforms, type PropDoc } from "./props.ts"

/** DialogContent props for the docs' API reference. */
export const dialogContentProps = [
  {
    name: "showCloseButton",
    type: "boolean",
    default: "true",
    description: "Show the close button in the corner.",
    platforms: allPlatforms,
  },
  {
    name: "portalHost",
    type: "string",
    description: "Name of the `<PortalHost />` to render into.",
    platforms: ["native"],
  },
] as const satisfies readonly PropDoc[]

/** DialogFooter props for the docs' API reference. */
export const dialogFooterProps = [
  {
    name: "showCloseButton",
    type: "boolean",
    default: "false",
    description: "Render an outline Close button after the footer's content.",
    platforms: allPlatforms,
    // shadcn-svelte's DialogFooter has no showCloseButton.
    addition: ["svelte"],
  },
] as const satisfies readonly PropDoc[]
