import { PortalHost } from "@rn-primitives/portal"
import { fireEvent, render, screen } from "@testing-library/react-native"
import * as React from "react"
import { View } from "react-native"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@/components/ui/select"

function Example({ onValueChange, value }: { onValueChange?: (option: Option) => void; value?: Option }) {
  return (
    <>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label="Fruit" className="w-44">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple" label="Apple" />
            {/* The web-style string child works as the label too. */}
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="grapes" label="Grapes" disabled />
          </SelectGroup>
          <SelectSeparator testID="separator" />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot" label="Carrot" />
          </SelectGroup>
        </SelectContent>
      </Select>
      <PortalHost />
    </>
  )
}

/**
 * rn-primitives opens the list only once it has measured the trigger, and React Native's
 * Jest mock of `View.measure` never calls back: report a fixed layout instead.
 */
beforeAll(async () => {
  const probe = React.createRef<React.ComponentRef<typeof View>>()
  await render(<View ref={probe} />)
  const proto = Object.getPrototypeOf(probe.current) as { measure: jest.Mock }
  proto.measure.mockImplementation((callback: (...layout: number[]) => void) => callback(0, 0, 176, 36, 16, 100))
})

const trigger = () => screen.getByLabelText("Fruit")
const open = () => fireEvent.press(trigger())

/** Nearest ancestor (or self) whose className includes `cls`. */
function ancestorWithClass(el: ReturnType<typeof screen.getByText>, cls: string) {
  for (let node: typeof el | null = el; node; node = node.parent) {
    if (typeof node.props?.className === "string" && node.props.className.split(/\s+/).includes(cls)) return node
  }
  return null
}

type Node = { type?: unknown; children?: unknown[] }
function hasSvg(node: Node): boolean {
  return node.type === "RNSVGSvgView" || (node.children ?? []).some((c) => typeof c === "object" && c !== null && hasSvg(c as Node))
}

describe("Select", () => {
  test("trigger: vinui's classes, sizes, and the muted placeholder", async () => {
    await render(<Example />)
    expect(trigger().props.className).toMatch(/^select-trigger flex-row\b/)
    expect(trigger().props.className).toContain("w-44")
    const placeholder = screen.getByText("Pick a fruit")
    expect(placeholder.props.className).toContain("text-muted-foreground")
    expect(screen.queryByText("Apple")).toBeNull()
  })

  test('size="sm" adds select-trigger-sm; disabled adds opacity-50', async () => {
    await render(
      <Select>
        <SelectTrigger aria-label="Size" size="sm" disabled>
          <SelectValue placeholder="Size" />
        </SelectTrigger>
      </Select>,
    )
    const size = screen.getByLabelText("Size")
    expect(size.props.className).toBe("select-trigger flex-row select-trigger-sm opacity-50")
  })

  test("opens a panel with groups, labels, a separator and options", async () => {
    await render(<Example />)
    await open()
    const apple = screen.getByText("Apple")
    expect(ancestorWithClass(apple, "select-item")).not.toBeNull()
    expect(ancestorWithClass(apple, "select-panel")).not.toBeNull()
    expect(screen.getByText("Banana")).toBeOnTheScreen()
    expect(screen.getByText("Fruits").props.className).toContain("select-label")
    expect(screen.getByText("Vegetables")).toBeOnTheScreen()
    expect(screen.getByTestId("separator").props.className).toContain("select-separator")
    expect(ancestorWithClass(screen.getByText("Grapes"), "opacity-50")).not.toBeNull()
  })

  test("choosing an option reports { value, label }, closes, and shows it on the trigger", async () => {
    const onValueChange = jest.fn()
    await render(<Example onValueChange={onValueChange} />)
    await open()
    await fireEvent.press(screen.getByText("Banana"))
    expect(onValueChange).toHaveBeenCalledWith({ value: "banana", label: "Banana" })
    expect(screen.queryByText("Apple")).toBeNull()
    const value = screen.getByText("Banana")
    expect(value.props.className).toContain("text-foreground")
    expect(value.props.className).not.toContain("text-muted-foreground")
  })

  test("a disabled option can't be chosen", async () => {
    const onValueChange = jest.fn()
    await render(<Example onValueChange={onValueChange} />)
    await open()
    await fireEvent.press(screen.getByText("Grapes"))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test("controlled: shows the value's label; the selected option shows the check", async () => {
    await render(<Example value={{ value: "carrot", label: "Carrot" }} />)
    expect(screen.getByText("Carrot")).toBeOnTheScreen()
    await open()
    const carrots = screen.getAllByText("Carrot")
    const item = carrots.map((el) => ancestorWithClass(el, "select-item")).find(Boolean)!
    expect(item).toBeDefined()
    // The check icon (an SVG) renders inside the selected option only.
    expect(hasSvg(item)).toBe(true)
    expect(hasSvg(ancestorWithClass(screen.getByText("Apple"), "select-item")!)).toBe(false)
  })
})
