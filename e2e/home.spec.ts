import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the page title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/LifeHackBuddy/i);
  });

  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    // Check hero heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check search bar
    await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();
  });

  test('should navigate to search page when search is submitted', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByRole('textbox', { name: /search/i });
    await searchInput.fill('cooking tips');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/search/);
  });

  test('should display header with navigation links', async ({ page }) => {
    await page.goto('/');

    // Check header is present
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();

    // Check for login link
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/');

    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });

  test('should have Open Graph meta tags', async ({ page }) => {
    await page.goto('/');

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');

    await expect(ogTitle).toHaveAttribute('content', /.+/);
    await expect(ogDescription).toHaveAttribute('content', /.+/);
  });

  test('should have structured data (JSON-LD)', async ({ page }) => {
    await page.goto('/');

    const structuredData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    expect(structuredData).not.toBeNull();
  });

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('should navigate to categories page via navigation', async ({ page }) => {
    await page.goto('/');

    const categoriesLink = page.getByRole('link', { name: /categories/i }).first();
    await categoriesLink.click();

    await expect(page).toHaveURL(/\/categories/);
  });
});
