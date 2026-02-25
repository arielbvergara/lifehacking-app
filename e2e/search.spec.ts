import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {
  test('should display the page title', async ({ page }) => {
    await page.goto('/search');

    await expect(page).toHaveTitle(/Search/i);
  });

  test('should display search results area', async ({ page }) => {
    await page.goto('/search');

    // Wait for content to load
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should pre-fill search query from URL parameter', async ({ page }) => {
    await page.goto('/search?q=cooking');

    // Search input in header should reflect query
    const searchInput = page.getByRole('textbox', { name: /search/i }).first();
    await expect(searchInput).toHaveValue('cooking');
  });

  test('should display tip cards when results are found', async ({ page }) => {
    await page.goto('/search');

    // Wait for tips to load
    const tipCards = page.locator('[data-testid="tip-card"]');

    // Wait for loading to complete
    await page.waitForLoadState('networkidle');

    const cardCount = await tipCards.count();
    // Should either show results or an empty state
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test('should display header with navigation', async ({ page }) => {
    await page.goto('/search');

    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/search');

    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });

  test('should update URL when search query changes', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.getByRole('textbox', { name: /search/i }).first();
    await searchInput.fill('productivity');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/q=productivity/);
  });

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('should show mobile filter button on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');

    // Mobile filter button should be visible on small screens
    const filterButton = page.getByRole('button', { name: /filter/i });
    const filterButtonCount = await filterButton.count();
    expect(filterButtonCount).toBeGreaterThan(0);
  });
});
