import { Button, buttonVariants } from "@vinui/react/ui/button"

const variants = ["primary", "secondary", "outline", "ghost", "destructive"] as const
const sizes = ["sm", "md", "lg"] as const

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
        <Button variant="outline" size="icon" aria-label="Add">
          +
        </Button>
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
