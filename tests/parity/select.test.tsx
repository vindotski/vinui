/** Runtime parity for Select: the trigger's classes per size and its data attributes, React and Vue alike. */
import { selectTriggerSizeValues } from "@vinui/core"
import { Select as ReactSelect, SelectTrigger as ReactSelectTrigger, SelectValue as ReactSelectValue } from "@vinui/react/ui/select"
import {
  Select as VueSelect,
  SelectTrigger as VueSelectTrigger,
  SelectValue as VueSelectValue,
} from "@vinui/vue/ui/select"
import { renderToString as renderReact } from "react-dom/server"
import { renderToString as renderVue } from "@vue/server-renderer"
import { createSSRApp, h } from "vue"
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

type Size = (typeof selectTriggerSizeValues)[number]

async function vue(size?: Size, className?: string) {
  const app = createSSRApp({
    render: () =>
      h(VueSelect, null, () =>
        h(VueSelectTrigger, { size, class: className }, () => h(VueSelectValue, { placeholder: "Pick" })),
      ),
  })
  return trigger(await renderVue(app))
}

const renderers: [string, (size?: Size, className?: string) => ReturnType<typeof trigger> | Promise<ReturnType<typeof trigger>>][] = [
  ["react", react],
  ["vue", vue],
]

describe.each(renderers)("%s SelectTrigger classes", (_name, render) => {
  test.each([
    [undefined, "select-trigger", "default"],
    ["default", "select-trigger", "default"],
    ["sm", "select-trigger select-trigger-sm", "sm"],
  ] as const)("size %s → %s", async (size, expected, dataSize) => {
    expect(await render(size)).toEqual({ class: expected, size: dataSize })
  })

  test("every core size renders", async () => {
    for (const size of selectTriggerSizeValues) expect((await render(size)).class).toMatch(/^select-trigger\b/)
  })

  test("class is merged with cn()", async () => {
    expect((await render("sm", "w-44")).class).toBe("select-trigger select-trigger-sm w-44")
  })
})
