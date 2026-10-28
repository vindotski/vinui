import { buttonSizeValues, buttonVariantValues } from "@vinui/core"
import { fireEvent, render, screen } from "@testing-library/react-native"
import * as React from "react"
import { Pressable } from "react-native"

import { Button, buttonTextVariants, buttonVariants } from "@/components/ui/button"
import { Text } from "@/components/ui/text"

describe("Button", () => {
  test.each(buttonVariantValues)("variant %s renders with its classes", async (variant) => {
    await render(<Button variant={variant}>Go</Button>)
    expect(screen.getByRole("button").props.className).toBe(buttonVariants({ variant }))
  })

  test.each(buttonSizeValues)("size %s renders with its classes", async (size) => {
    await render(<Button size={size}>Go</Button>)
    expect(screen.getByRole("button").props.className).toBe(buttonVariants({ size }))
  })

  test("string and number children are wrapped in Text with the label classes", async () => {
    await render(
      <Button variant="outline" size="sm">
        Save {3}
      </Button>,
    )
    const labels = screen.getAllByText(/Save|3/)
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) expect(label.props.className).toContain(buttonTextVariants({ variant: "outline", size: "sm" }))
  })

  test("Text children are not double-wrapped and still get the label classes", async () => {
    await render(
      <Button>
        <Text>Save</Text>
      </Button>,
    )
    const label = screen.getByText("Save")
    expect(label.props.className).toContain("btn-label")
    expect(screen.getAllByText("Save")).toHaveLength(1)
  })

  test("label Text gets only the button's label classes, not Text's defaults", async () => {
    // Regression: Text's text-foreground/text-base outrank multi-property utilities
    // like btn-label in Tailwind's order, which gave labels the wrong color and size.
    await render(
      <>
        <Button variant="destructive">Delete</Button>
        <Text>Plain</Text>
      </>,
    )
    const label = screen.getByText("Delete").props.className as string
    expect(label).toContain("btn-label btn-destructive")
    expect(label).not.toMatch(/\btext-(foreground|base)\b/)
    expect(screen.getByText("Plain").props.className).toContain("text-foreground text-base")
  })

  test("onPress fires", async () => {
    const onPress = jest.fn()
    await render(<Button onPress={onPress}>Go</Button>)
    await fireEvent.press(screen.getByRole("button"))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  test("disabled blocks presses and dims the button", async () => {
    const onPress = jest.fn()
    await render(
      <Button disabled onPress={onPress}>
        Go
      </Button>,
    )
    const button = screen.getByRole("button")
    await fireEvent.press(button)
    expect(onPress).not.toHaveBeenCalled()
    expect(button.props.className).toContain("opacity-50")
  })

  test("asChild puts the button classes and press handler on the child", async () => {
    const onPress = jest.fn()
    await render(
      <Button asChild variant="outline" onPress={onPress}>
        <Pressable testID="custom">
          <Text>Custom</Text>
        </Pressable>
      </Button>,
    )
    const custom = screen.getByTestId("custom")
    expect(custom.props.className).toContain("btn btn-outline")
    // The label inside the box child still gets the variant's text classes.
    expect(screen.getByText("Custom").props.className).toContain("btn-label btn-outline")
    await fireEvent.press(custom)
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
