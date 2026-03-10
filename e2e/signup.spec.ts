import { test, expect } from '@playwright/test';

test.describe('Signup Page', () => {
  // Retry this test if it fails due to intermittent issues (rate limiting, timing)
  test.describe.configure({ retries: 2 });

  test('should display signup form with all elements', async ({ page }) => {
    await page.goto('/signup');

    // Check page title (uses default site title)
    await expect(page).toHaveTitle(/LifeHacking/i);

    // Check form elements are present
    await expect(page.getByLabel(/display name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();

    // Check social login buttons
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();

    // Check navigation links (Sign In link on signup page)
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const submitButton = page.getByRole('button', { name: /sign up/i });

    // Enter invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('Password123!');
    await submitButton.click();

    // HTML5 validation should prevent submission
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const submitButton = page.getByRole('button', { name: /sign up/i });

    await emailInput.fill('test@example.com');
    await passwordInput.fill('short');
    await submitButton.click();

    // Firebase will reject password < 6 characters
    // Check we're still on signup page or see error message
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/signup');

    const submitButton = page.getByRole('button', { name: /sign up/i });

    // Try to submit without filling fields
    await submitButton.click();

    // HTML5 validation should prevent submission
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/signup');

    const loginLink = page.getByRole('link', { name: /sign in/i }).first();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });
});
