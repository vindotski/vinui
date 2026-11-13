import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@vinui/react/ui/select"

export function ReactSelect() {
  const [size, setSize] = React.useState("m")
  return (
    <div className="flex flex-col gap-2">
      <Select>
        <SelectTrigger aria-label="Fruit" className="w-44">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes" disabled>
              Grapes
            </SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
            <SelectItem value="leek">Leek</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select value={size} onValueChange={setSize}>
        <SelectTrigger aria-label="Size" size="sm" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="s">Small</SelectItem>
          <SelectItem value="m">Medium</SelectItem>
          <SelectItem value="l">Large</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">Size: {size}</p>
    </div>
  )
}
