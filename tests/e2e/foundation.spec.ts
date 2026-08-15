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
