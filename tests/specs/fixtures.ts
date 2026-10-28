import { test as base, expect, type Locator, type Page } from "@playwright/test"

export type Framework = "react" | "vue"

export interface TargetOptions {
  /** "docs": side-by-side panels per framework; "playground": one app in <main>. */
  layout: "docs" | "playground"
  frameworks: Framework[]
}

interface Fixtures {
  /** Opens `/` and waits until it is interactive (Astro islands hydrated). */
  visit: (page: Page) => Promise<void>
  /** Container holding one framework's demo of `section` on the current target. */
  demo: (page: Page, framework: Framework, section: string) => Locator
  /** Fails the test if the page logs errors or throws. */
  pageErrors: string[]
}

export const test = base.extend<TargetOptions & Fixtures>({
  layout: ["playground", { option: true }],
  frameworks: [["react"], { option: true }],
  visit: async ({ layout }, use) => {
    await use(async (page) => {
      await page.goto("/")
      if (layout === "docs") {
        // Astro removes the `ssr` attribute once an island has hydrated.
        await page.waitForFunction(() => document.querySelectorAll("astro-island[ssr]").length === 0)
      }
    })
  },
  demo: async ({ layout }, use) => {
    await use((page, framework, section) =>
      layout === "docs"
        ? page.locator(`section:has(h2:text-is("${section}")) [data-framework="${framework}"]`)
        : page.locator("main"),
    )
  },
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on("pageerror", (e) => errors.push(e.message))
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
      await use(errors)
      expect(errors, "page logged errors").toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
