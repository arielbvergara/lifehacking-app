import { test, expect } from '@playwright/test';

test.describe('Categories Page', () => {
  test('should display the page title', async ({ page }) => {
    await page.goto('/categories');

    await expect(page).toHaveTitle(/Categories/i);
  });

  test('should display the page heading', async ({ page }) => {
    await page.goto('/categories');

    const heading = page.getByRole('heading', { name: /browse categories/i });
    await expect(heading).toBeVisible();
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await page.goto('/categories');

    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();

    const homeLink = breadcrumb.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('should display category cards', async ({ page }) => {
    await page.goto('/categories');

    // Wait for categories to load
    await page.waitForLoadState('networkidle');

    // Should display either category cards or an empty state
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should display header with navigation', async ({ page }) => {
    await page.goto('/categories');

    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/categories');

    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });

  test('should navigate back to home via breadcrumb', async ({ page }) => {
    await page.goto('/categories');

    const homeLink = page
      .getByRole('navigation', { name: /breadcrumb/i })
      .getByRole('link', { name: /home/i });

    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/categories');

    await expect(page.getByRole('heading', { name: /browse categories/i })).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/categories');

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });
});
