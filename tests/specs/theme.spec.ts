import { expect, test } from "./fixtures.ts"

/** The docs' light / dark / system control (the playgrounds keep a simple toggle). */
test.describe("docs theme control", () => {
  test.beforeEach(({ layout }) => {
    test.skip(layout !== "docs", "docs only")
  })

  test("light and dark set the class; system follows the OS live", async ({ page, visit }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await visit(page)
    const html = page.locator("html")
    const theme = page.getByRole("group", { name: "Theme" })
    await expect(theme.getByRole("button", { name: "system" })).toHaveAttribute("aria-pressed", "true")
    await expect(html).not.toHaveClass(/\bdark\b/)

    await theme.getByRole("button", { name: "dark" }).click()
    await expect(html).toHaveClass(/\bdark\b/)
    await expect(theme.getByRole("button", { name: "dark" })).toHaveAttribute("aria-pressed", "true")
    await expect(theme.getByRole("button", { name: "dark" })).not.toHaveClass(/\bbtn-outline\b/)
    await expect(theme.getByRole("button", { name: "system" })).toHaveClass(/\bbtn-outline\b/)

    // An explicit choice ignores the OS.
    await page.emulateMedia({ colorScheme: "light" })
    await expect(html).toHaveClass(/\bdark\b/)

    await theme.getByRole("button", { name: "light" }).click()
    await expect(html).not.toHaveClass(/\bdark\b/)

    await theme.getByRole("button", { name: "system" }).click()
    await page.emulateMedia({ colorScheme: "dark" })
    await expect(html).toHaveClass(/\bdark\b/)
    await page.emulateMedia({ colorScheme: "light" })
    await expect(html).not.toHaveClass(/\bdark\b/)
  })
})
