# CI/CD Setup Guide

## GitHub Actions Configuration

This project uses GitHub Actions for continuous integration. The pipeline runs on every pull request and push to `main`, `master`, or `develop` branches.

## Required GitHub Secrets

To run the CI pipeline successfully, you need to configure the following secrets in your GitHub repository:

### Navigation
Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abc123` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (optional) | `http://localhost:8080` |

### How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project settings
4. Scroll down to "Your apps" section
5. Select your web app or create a new one
6. Copy the configuration values from the `firebaseConfig` object

### Setting Up Secrets

For each secret listed above:

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Enter the secret name exactly as shown above
5. Paste the corresponding value
6. Click **Add secret**

## CI Pipeline Stages

The pipeline performs the following checks:

1. **Type Checking** - Validates TypeScript types
2. **Linting** - Checks code style and potential errors
3. **Unit Tests** - Runs all Vitest unit tests
4. **E2E Tests** - Runs Playwright end-to-end tests
5. **Build** - Ensures production build succeeds

All stages must pass for the PR to be mergeable.

## Local Testing

To test the same checks locally before pushing:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Unit tests
pnpm test:run

# E2E tests (requires dev server)
pnpm test:e2e

# Production build
pnpm build
```

## Troubleshooting

### E2E Tests Failing with Firebase Errors

If you see `auth/invalid-api-key` errors, ensure all Firebase secrets are properly configured in GitHub.

### Build Failing

Check that all environment variables are set correctly and match your Firebase project configuration.

### Tests Timing Out

The pipeline has a 15-minute timeout. If tests consistently timeout, consider optimizing test execution or increasing the timeout in `.github/workflows/ci.yml`.
