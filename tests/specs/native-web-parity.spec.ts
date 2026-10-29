import type { Locator, Page } from "@playwright/test"

import { expect, test } from "./fixtures.ts"

/**
 * vinui native on react-native-web must look like vinui React: same classes, same CSS.
 * The reference is the React demo on the docs (docs-dev target), which has the same
 * Button rows as the native playground. Colours are compared as sRGB pixels, since the
 * native build gets hex tokens (reported as lab()) and React gets oklch().
 */
const REFERENCE = "http://localhost:4321/"
/** Playground-only buttons that the docs' Button demo doesn't have. */
const PLAYGROUND_ONLY = new Set(["light", "dark", "system", "Open dialog", "Footer close"])

async function openReference(page: Page) {
  await page.goto(REFERENCE)
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0)
  return page.locator('section:has(h2:text-is("Button")) [data-framework="react"]')
}

/** Paints a CSS colour on a canvas and reads the pixel back, so any colour syntax compares equal. */
const rgba = (page: Page, color: string) =>
  page.evaluate((color) => {
    const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d")!
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    return Array.from(ctx.getImageData(0, 0, 1, 1).data).join(",")
  }, color)

/** Every .btn in order; the label colour comes from the btn-label Text on native. */
async function readButtons(page: Page, root: Locator) {
  const raw = await root.locator(".btn").evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el)
      const label = el.querySelector(".btn-label") ?? el
      return {
        text: el.textContent?.trim() ?? "",
        width: (el as HTMLElement).offsetWidth,
        height: (el as HTMLElement).offsetHeight,
        radius: cs.borderTopLeftRadius,
        borderWidth: cs.borderTopWidth,
        borderStyle: cs.borderTopStyle,
        background: cs.backgroundColor,
        border: cs.borderTopColor,
        color: getComputedStyle(label).color,
        fontSize: getComputedStyle(label).fontSize,
      }
    }),
  )
  const out = []
  for (const b of raw) {
    if (PLAYGROUND_ONLY.has(b.text)) continue
    out.push({
      ...b,
      // Icon buttons: "+" text on the docs, a Lucide icon on native.
      text: b.text === "+" ? "" : b.text,
      background: await rgba(page, b.background),
      border: await rgba(page, b.border),
      color: await rgba(page, b.color),
    })
  }
  return out
}

/** Background and label colour of a button after hovering / pressing it (transitions settled). */
async function stateColors(page: Page, button: Locator, state: "hover" | "active") {
  await button.hover()
  if (state === "active") await page.mouse.down()
  await page.waitForTimeout(300)
  const [bg, fg] = await button.evaluate((el) => {
    const label = el.querySelector(".btn-label") ?? el
    return [getComputedStyle(el).backgroundColor, getComputedStyle(label).color]
  })
  if (state === "active") await page.mouse.up()
  await page.mouse.move(0, 0)
  return [await rgba(page, bg), await rgba(page, fg)]
}

test.describe("native web Button matches React", () => {
  test.beforeEach(({ frameworks }) => {
    test.skip(!frameworks.includes("native"), "no native web app on this target")
  })

  for (const colorScheme of ["light", "dark"] as const) {
    test(`every variant and size (${colorScheme})`, async ({ browser, baseURL, demo }) => {
      const context = await browser.newContext({ colorScheme, baseURL })
      const reference = await context.newPage()
      const react = await readButtons(reference, await openReference(reference))
      const page = await context.newPage()
      await page.goto("/")
      const root = demo(page, "native", "Button")
      await expect(root.getByRole("button", { name: "secondary", exact: true })).toBeVisible()
      const native = await readButtons(page, root)
      expect(react.length).toBeGreaterThan(10)
      expect(native).toEqual(react)
      await context.close()
    })
  }

  test("hover and press: background and label colour match", async ({ browser, baseURL, demo }) => {
    const context = await browser.newContext({ baseURL })
    const reference = await context.newPage()
    const react = await openReference(reference)
    const page = await context.newPage()
    await page.goto("/")
    const native = demo(page, "native", "Button")
    for (const variant of ["default", "outline", "ghost", "destructive"]) {
      for (const state of ["hover", "active"] as const) {
        const expected = await stateColors(reference, react.getByRole("button", { name: variant, exact: true }).first(), state)
        const actual = await stateColors(page, native.getByRole("button", { name: variant, exact: true }).first(), state)
        expect(actual, `${variant} :${state}`).toEqual(expected)
      }
    }
    await context.close()
  })
})
