import { test, expect } from '@playwright/test';

test.describe('Signup Page', () => {
  test('should display signup form with all elements', async ({ page }) => {
    await page.goto('/signup');

    // Check page title
    await expect(page).toHaveTitle(/Sign Up/i);

    // Check form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();

    // Check social login buttons
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /guest/i })).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    const submitButton = page.getByRole('button', { name: /sign up/i });

    // Enter invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('Password123!');
    await confirmPasswordInput.fill('Password123!');
    await submitButton.click();

    // Check for validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should show validation error when passwords do not match', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    const submitButton = page.getByRole('button', { name: /sign up/i });

    await emailInput.fill('test@example.com');
    await passwordInput.fill('Password123!');
    await confirmPasswordInput.fill('DifferentPassword123!');
    await submitButton.click();

    // Check for validation error
    await expect(page.getByText(/passwords must match/i)).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/signup');

    const submitButton = page.getByRole('button', { name: /sign up/i });

    // Try to submit without filling fields
    await submitButton.click();

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/signup');

    const loginLink = page.getByRole('link', { name: /sign in/i });
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to home as guest', async ({ page }) => {
    await page.goto('/signup');

    const guestLink = page.getByRole('link', { name: /guest/i });
    await guestLink.click();

    await expect(page).toHaveURL('/');
  });
});
