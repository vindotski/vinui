import { Button, buttonVariants } from "@vinui/react/ui/button"

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const sizes = ["xs", "sm", "default", "lg"] as const
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const

export function ReactButtons() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {sizes.map((size) => (
          <Button key={size} variant="outline" size={size}>
            {size}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {iconSizes.map((size) => (
          <Button key={size} variant="outline" size={size} aria-label={`Add (${size})`}>
            +
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled>disabled</Button>
        <a href="#" className={buttonVariants({ variant: "ghost" })}>
          link
        </a>
      </div>
    </div>
  )
}
