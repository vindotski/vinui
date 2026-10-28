import { expect, test } from "./fixtures.ts"

/** The docs page renders every Button variant/size in both frameworks; they must match. */
test.describe("Button parity (docs)", () => {
  test.beforeEach(({ layout }) => {
    test.skip(layout !== "docs", "needs the side-by-side docs page")
  })

  test("React and Vue buttons are identical", async ({ page, demo, visit }) => {
    await visit(page)
    const read = (framework: "react" | "vue") =>
      demo(page, framework, "Button")
        .locator(".btn")
        .evaluateAll((els) =>
          els.map((el) => {
            const cs = getComputedStyle(el)
            return {
              text: el.textContent?.trim(),
              class: el.className,
              variant: (el as HTMLElement).dataset.variant,
              size: (el as HTMLElement).dataset.size,
              width: (el as HTMLElement).offsetWidth,
              height: (el as HTMLElement).offsetHeight,
              background: cs.backgroundColor,
              color: cs.color,
              border: cs.borderTopColor,
              borderWidth: cs.borderTopWidth,
              borderStyle: cs.borderTopStyle,
            }
          }),
        )
    const react = await read("react")
    expect(react.length).toBeGreaterThan(10)
    expect(await read("vue")).toEqual(react)
  })

  test("link variant underlines on hover in both", async ({ page, demo, visit }) => {
    await visit(page)
    for (const framework of ["react", "vue"] as const) {
      const link = demo(page, framework, "Button").locator(".btn-link").first()
      await expect(link).toHaveCSS("text-decoration-line", "none")
      await link.hover()
      await expect(link).toHaveCSS("text-decoration-line", "underline")
    }
  })

  test("outline has a 1px solid input-colored border; default border is transparent", async ({ page, demo, visit }) => {
    await visit(page)
    const inputColor = await page.evaluate(() => {
      const probe = document.createElement("div")
      probe.style.color = "var(--color-input)"
      document.body.append(probe)
      const c = getComputedStyle(probe).color
      probe.remove()
      return c
    })
    for (const framework of ["react", "vue"] as const) {
      const root = demo(page, framework, "Button")
      const outline = root.locator(".btn-outline").first()
      await expect(outline).toHaveCSS("border-top-width", "1px")
      await expect(outline).toHaveCSS("border-top-style", "solid")
      await expect(outline).toHaveCSS("border-top-color", inputColor)
      const plain = root.locator('[data-variant="default"]').first()
      await expect(plain).toHaveCSS("border-top-width", "1px")
      await expect(plain).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)")
    }
  })

  test(":active press tint changes the background, identically in both", async ({ page, demo, visit }) => {
    await visit(page)
    const pressed: Record<string, [string, string]> = {}
    for (const framework of ["react", "vue"] as const) {
      const btn = demo(page, framework, "Button").locator('[data-variant="default"]').first()
      await btn.hover()
      await page.waitForTimeout(200) // let the hover transition settle
      const hover = await btn.evaluate((el) => getComputedStyle(el).backgroundColor)
      await page.mouse.down()
      await page.waitForTimeout(200)
      const active = await btn.evaluate((el) => getComputedStyle(el).backgroundColor)
      await page.mouse.up()
      expect(active, `${framework} :active differs from hover`).not.toBe(hover)
      pressed[framework] = [hover, active]
    }
    expect(pressed.vue).toEqual(pressed.react)
  })
})
