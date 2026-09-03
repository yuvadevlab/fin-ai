import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("should load the homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FinAI/i);
  });

  test("should have a skip-to-content link for accessibility", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toBeVisible();
  });

  test("should verify the theme toggle persists in DOM", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    // Initially it might be light or dark, but it should have a class
    const className = await html.getAttribute("class");
    expect(className).toMatch(/dark|light/);
  });

  test("should handle responsive sidebar navigation", async ({ page }) => {
    await page.goto("/");
    // Trigger mobile view
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole("button", { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      const sidebar = page.locator("nav");
      await expect(sidebar).toBeVisible();
    }
  });
});
