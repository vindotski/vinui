import { expect, test, type Framework } from "./fixtures.ts"

/** Open/close behavior, accessibility wiring and exit animations of Dialog. */
for (const framework of ["react", "vue"] satisfies Framework[]) {
  test.describe(`${framework} Dialog`, () => {
    test.beforeEach(({ frameworks }) => {
      test.skip(!frameworks.includes(framework), `no ${framework} app on this target`)
    })

    test("opens with classes, animation, a11y wiring and focus", async ({ page, demo, visit }) => {
      await visit(page)
      await demo(page, framework, "Dialog").getByRole("button", { name: "Open dialog" }).click()
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible()
      await expect(dialog).toHaveClass(/\bdialog-content\b/)
      await expect(dialog).toHaveAttribute("data-state", "open")
      await expect(dialog).toHaveCSS("animation-name", "vinui-zoom-in")
      await expect(dialog).toHaveCSS("position", "fixed")
      await expect(page.locator(".dialog-overlay")).toHaveCSS("animation-name", "vinui-fade-in")
      await expect(dialog).toHaveAccessibleName("Delete project?")
      await expect(dialog).toHaveAccessibleDescription(/permanently removes/)
      await expect(dialog.locator(":focus")).toHaveCount(1)
      await expect(dialog.locator(".dialog-close")).toBeVisible()
    })

    test("Escape plays the exit animation, unmounts, returns focus", async ({ page, demo, visit }) => {
      await visit(page)
      const trigger = demo(page, framework, "Dialog").getByRole("button", { name: "Open dialog" })
      await trigger.click()
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible()
      await page.keyboard.press("Escape")
      // Still mounted while the exit animation runs.
      await expect(dialog).toHaveAttribute("data-state", "closed")
      await expect(dialog).toHaveCSS("animation-name", "vinui-zoom-out")
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
    })

    for (const [how, close] of [
      ["Cancel", (p: import("@playwright/test").Page) => p.getByRole("dialog").getByRole("button", { name: "Cancel" }).click()],
      ["corner X", (p: import("@playwright/test").Page) => p.locator('[role="dialog"] .dialog-close').click()],
      ["click outside", (p: import("@playwright/test").Page) => p.mouse.click(10, 10)],
    ] as const) {
      test(`${how} closes`, async ({ page, demo, visit }) => {
        await visit(page)
        await demo(page, framework, "Dialog").getByRole("button", { name: "Open dialog" }).click()
        await expect(page.getByRole("dialog")).toHaveAttribute("data-state", "open")
        await page.waitForTimeout(200)
        await close(page)
        await expect(page.getByRole("dialog")).toHaveCount(0)
      })
    }

    test("reduced motion: no animation, still closes", async ({ browser, baseURL, layout, visit }) => {
      const context = await browser.newContext({ reducedMotion: "reduce", baseURL })
      const page = await context.newPage()
      await visit(page)
      const root =
        layout === "docs"
          ? page.locator(`section:has(h2:text-is("Dialog")) [data-framework="${framework}"]`)
          : page.locator("main")
      await root.getByRole("button", { name: "Open dialog" }).click()
      const dialog = page.getByRole("dialog")
      await expect(dialog).toHaveCSS("animation-name", "none")
      await page.keyboard.press("Escape")
      await expect(dialog).toHaveCount(0)
      await context.close()
    })
  })
}
