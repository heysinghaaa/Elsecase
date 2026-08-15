import { expect, test } from "@playwright/test"

test("homepage exposes the product proposition", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "Build every else case." }),
  ).toBeVisible()
  await expect(page.getByText("Static foundation specimen")).toBeVisible()
})

test("documentation navigation works", async ({ page }) => {
  await page.goto("/docs")

  const mobileMenu = page.getByText("Documentation menu", { exact: true })
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click()
  }

  await page.getByRole("link", { name: "Getting started" }).first().click()

  await expect(
    page.getByRole("heading", { name: "Getting started" }),
  ).toBeVisible()
})

test("AsyncState simulator restores a shared scenario", async ({ page }) => {
  await page.goto(
    "/docs/components/async-state?state=refreshing&retry=failure&delay=3000&length=long&viewport=mobile",
  )

  await expect(page.getByLabel("Rendered state")).toHaveValue("refreshing")
  await expect(page.getByLabel("Retry result")).toHaveValue("failure")
  await expect(page.getByLabel("Network delay")).toHaveValue("3000")
  await expect(page.getByLabel("Content length")).toHaveValue("long")
  await expect(page.getByLabel("Viewport")).toHaveValue("mobile")
  await expect(page.getByText("Refreshing content")).toBeVisible()
})

test("AsyncState documentation exposes the public install command", async ({
  page,
}) => {
  await page.goto("/docs/components/async-state")

  await expect(
    page.getByText(
      "pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/async-state.json",
    ),
  ).toBeVisible()
})

test("AsyncState documentation has no responsive overflow", async ({
  page,
}) => {
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      "/docs/components/async-state?state=refreshing&length=extreme&viewport=mobile",
    )

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }))

    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
  }
})
