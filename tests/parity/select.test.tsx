/** Runtime parity for Select: the trigger's classes per size, and its data attributes. */
import { selectTriggerSizeValues } from "@vinui/core"
import { Select as ReactSelect, SelectTrigger as ReactSelectTrigger, SelectValue as ReactSelectValue } from "@vinui/react/ui/select"
import { renderToString as renderReact } from "react-dom/server"
import { describe, expect, test } from "vitest"

/** Attributes of the rendered trigger <button>. */
function trigger(html: string) {
  const tag = /<button[^>]*data-slot="select-trigger"[^>]*>/.exec(html)?.[0] ?? ""
  const attr = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1]
  return { class: attr("class"), size: attr("data-size") }
}

const react = (size?: (typeof selectTriggerSizeValues)[number], className?: string) =>
  trigger(
    renderReact(
      <ReactSelect>
        <ReactSelectTrigger size={size} className={className}>
          <ReactSelectValue placeholder="Pick" />
        </ReactSelectTrigger>
      </ReactSelect>,
    ),
  )

describe("SelectTrigger classes", () => {
  test.each([
    [undefined, "select-trigger", "default"],
    ["default", "select-trigger", "default"],
    ["sm", "select-trigger select-trigger-sm", "sm"],
  ] as const)("size %s → %s", (size, expected, dataSize) => {
    expect(react(size)).toEqual({ class: expected, size: dataSize })
  })

  test("every core size renders", () => {
    for (const size of selectTriggerSizeValues) expect(react(size).class).toMatch(/^select-trigger\b/)
  })

  test("className is merged with cn()", () => {
    expect(react("sm", "w-44").class).toBe("select-trigger select-trigger-sm w-44")
  })
})
