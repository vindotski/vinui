import { expect, test, type Framework } from "./fixtures.ts"

/**
 * Select: look, opening, choosing by pointer and keyboard (arrows skip disabled
 * options, typeahead), Escape, a controlled popper select, reduced motion.
 * Scenarios match the playgrounds' SelectDemo.
 * While the list is open, the primitives aria-hide everything outside it, the
 * trigger included, so the open trigger is found by data-slot, not by role.
 */
const trigger = (page: import("@playwright/test").Page, name: string) =>
  page.locator(`[data-slot="select-trigger"][aria-label="${name}"]`)
const token = (page: import("@playwright/test").Page, name: string) =>
  page.evaluate((name) => {
    const probe = document.createElement("div")
    probe.style.backgroundColor = `var(${name})`
    document.body.append(probe)
    const color = getComputedStyle(probe).backgroundColor
    probe.remove()
    return color
  }, name)

for (const framework of ["react"] satisfies Framework[]) {
  test.describe(`${framework} Select`, () => {
    test.beforeEach(({ frameworks, layout }) => {
      test.skip(!frameworks.includes(framework), `no ${framework} app on this target`)
      // The Select docs page comes once every platform has a Select.
      test.skip(layout === "docs", "no Select demo on the docs site yet")
    })

    test("trigger shows the placeholder, with vinui's look and sizes", async ({ page, demo, visit }) => {
      await visit(page)
      const root = demo(page, framework, "Select")
      const fruit = root.getByRole("combobox", { name: "Fruit" })
      await expect(fruit).toHaveText("Pick a fruit")
      await expect(fruit).toHaveAttribute("data-placeholder", "")
      await expect(fruit).toHaveAttribute("aria-expanded", "false")
      await expect(fruit).toHaveClass(/\bselect-trigger\b/)
      await expect(fruit).toHaveCSS("height", "36px")
      await expect(fruit).toHaveCSS("border-top-width", "1px")
      await expect(fruit).toHaveCSS("color", await page.evaluate(() => {
        const probe = document.createElement("div")
        probe.style.color = "var(--color-muted-foreground)"
        document.body.append(probe)
        const c = getComputedStyle(probe).color
        probe.remove()
        return c
      }))
      const size = root.getByRole("combobox", { name: "Size" })
      await expect(size).toHaveAttribute("data-size", "sm")
      await expect(size).toHaveClass(/\bselect-trigger-sm\b/)
      await expect(size).toHaveCSS("height", "32px")
      await expect(size).toHaveText("Medium")
    })

    test("opens a styled listbox with groups, and a disabled option", async ({ page, demo, visit }) => {
      await visit(page)
      const fruit = demo(page, framework, "Select").getByRole("combobox", { name: "Fruit" })
      await fruit.click()
      const listbox = page.getByRole("listbox")
      await expect(listbox).toBeVisible()
      await expect(trigger(page, "Fruit")).toHaveAttribute("aria-expanded", "true")
      const content = page.locator('[data-slot="select-content"]')
      await expect(content).toHaveAttribute("data-state", "open")
      await expect(content).toHaveClass(/\bselect-content\b/)
      await expect(content).toHaveCSS("background-color", await token(page, "--color-popover"))
      await expect(content).toHaveCSS("border-top-width", "1px")
      await expect(content).toHaveCSS("animation-name", "vinui-zoom-in")
      expect(await content.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none")
      await expect(listbox.getByRole("option")).toHaveCount(7)
      await expect(listbox.getByRole("group")).toHaveCount(2)
      await expect(listbox.getByText("Fruits")).toHaveClass(/\bselect-label\b/)
      await expect(page.locator('[data-slot="select-separator"]')).toHaveCSS("height", "1px")
      const grapes = listbox.getByRole("option", { name: "Grapes" })
      await expect(grapes).toHaveAttribute("aria-disabled", "true")
      await expect(grapes).toHaveCSS("opacity", "0.5")
    })

    test("choosing with the pointer sets the value, closes and refocuses the trigger", async ({ page, demo, visit }) => {
      await visit(page)
      const fruit = demo(page, framework, "Select").getByRole("combobox", { name: "Fruit" })
      await fruit.click()
      const banana = page.getByRole("option", { name: "Banana" })
      await banana.hover()
      await expect(banana).toHaveCSS("background-color", await token(page, "--color-accent"))
      await banana.click()
      await expect(page.getByRole("listbox")).toHaveCount(0)
      await expect(fruit).toHaveText("Banana")
      await expect(fruit).not.toHaveAttribute("data-placeholder")
      await expect(fruit).toBeFocused()
      // Reopened, the chosen option is selected and shows the check.
      await fruit.click()
      const selected = page.getByRole("option", { name: "Banana" })
      await expect(selected).toHaveAttribute("aria-selected", "true")
      await expect(selected.locator('[data-slot="select-item-indicator"] svg')).toBeVisible()
      await expect(page.getByRole("option", { name: "Apple" }).locator("svg")).toHaveCount(0)
    })

    test("keyboard: arrows skip the disabled option, typeahead jumps, Enter chooses", async ({ page, demo, visit }) => {
      await visit(page)
      const fruit = demo(page, framework, "Select").getByRole("combobox", { name: "Fruit" })
      await fruit.focus()
      await page.keyboard.press("Enter")
      await expect(page.getByRole("listbox")).toBeVisible()
      const highlighted = page.locator('[data-slot="select-item"][data-highlighted]')
      await expect(highlighted).toHaveText("Apple")
      for (const next of ["Banana", "Blueberry", "Pineapple"]) {
        await page.keyboard.press("ArrowDown")
        await expect(highlighted).toHaveText(next)
      }
      await page.keyboard.press("Enter")
      await expect(fruit).toHaveText("Pineapple")
      // Typeahead on the open list.
      await page.keyboard.press("Enter")
      await expect(page.getByRole("listbox")).toBeVisible()
      await page.keyboard.type("ca")
      await expect(highlighted).toHaveText("Carrot")
      await page.keyboard.press("Enter")
      await expect(fruit).toHaveText("Carrot")
    })

    test("Escape closes without changing the value", async ({ page, demo, visit }) => {
      await visit(page)
      const fruit = demo(page, framework, "Select").getByRole("combobox", { name: "Fruit" })
      await fruit.click()
      await page.getByRole("option", { name: "Leek" }).hover()
      await page.keyboard.press("Escape")
      await expect(page.getByRole("listbox")).toHaveCount(0)
      await expect(fruit).toHaveText("Pick a fruit")
      await expect(fruit).toBeFocused()
    })

    test("controlled popper select: opens below the trigger and updates the state", async ({ page, demo, visit }) => {
      await visit(page)
      const root = demo(page, framework, "Select")
      const size = root.getByRole("combobox", { name: "Size" })
      await expect(root.getByText("Size: m")).toBeVisible()
      const box = (await size.boundingBox())!
      await size.click()
      const content = page.locator('[data-slot="select-content"]')
      await expect(content).toHaveAttribute("data-side", "bottom")
      // Measure after the zoom-in: mid-animation the scaled box starts higher.
      await content.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))
      const list = (await content.boundingBox())!
      expect(list.y).toBeGreaterThanOrEqual(box.y + box.height)
      expect(list.width).toBeGreaterThanOrEqual(box.width - 1)
      await page.getByRole("option", { name: "Large" }).click()
      await expect(size).toHaveText("Large")
      await expect(root.getByText("Size: l")).toBeVisible()
    })

    test("reduced motion: no animation", async ({ browser, baseURL, demo, visit }) => {
      const context = await browser.newContext({ reducedMotion: "reduce", baseURL })
      const page = await context.newPage()
      await visit(page)
      await demo(page, framework, "Select").getByRole("combobox", { name: "Fruit" }).click()
      await expect(page.locator('[data-slot="select-content"]')).toHaveCSS("animation-name", "none")
      await page.keyboard.press("Escape")
      await expect(page.getByRole("listbox")).toHaveCount(0)
      await context.close()
    })
  })
}
