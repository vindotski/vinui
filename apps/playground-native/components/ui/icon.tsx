import * as React from "react"
import { cn } from "cn"
import type { LucideIcon, LucideProps } from "lucide-react-native"
import { withUniwind } from "uniwind"

import { TextClassContext } from "@/components/ui/text"

type IconProps = LucideProps & {
  as: LucideIcon
  className?: string
}

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />
}

const StyledIcon = withUniwind(IconImpl, {
  size: { fromClassName: "className", styleProperty: "width" },
  color: { fromClassName: "className", styleProperty: "color" },
})

function Icon({ as: IconComponent, className, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext)
  return <StyledIcon as={IconComponent} className={cn(textClass ? cn("size-5", textClass) : "text-foreground size-5", className)} {...props} />
}

export { Icon }
export type { IconProps }
