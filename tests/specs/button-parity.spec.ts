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
})
