import { Page } from '@playwright/test';
import { E2E_TEST_EMAIL, E2E_TEST_PASSWORD } from '../fixtures/mock-data';

/**
 * Authentication helper functions for e2e tests
 * Provides reusable utilities for login, logout, and auth state checks
 */

/**
 * Logs in a user with the provided credentials
 * @param page - Playwright page object
 * @param email - User email (defaults to E2E test email)
 * @param password - User password (defaults to E2E test password)
 */
export async function login(
  page: Page,
  email: string = E2E_TEST_EMAIL,
  password: string = E2E_TEST_PASSWORD
): Promise<void> {
  await page.goto('/login');

  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/password/i);
  const submitButton = page.getByRole('button', { name: /log in/i });

  // Wait for form to be ready
  await emailInput.waitFor({ state: 'visible' });
  await passwordInput.waitFor({ state: 'visible' });
  await submitButton.waitFor({ state: 'visible' });

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();

  // Wait for either successful navigation or login error
  const loginErrorSelector = 'form [role="alert"]';
  const navigationPromise = page.waitForURL('/', { timeout: 15000 })
    .then(() => 'navigated' as const)
    .catch(() => 'nav-timeout' as const);
  const errorPromise = page.waitForSelector(loginErrorSelector, { timeout: 15000 })
    .then(() => 'error' as const)
    .catch(() => 'err-timeout' as const);

  const result = await Promise.race([navigationPromise, errorPromise]);

  if (result === 'error') {
    const errorText = await page.locator(loginErrorSelector).textContent();
    throw new Error(`Login failed: ${errorText}`);
  }

  if (result !== 'navigated') {
    throw new Error('Login timed out: did not navigate to home page');
  }
}

/**
 * Logs out the current user
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  // The Sign Out button is in a dropdown menu, need to open it first
  // Look for the user menu button (UserAvatar)
  const userMenuButton = page.getByRole('button', { name: /user menu/i });
  
  if ((await userMenuButton.count()) > 0) {
    // Click user menu to open dropdown
    await userMenuButton.click();
    
    // Wait for dropdown to open and click Sign Out
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    await signOutButton.waitFor({ state: 'visible', timeout: 5000 });
    await signOutButton.click();
  } else {
    // Fallback: try to find Sign Out button directly (mobile menu might be open)
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    if ((await signOutButton.count()) > 0) {
      await signOutButton.click();
    }
  }

  // Navigate to home page after sign-out to ensure isLoggedIn() can detect the Login link
  await page.goto('/');
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Checks if the user is currently logged in
 * @param page - Playwright page object
 * @returns true if user is logged in, false otherwise
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Wait a moment for UI to update
  await page.waitForTimeout(500);
  
  // Check for "Login" link (appears when logged out)
  const loginLink = page.getByRole('link', { name: /^login$/i });
  const hasLoginLink = (await loginLink.count()) > 0;

  // User is logged in if Login link doesn't exist
  return !hasLoginLink;
}

/**
 * Ensures the user is logged in before running tests
 * If not logged in, performs login
 * @param page - Playwright page object
 */
export async function ensureLoggedIn(page: Page): Promise<void> {
  await page.goto('/');
  
  const loggedIn = await isLoggedIn(page);
  
  if (!loggedIn) {
    await login(page);
  }
}

/**
 * Ensures the user is logged out before running tests
 * If logged in, performs logout
 * @param page - Playwright page object
 */
export async function ensureLoggedOut(page: Page): Promise<void> {
  await page.goto('/');
  
  const loggedIn = await isLoggedIn(page);
  
  if (loggedIn) {
    await logout(page);
  }
}
