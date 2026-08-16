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

test("ResponsiveDataExplorer restores search, filters, sorting, and page from the URL", async ({
  page,
}) => {
  await page.goto(
    "/docs/components/data-explorer?workspace=alpha&q=grace&filter.role=Member&sort=name.desc&page=1&size=5",
  )

  await expect(page.getByLabel("Search users")).toHaveValue("grace")
  await expect(page.getByLabel("Role")).toHaveValue("Member")
  const explorer = page.locator('[data-slot="responsive-data-explorer"]')
  const desktopTable = explorer.getByRole("table")
  if (await desktopTable.isVisible()) {
    await expect(
      desktopTable.getByRole("columnheader", { name: /User/ }),
    ).toHaveAttribute("aria-sort", "descending")
    await expect(desktopTable.getByText("Grace Hopper")).toBeVisible()
  } else {
    await expect(
      explorer.getByRole("article", { name: "Grace Hopper" }),
    ).toBeVisible()
  }
  await expect(page).toHaveURL(/workspace=alpha/)
})

test("ResponsiveDataExplorer supports selection and bulk actions", async ({
  page,
}) => {
  await page.goto("/docs/components/data-explorer")

  await expect(page.getByRole("button", { name: "Mark active" })).toHaveCount(0)
  await page
    .locator('[data-slot="responsive-data-explorer"]')
    .locator('input[aria-label="Select row user-1"]:visible')
    .click()
  await expect(page.getByText("1 row selected")).toBeVisible()
  await expect(page.getByRole("button", { name: "Mark active" })).toBeVisible()
})

test("ResponsiveDataExplorer exposes its public install command", async ({
  page,
}) => {
  await page.goto("/docs/components/data-explorer")

  await expect(
    page.getByText(
      "pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/data-explorer.json",
    ),
  ).toBeVisible()
})

test("ResponsiveDataExplorer switches from table to cards without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto("/docs/components/data-explorer")
  const explorer = page.locator('[data-slot="responsive-data-explorer"]')
  await expect(explorer.getByRole("table")).toBeVisible()

  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/docs/components/data-explorer?records=25")
    if (width < 768) {
      await expect(
        page.getByRole("article", { name: "Ada Lovelace" }),
      ).toBeVisible()
    } else {
      await expect(
        page
          .locator('[data-slot="responsive-data-explorer"]')
          .getByRole("table"),
      ).toBeVisible()
    }

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }))
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
  }
})
