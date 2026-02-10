import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form with all elements', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page).toHaveTitle(/Login/i);

    // Check form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Check social login buttons
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /guest/i })).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    // Enter invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();

    // Check for validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByRole('button', { name: /sign in/i });

    // Try to submit without filling fields
    await submitButton.click();

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByRole('link', { name: /sign up/i });
    await signupLink.click();

    await expect(page).toHaveURL(/\/signup/);
  });

  test('should navigate to home as guest', async ({ page }) => {
    await page.goto('/login');

    const guestLink = page.getByRole('link', { name: /guest/i });
    await guestLink.click();

    await expect(page).toHaveURL('/');
  });
});
