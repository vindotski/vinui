import type { Page } from "@playwright/test"

import { expect, test } from "./fixtures.ts"

/** Component pages: remembered framework tabs, package-manager switcher, API tables from core. */
const PAGE = "/docs/components/button"

const panels = (page: Page, framework: string) => page.locator(`[data-framework-panel="${framework}"]`)
const installFor = (page: Page, framework: string) =>
  page.locator(`#installation ~ .framework-tabs [data-framework-panel="${framework}"] .install`).first()

async function open(page: Page) {
  await page.goto(PAGE)
  await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0)
}

test.describe("docs component pages", () => {
  test.beforeEach(({ layout }) => {
    test.skip(layout !== "docs", "docs only")
  })

  test("the framework choice applies to every tab group and is remembered", async ({ page }) => {
    await open(page)
    await expect(panels(page, "react").first()).toBeVisible()
    await page.getByRole("tab", { name: "Vue" }).first().click()
    // Every group on the page switches, not just the clicked one.
    for (const panel of await panels(page, "vue").all()) await expect(panel).toBeVisible()
    for (const panel of await panels(page, "react").all()) await expect(panel).toBeHidden()
    for (const tab of await page.getByRole("tab", { name: "Vue" }).all()) await expect(tab).toHaveAttribute("aria-selected", "true")
    // Restored before paint on the next load (set on <html> by the head script).
    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("data-framework", "vue")
    await expect(panels(page, "vue").first()).toBeVisible()
    await expect(page.getByRole("tab", { name: "Vue" }).first()).toHaveAttribute("aria-selected", "true")
  })

  test("arrow keys move between framework tabs", async ({ page }) => {
    await open(page)
    await page.getByRole("tab", { name: "React", exact: true }).first().focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.locator("html")).toHaveAttribute("data-framework", "vue")
    await expect(page.getByRole("tab", { name: "Vue" }).first()).toBeFocused()
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await expect(page.locator("html")).toHaveAttribute("data-framework", "native")
  })

  test("install commands follow the package manager and each framework's CLI", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await open(page)
    await expect(installFor(page, "react")).toContainText("npx shadcn@latest add @vinui/button")
    await installFor(page, "react").getByRole("button", { name: "pnpm" }).click()
    await expect(installFor(page, "react")).toContainText("pnpm dlx shadcn@latest add @vinui/button")
    await page.getByRole("tab", { name: "Vue" }).first().click()
    await expect(installFor(page, "vue")).toContainText("pnpm dlx shadcn-vue@latest add @vinui/button")
    await page.getByRole("tab", { name: "React Native" }).first().click()
    await expect(installFor(page, "native")).toContainText("pnpm dlx shadcn@latest add @vinui/button")
    // Copy copies exactly the visible command.
    await installFor(page, "native").getByRole("button", { name: "Copy" }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pnpm dlx shadcn@latest add @vinui/button")
    await page.reload()
    await expect(installFor(page, "native")).toContainText("pnpm dlx shadcn@latest add @vinui/button")
  })

  test("API tables use each framework's prop names and badges", async ({ page }) => {
    await open(page)
    const api = (framework: string) =>
      page.locator(`#api-reference ~ .framework-tabs [data-framework-panel="${framework}"] .props-table`).first()
    await expect(api("react")).toContainText("className")
    await expect(api("react")).toContainText('"icon-lg"')
    await expect(api("react")).not.toContainText("vinui addition")
    await page.getByRole("tab", { name: "Vue" }).first().click()
    await expect(api("vue").locator("td code").filter({ hasText: /^class$/ })).toHaveCount(1)
    await page.getByRole("tab", { name: "React Native" }).first().click()
    await expect(api("native").locator("tr", { hasText: "asChild" })).toContainText("vinui addition")
  })

  test("the dialog page documents each part under each framework", async ({ page }) => {
    await page.goto("/docs/components/dialog")
    await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0)
    await expect(installFor(page, "react")).toContainText("npx shadcn@latest add @vinui/dialog")
    const api = (framework: string) => page.locator(`#api-reference ~ .framework-tabs [data-framework-panel="${framework}"]`).first()
    // DialogContent and DialogFooter tables; portalHost exists on native only.
    await expect(api("react").locator(".props-table")).toHaveCount(2)
    await expect(api("react")).toContainText("showCloseButton")
    await expect(api("react")).not.toContainText("portalHost")
    await page.getByRole("tab", { name: "React Native" }).first().click()
    await expect(api("native").locator("tr", { hasText: "portalHost" })).toContainText("React Native only")
    await expect(page.locator('[data-framework-panel="native"] figure img').first()).toBeVisible()
    // The live demo opens from the preview.
    await page.getByRole("tab", { name: "React", exact: true }).first().click()
    await page.getByRole("button", { name: "Open dialog" }).click()
    await expect(page.getByRole("dialog", { name: "Delete project?" })).toBeVisible()
  })

  test("install pages give every command per package manager", async ({ page }) => {
    await page.goto("/docs/installation/react")
    await page.getByRole("button", { name: "pnpm" }).first().click()
    const visible = (text: string) => page.locator(".install pre:visible", { hasText: text })
    await expect(visible("pnpm create vite my-app --template react-ts")).toHaveCount(1)
    await expect(visible("pnpm add -D @types/node")).toHaveCount(1)
    await expect(visible("pnpm dlx shadcn@latest init")).toHaveCount(1)
    // The choice carries over to the React Native page.
    await page.goto("/docs/installation/react-native")
    await expect(visible("pnpm create expo-app my-app --template blank-typescript")).toHaveCount(1)
    await expect(visible("pnpm expo install react-native-reanimated")).toHaveCount(1)
    await expect(visible("pnpm add -E uniwind@1.13.0 tailwindcss@4.3.3")).toHaveCount(1)
    await expect(visible("/r/native/init.json")).toHaveCount(1)
    await page.getByRole("button", { name: "npm" }).first().click()
    await expect(visible("npm install -E uniwind@1.13.0 tailwindcss@4.3.3")).toHaveCount(1)
  })

  test("works when storage is blocked", async ({ page }, testInfo) => {
    // Astro's dev toolbar reads localStorage unguarded and throws; it doesn't exist in production.
    test.skip(testInfo.project.name.endsWith("-dev"), "Astro's dev toolbar needs storage")
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError")
        },
      })
    })
    await open(page)
    await page.getByRole("tab", { name: "React Native" }).first().click()
    await expect(panels(page, "native").first()).toBeVisible()
    await expect(page.locator('[data-framework-panel="native"] figure img').first()).toBeVisible()
  })
})
