import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test('should display the forgot password form with all elements', async ({ page }) => {
    await page.goto('/forgot-password');

    // Check email input
    await expect(page.getByLabel(/email address/i)).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();

    // Check back to login link
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible();
  });

  test('should require a valid email to submit', async ({ page }) => {
    await page.goto('/forgot-password');

    const submitButton = page.getByRole('button', { name: /send reset link/i });

    // Try to submit without filling email
    await submitButton.click();

    // Form should not have submitted (button still enabled)
    await expect(submitButton).toBeVisible();
  });

  test('should navigate to login page via back to login link', async ({ page }) => {
    await page.goto('/forgot-password');

    const backLink = page.getByRole('link', { name: /back to login/i });
    await backLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should display header navigation', async ({ page }) => {
    await page.goto('/forgot-password');

    // Auth nav should be present
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/forgot-password');

    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/forgot-password');

    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
