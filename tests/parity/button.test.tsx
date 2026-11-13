/**
 * Runtime parity for Button: React and Vue must produce the same classes, and
 * the classes must be the ones we expect (both frameworks agreeing on the
 * wrong output must still fail).
 */
import { buttonSizeValues, buttonVariantValues } from "@vinui/core"
import { Button as ReactButton, buttonVariants as reactButtonVariants } from "@vinui/react/ui/button"
import { Button as VueButton, buttonVariants as vueButtonVariants } from "@vinui/vue/ui/button"
import { buttonVariants as nativeButtonVariants } from "@vinui/native/ui/button"
import { Button as SvelteButton, buttonVariants as svelteButtonVariants } from "@vinui/svelte/ui/button"
import { renderToString as renderReact } from "react-dom/server"
import { describe, expect, test } from "vitest"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "@vue/server-renderer"
import { createRawSnippet } from "svelte"
import { render as renderSvelte } from "svelte/server"

type ButtonVariantsFn = typeof reactButtonVariants

const frameworks: [name: string, buttonVariants: ButtonVariantsFn][] = [
  ["react", reactButtonVariants],
  ["vue", vueButtonVariants],
  ["svelte", svelteButtonVariants],
  ["native", nativeButtonVariants],
]

/** Every variant × size, including omitted props (where "plain btn" lives). */
function matrix(buttonVariants: ButtonVariantsFn) {
  const result: Record<string, string> = {}
  for (const variant of [undefined, ...buttonVariantValues]) {
    for (const size of [undefined, ...buttonSizeValues]) {
      result[`${variant ?? "(omitted)"} / ${size ?? "(omitted)"}`] = buttonVariants({ variant, size })
    }
  }
  return result
}

describe("buttonVariants class matrix", () => {
  const reactMatrix = matrix(reactButtonVariants)

  test("React matrix matches the shared snapshot", () => {
    expect(reactMatrix).toMatchSnapshot()
  })

  // Plain equality, not a second snapshot: `vitest -u` can't paper over drift.
  test("Vue matrix equals React matrix", () => {
    expect(matrix(vueButtonVariants)).toEqual(reactMatrix)
  })

  test("Svelte matrix equals React matrix", () => {
    expect(matrix(svelteButtonVariants)).toEqual(reactMatrix)
  })

  // Native shares web's component classes (docs/decisions/0005), so it must match too.
  test("native matrix equals React matrix", () => {
    expect(matrix(nativeButtonVariants)).toEqual(reactMatrix)
  })
})

describe.each(frameworks)("%s buttonVariants", (_name, buttonVariants) => {
  test.each([
    [{}, "btn"],
    [{ variant: "default", size: "default" }, "btn"],
    [{ variant: "outline" }, "btn btn-outline"],
    [{ size: "icon-lg" }, "btn btn-icon-lg"],
    [{ variant: "link", size: "xs" }, "btn btn-link btn-xs"],
  ] as const)("%o → %s", (props, expected) => {
    expect(buttonVariants(props)).toBe(expected)
  })

  // cva semantics: append with clsx, no tailwind-merge.
  test.each([
    [{ className: "w-full" }, "btn w-full"],
    [{ class: "w-full" }, "btn w-full"],
    [{ variant: "outline", className: "bg-red-500 bg-blue-500" }, "btn btn-outline bg-red-500 bg-blue-500"],
    [{ className: "btn" }, "btn btn"],
    [{ className: ["x", { y: true, z: false }] }, "btn x y"],
    [{ className: undefined }, "btn"],
  ] as const)("extra classes %o → %s", (props, expected) => {
    expect(buttonVariants(props)).toBe(expected)
  })
})

/** Rendered `class` attribute of the first element. */
function classOf(html: string) {
  return /class="([^"]*)"/.exec(html)?.[1]
}

async function renderVueButton(props: Record<string, unknown>) {
  return renderVue(createSSRApp({ render: () => h(VueButton, props, () => "Go") }))
}

function renderSvelteButton(props: Record<string, unknown>) {
  const children = createRawSnippet(() => ({ render: () => "<span>Go</span>" }))
  return renderSvelte(SvelteButton, { props: { ...props, children } }).body
}

describe("Button component merges its class prop with cn()", () => {
  test.each([
    [{ variant: "outline", extra: "w-full" }, "btn btn-outline w-full"],
    // tailwind-merge applies here (component level), so the later bg wins.
    [{ variant: undefined, extra: "bg-red-500 bg-blue-500" }, "btn bg-blue-500"],
  ] as const)("%o → %s", async ({ variant, extra }, expected) => {
    const react = classOf(renderReact(<ReactButton variant={variant} className={extra}>Go</ReactButton>))
    const vue = classOf(await renderVueButton({ variant, class: extra }))
    const svelte = classOf(renderSvelteButton({ variant, class: extra }))
    expect(react).toBe(expected)
    expect(vue).toBe(expected)
    expect(svelte).toBe(expected)
  })
})
