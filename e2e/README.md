# E2E Testing Setup

This directory contains end-to-end tests for the LifeHacking application using Playwright.

## Overview

The e2e tests use a hybrid approach optimized for the development workflow:

**Local Development (default):**
- Frontend: `http://localhost:3000` (tests your changes before deployment)
- Backend: `http://localhost:5055` (local API)
- Real Firebase authentication
- Automatically starts local dev server
- **Use this to test your changes before committing**

**CI/CD (deployed environment):**
- Frontend: `https://lifehacking.vercel.app` (deployed test environment)
- Backend: `https://slight-janet-lifehacking-ce47cbe0.koyeb.app` (deployed test API)
- Real Firebase authentication
- No local server setup required
- **Tests run after code is deployed to verify production-like environment**

This approach ensures:
- You test your changes locally before deployment
- CI/CD validates the deployed environment
- No risk of testing against outdated deployed code
- Easy debugging during development

## Configuration

### Environment Variables

Configure test environment via environment variables:

```bash
# Default: Test against localhost (your local changes)
pnpm test:e2e

You can also set these in a `.env.local` file:
```env
# For local development (default)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5055

# For testing deployed environment
# NEXT_PUBLIC_API_BASE_URL=https://slight-janet-lifehacking-ce47cbe0.koyeb.app
```

**Note:** The backend API URL is controlled by `NEXT_PUBLIC_API_BASE_URL`, which is already used throughout the application.

### Development Workflow

1. **Make code changes** to your application
2. **Run e2e tests locally** to verify changes work:
   ```bash
   pnpm test:e2e
   ```
3. **Commit and push** your changes
4. **CI/CD runs tests** against deployed environment after deployment

### Benefits of This Approach

**Local testing (default):**
- Tests your changes immediately
- Fast iteration cycles
- Easy debugging with local servers
- No risk of testing outdated deployed code

**Deployed testing (CI/CD):**
- Validates production-like environment
- Catches deployment-specific issues (CORS, environment variables, etc.)
- No local server setup needed in CI
- Tests the full stack as users experience it

## Architecture

### Mock API Server
- **Location**: `e2e/helpers/mock-api-server.ts`
- **Port**: 8080
- **Lifecycle**: Started before tests via `global-setup.ts`, stopped after via `global-teardown.ts`
- **Routes**: Handles all `/api/Category` and `/api/Tip` endpoints with mock data

### Mock Data
- **Location**: `e2e/fixtures/mock-data.ts`
- **Contents**: Categories, tips, and related test data
- **Usage**: Imported by mock server and can be used in tests for assertions

### Test Files
- `home.spec.ts` - Home page tests
- `categories.spec.ts` - Categories page tests  
- `search.spec.ts` - Search functionality tests
- `tip-detail.spec.ts` - Tip detail page tests
- `login.spec.ts` - Login page and authentication flow tests
- `signup.spec.ts` - Signup page tests
- `forgot-password.spec.ts` - Password reset tests
- `authenticated-routes.spec.ts` - Protected routes and authentication state tests

### Authentication Testing
The e2e tests include comprehensive authentication flow testing using real Firebase credentials:

**Test Credentials Configuration:**
The tests use a dedicated Firebase test user account. Configure credentials via environment variables:
- `E2E_TEST_EMAIL` — test account email
- `E2E_TEST_PASSWORD` — test account password

These are read in `e2e/fixtures/mock-data.ts` and fall back to default values if not set. For CI, configure them as repository secrets.

**Authentication Test Coverage:**
- Successful login with valid credentials
- Failed login with invalid credentials
- Logout functionality
- Authentication state persistence (page refresh, navigation)
- Protected route access control (profile, favorites)
- Redirect to login for unauthenticated users
- Public route access without authentication

**Authentication Helpers:**
The `e2e/helpers/auth-helper.ts` module provides reusable utilities:
- `login(page, email?, password?)` - Log in a user
- `logout(page)` - Log out the current user
- `isLoggedIn(page)` - Check if user is authenticated
- `ensureLoggedIn(page)` - Ensure user is logged in before test
- `ensureLoggedOut(page)` - Ensure user is logged out before test

## Running Tests

```bash
# Run all e2e tests (against localhost by default)
pnpm test:e2e

# Run specific test file
pnpm exec playwright test e2e/home.spec.ts

# Run with UI mode
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm exec playwright test --headed

# Debug specific test
pnpm exec playwright test --debug e2e/home.spec.ts
```

## CI/CD Integration

The e2e tests run in a separate job in the CI pipeline (`.github/workflows/ci.yml`):
- Tests run after deployment to verify production-like environment
- Uses cached Playwright browsers for faster execution
- Uploads test reports as artifacts
- Runs in parallel with or after deployment
- Uses real Firebase authentication with test credentials

## Known Issues & Future Improvements

### Current Limitations
1. **Server-Side Data Fetching**: Next.js Server Components fetch data during build/render time, which can race with mock server startup
2. **Cache Handling**: Next.js caching can interfere with mock data
3. **Error Boundaries**: Pages throw errors when API is unavailable instead of gracefully degrading

### Recommended Improvements
1. **Add retry logic** in data fetching functions
2. **Implement graceful degradation** for failed API calls
3. **Add loading states** to handle slow API responses
4. **Consider MSW (Mock Service Worker)** for more robust mocking
5. **Add visual regression testing** with Playwright screenshots
6. **Expand test coverage** for admin pages and user flows

## Troubleshooting

### Environment Configuration Issues

**Tests failing with connection errors:**
- Verify the test environment is accessible: `curl https://lifehacking.vercel.app`
- Check backend API: `curl https://slight-janet-lifehacking-ce47cbe0.koyeb.app/api/Category`
- Ensure you're not behind a firewall blocking the test environment

### Port Already in Use
If you see `EADDRINUSE` error when testing locally:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5055
lsof -ti:5055 | xargs kill -9
```

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check network connectivity to test environment
- Verify backend is responding: `curl https://slight-janet-lifehacking-ce47cbe0.koyeb.app/api/Category`
- Check for rate limiting (429 errors) in test output

### Rate Limiting (429 Errors)
The backend may rate limit requests. If you see 429 errors:
- Tests automatically retry in CI (configured with `retries: 2`)
- Consider adding delays between test runs
- Use local environment for rapid test iteration

### Authentication Issues
- Verify test credentials are valid (check `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` env vars)
- Check Firebase configuration in deployed environment
- Ensure auth state is properly cleared between tests

## Adding New Tests

1. Create new test file in `e2e/` directory
2. Import test utilities from `@playwright/test`
3. Use mock data from `fixtures/mock-data.ts` for assertions
4. Follow existing test patterns for consistency

Example:
```typescript
import { test, expect } from '@playwright/test';
import { MOCK_TIP_ID } from './fixtures/mock-data';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Next.js Testing](https://nextjs.org/docs/testing)
