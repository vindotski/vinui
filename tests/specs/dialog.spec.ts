import { expect, test, type Framework } from "./fixtures.ts"

/**
 * Open/close behavior, accessibility wiring and animations of Dialog.
 * Native (react-native-web) wraps the same Radix Dialog, so behavior and a11y are shared.
 * Its structure differs: the panel classes sit inside Radix's role="dialog" element, the
 * overlay positions it, and Reanimated runs the animations.
 */
for (const framework of ["react", "vue", "svelte", "native"] satisfies Framework[]) {
  const native = framework === "native"
  test.describe(`${framework} Dialog`, () => {
    test.beforeEach(({ frameworks }) => {
      test.skip(!frameworks.includes(framework), `no ${framework} app on this target`)
    })

    test("opens with classes, animation, a11y wiring and focus", async ({ page, demo, visit }) => {
      await visit(page)
      await demo(page, framework, "Dialog").getByRole("button", { name: "Open dialog" }).click()
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible()
      await expect(dialog).toHaveAttribute("data-state", "open")
      if (native) {
        // Reanimated's FadeIn, on the view around Radix's element.
        await expect(dialog.locator("xpath=..")).toHaveCSS("animation-name", "FadeIn")
      } else {
        await expect(dialog).toHaveClass(/\bdialog-content\b/)
        await expect(dialog).toHaveCSS("animation-name", "vinui-zoom-in")
        await expect(dialog).toHaveCSS("position", "fixed")
        await expect(page.locator(".dialog-overlay")).toHaveCSS("animation-name", "vinui-fade-in")
      }
      await expect(dialog).toHaveAccessibleName("Delete project?")
      await expect(dialog).toHaveAccessibleDescription(/permanently removes/)
      await expect(dialog.locator(":focus")).toHaveCount(1)
      await expect(dialog.locator(".dialog-close")).toBeVisible()
      // dialog-content composes dialog-panel (native uses dialog-panel): the panel's look must be intact.
      const panel = native ? dialog.locator(".dialog-panel") : dialog
      const tokenBg = await page.evaluate(() => {
        const probe = document.createElement("div")
        probe.style.backgroundColor = "var(--color-background)"
        document.body.append(probe)
        const c = getComputedStyle(probe).backgroundColor
        probe.remove()
        return c
      })
      await expect(panel).toHaveCSS("background-color", tokenBg)
      await expect(panel).toHaveCSS("border-top-width", "1px")
      await expect(panel).toHaveCSS("border-top-style", "solid")
      await expect(panel).toHaveCSS("padding-top", "24px")
      await expect(panel).toHaveCSS("border-top-left-radius", "10px")
      await expect(panel).toHaveCSS("display", native ? "flex" : "grid")
      expect(await panel.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none")
      if (native) {
        // max-w-lg, centred (web:items-stretch + web:mx-auto around Radix's wrapper).
        const box = (await panel.boundingBox())!
        const viewport = page.viewportSize()!
        expect(box.width).toBe(512)
        expect(Math.abs(box.x - (viewport.width - box.x - box.width))).toBeLessThanOrEqual(1)
      }
    })

    test("Escape plays the exit animation, unmounts, returns focus", async ({ page, demo, visit }) => {
      await visit(page)
      const trigger = demo(page, framework, "Dialog").getByRole("button", { name: "Open dialog" })
      await trigger.click()
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible()
      await page.keyboard.press("Escape")
      if (!native) {
        // Still mounted while the exit animation runs.
        await expect(dialog).toHaveAttribute("data-state", "closed")
        await expect(dialog).toHaveCSS("animation-name", "vinui-zoom-out")
      }
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

    test("footer showCloseButton renders a Close button that closes; no corner X", async ({ page, demo, visit }) => {
      await visit(page)
      await demo(page, framework, "Dialog").getByRole("button", { name: "Footer close" }).click()
      const dialog = page.getByRole("dialog")
      await expect(dialog).toHaveAttribute("data-state", "open")
      await expect(dialog).toHaveAccessibleName("Saved")
      await expect(dialog.locator(".dialog-close")).toHaveCount(0)
      const close = dialog.getByRole("button", { name: "Close" })
      await expect(close).toHaveCount(1)
      await expect(close).toHaveClass(/\bbtn-outline\b/)
      await page.waitForTimeout(200)
      await close.click()
      await expect(dialog).toHaveCount(0)
    })

    test("reduced motion: no animation, still closes", async ({ browser, baseURL, demo, visit }) => {
      const context = await browser.newContext({ reducedMotion: "reduce", baseURL })
      const page = await context.newPage()
      await visit(page)
      await demo(page, framework, "Dialog").getByRole("button", { name: "Open dialog" }).click()
      const dialog = page.getByRole("dialog")
      await expect(native ? dialog.locator("xpath=..") : dialog).toHaveCSS("animation-name", "none")
      await page.keyboard.press("Escape")
      await expect(dialog).toHaveCount(0)
      await context.close()
    })
  })
}
