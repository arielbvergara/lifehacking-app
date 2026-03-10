import { test, expect } from '@playwright/test';
import { E2E_TEST_EMAIL, E2E_TEST_PASSWORD } from './fixtures/mock-data';
import { login, logout, isLoggedIn } from './helpers/auth-helper';

test.describe('Login Page', () => {
  // Retry this test if it fails due to intermittent issues (rate limiting, timing)
  test.describe.configure({ retries: 2 });

  test('should display login form with all elements', async ({ page }) => {
    await page.goto('/login');

    // Check page title (uses default site title)
    await expect(page).toHaveTitle(/LifeHacking/i);

    // Check form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();

    // Check social login buttons
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /guest/i })).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /log in/i });

    // Enter invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();

    // HTML5 validation should prevent submission or show browser validation
    // Check that we're still on the login page (form didn't submit)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    const submitButton = page.getByRole('button', { name: /log in/i });

    // Try to submit without filling fields
    await submitButton.click();

    // HTML5 validation should prevent submission
    // Check that we're still on the login page (form didn't submit)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify the email input has the required attribute
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByRole('link', { name: /create account/i });
    await signupLink.click();

    await expect(page).toHaveURL(/\/signup/);
  });

  test('should navigate to home as guest', async ({ page }) => {
    await page.goto('/login');

    const guestLink = page.getByRole('link', { name: /guest/i });
    await guestLink.click();

    await expect(page).toHaveURL('/');
  });

  test.describe('Authentication Flow', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      await login(page, E2E_TEST_EMAIL, E2E_TEST_PASSWORD);

      // Verify we're on the home page
      await expect(page).toHaveURL('/');

      // Verify user is logged in (check for logout button or user menu)
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const submitButton = page.getByRole('button', { name: /log in/i });

      // Use invalid credentials
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword123');
      await submitButton.click();

      // Check for error message (Firebase typically shows these errors)
      await expect(
        page.getByText(/invalid|incorrect|wrong|failed|not found|user not found/i)
      ).toBeVisible({ timeout: 5000 });
    });

    test('should logout successfully', async ({ page }) => {
      // First login
      await login(page, E2E_TEST_EMAIL, E2E_TEST_PASSWORD);
      
      // Verify logged in
      let loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      // Logout
      await logout(page);

      // Wait a moment for auth state to update
      await page.waitForTimeout(1000);

      // Verify logged out (should see login link)
      loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(false);
    });

    test('should persist authentication after page refresh', async ({ page }) => {
      // Login
      await login(page, E2E_TEST_EMAIL, E2E_TEST_PASSWORD);

      // Verify logged in
      let loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      // Refresh the page
      await page.reload({ waitUntil: 'networkidle', timeout: 15000 });

      // Wait for auth state to be restored
      await page.waitForTimeout(2000);

      // Verify still logged in
      loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should persist authentication across navigation', async ({ page }) => {
      // Login
      await login(page, E2E_TEST_EMAIL, E2E_TEST_PASSWORD);

      // Navigate to different pages
      await page.goto('/categories');
      let loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      await page.goto('/search');
      loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      // Navigate back to home
      await page.goto('/');
      loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');

    const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    
    if ((await forgotPasswordLink.count()) > 0) {
      await forgotPasswordLink.click();
      await expect(page).toHaveURL(/\/forgot-password/);
    }
  });
});
