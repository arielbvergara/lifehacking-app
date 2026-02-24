# Lighthouse CI Setup Guide

This guide explains how to use Lighthouse CI for performance auditing in the Lifehacking App.

## Table of Contents

- [Overview](#overview)
- [Local Setup](#local-setup)
- [Running Audits Locally](#running-audits-locally)
- [CI/CD Integration](#cicd-integration)
- [Authentication](#authentication)
- [Configuration Files](#configuration-files)
- [Performance Budgets](#performance-budgets)
- [Troubleshooting](#troubleshooting)

---

## Overview

Lighthouse CI is integrated into this project to:

- **Track performance over time** - Monitor Core Web Vitals and other metrics
- **Catch regressions early** - Fail PRs that degrade performance
- **Ensure accessibility** - Maintain high accessibility scores
- **Optimize SEO** - Keep SEO best practices in check

### Audit Strategies

| Strategy | When | Pages Audited | Duration |
|----------|------|---------------|----------|
| **Local Quick** | Development | 7 key pages | ~3-5 min |
| **Local Full** | Pre-release | 13 pages | ~8-12 min |
| **CI PR Check** | Every PR | 6 key pages | ~5-7 min |
| **CI Scheduled** | Nightly | 13 pages | ~10-15 min |

---

## Local Setup

### 1. Install Dependencies

```bash
pnpm install
```

This installs:
- `@lhci/cli` - Lighthouse CI command-line tool
- `lighthouse` - Core Lighthouse library
- `puppeteer` - For authentication automation

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your test credentials:

```bash
# Lighthouse CI Configuration
LHCI_TEST_EMAIL=test@example.com
LHCI_TEST_PASSWORD=your_test_password_here
LHCI_BASE_URL=http://localhost:3000
```

**Important:** Use a dedicated test account, not your personal account.

---

## Running Audits Locally

### Quick Audit (Recommended for Development)

Audits 7 key pages with 3 runs each:

```bash
pnpm lighthouse:local
```

**Pages audited:**
- Home (`/`)
- Login (`/login`)
- Profile (`/profile`)
- Favorites (`/favorites`)
- Popular Tips (`/tips/popular`)
- Search (`/search`)
- Contact (`/contact`)

**Duration:** ~3-5 minutes

### Full Audit (Comprehensive Testing)

Audits 13 pages with 5 runs each:

```bash
pnpm lighthouse:full
```

**Additional pages:**
- About (`/about`)
- Signup (`/signup`)
- Latest Tips (`/tips/latest`)
- Categories (`/categories`)
- Privacy (`/privacy`)
- Terms (`/terms`)

**Duration:** ~8-12 minutes

### What Happens During an Audit

1. **Build** - Application is built for production
2. **Start Server** - Production server starts on port 3000
3. **Authenticate** - Script logs in and stores JWT token
4. **Audit** - Lighthouse runs multiple times per page
5. **Report** - Results are saved to `.lighthouseci/` directory
6. **Assert** - Checks if metrics meet thresholds

### Viewing Results

After running an audit:

1. **Console Output** - Summary scores displayed in terminal
2. **HTML Reports** - Open `.lighthouseci/*.report.html` in browser
3. **JSON Data** - Raw data in `.lighthouseci/*.report.json`

---

## CI/CD Integration

### Pull Request Checks

**Workflow:** `.github/workflows/lighthouse-ci.yml`

**Triggers:**
- Every pull request to any branch

**What it does:**
1. Builds the application
2. Starts production server
3. Authenticates with test credentials
4. Runs Lighthouse on 6 key pages
5. Enforces performance budgets
6. Posts results as PR comment
7. Fails PR if thresholds not met

**Required GitHub Secrets:**
- `LHCI_TEST_EMAIL` - Test user email
- `LHCI_TEST_PASSWORD` - Test user password
- `LHCI_GITHUB_APP_TOKEN` - (Optional) For enhanced features

### Scheduled Audits

**Workflow:** `.github/workflows/lighthouse-scheduled.yml`

**Triggers:**
- Every night at 2 AM UTC
- Manual trigger via GitHub Actions UI

**What it does:**
1. Runs comprehensive audit of all pages
2. Stores results as artifacts (90-day retention)
3. Creates GitHub issue if audit fails
4. Provides historical performance data

### Setting Up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `LHCI_TEST_EMAIL` | Your test user email |
| `LHCI_TEST_PASSWORD` | Your test user password |
| `LHCI_GITHUB_APP_TOKEN` | (Optional) GitHub token for Lighthouse CI |

---

## Authentication

### How It Works

The authentication script (`scripts/lighthouse-auth.js`) uses Puppeteer to:

1. Navigate to `/login` page
2. Fill in email and password fields
3. Submit the login form
4. Wait for navigation to complete
5. Extract cookies and localStorage
6. Save auth data to `.lighthouse-auth.json`

### Auth Data Storage

The `.lighthouse-auth.json` file contains:

```json
{
  "cookies": [
    { "name": "session", "value": "...", ... }
  ],
  "localStorage": {
    "authToken": "...",
    "userId": "..."
  },
  "timestamp": "2024-02-24T10:30:00.000Z"
}
```

This file is:
- **Gitignored** - Never committed to version control
- **Temporary** - Regenerated before each audit
- **Local only** - Not shared between environments

### Customizing Authentication

If your login flow is different, modify `scripts/lighthouse-auth.js`:

```javascript
// Example: Different form selectors
await page.type('input[id="email"]', TEST_EMAIL);
await page.type('input[id="password"]', TEST_PASSWORD);

// Example: Wait for specific element after login
await page.waitForSelector('.user-profile');

// Example: Handle multi-step login
await page.click('button[type="submit"]');
await page.waitForNavigation();
await page.type('input[name="otp"]', OTP_CODE);
await page.click('button[type="submit"]');
```

---

## Configuration Files

### `.lighthouserc.js` (Local Quick)

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run start',
      url: [/* 7 key pages */],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

### `.lighthouserc.full.js` (Local Full)

- 13 pages instead of 7
- 5 runs per page instead of 3
- Same thresholds as quick config

### `.lighthouserc.ci.js` (CI/CD)

```javascript
module.exports = {
  ci: {
    collect: {
      // No startServerCommand - server already running in CI
      url: [/* 6 key pages */],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Stricter thresholds for CI
        'categories:performance': ['error', { minScore: 0.75 }],
        
        // Performance budgets
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
      },
    },
  },
};
```

---

## Performance Budgets

### Category Scores

| Category | Local Threshold | CI Threshold | Level |
|----------|----------------|--------------|-------|
| Performance | ≥ 80 | ≥ 75 | Warn/Error |
| Accessibility | ≥ 90 | ≥ 90 | Error |
| Best Practices | ≥ 85 | ≥ 85 | Warn/Error |
| SEO | ≥ 90 | ≥ 85 | Warn |

### Core Web Vitals

| Metric | Budget | Level |
|--------|--------|-------|
| First Contentful Paint (FCP) | ≤ 2000ms | Warning |
| Largest Contentful Paint (LCP) | ≤ 2500ms | Warning |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | Warning |
| Total Blocking Time (TBT) | ≤ 300ms | Warning |
| Speed Index | ≤ 3000ms | Warning |

### Adjusting Budgets

To modify thresholds, edit the `assert.assertions` section in the config files:

```javascript
assertions: {
  // Make performance stricter
  'categories:performance': ['error', { minScore: 0.85 }],
  
  // Relax LCP budget
  'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
  
  // Add new metric
  'interactive': ['warn', { maxNumericValue: 3500 }],
}
```

---

## Troubleshooting

### Authentication Fails

**Symptom:** Script can't log in, or authenticated pages show login screen

**Solutions:**
1. Verify credentials in `.env.local`
2. Check if login form selectors changed
3. Ensure test user exists in Firebase
4. Check if CAPTCHA or rate limiting is blocking login

**Debug:**
```bash
# Run auth script manually
node scripts/lighthouse-auth.js

# Check auth data
cat .lighthouse-auth.json
```

### Server Won't Start

**Symptom:** "Server failed to start" or timeout errors

**Solutions:**
1. Check if port 3000 is already in use
2. Verify build completes successfully
3. Increase `startServerReadyTimeout` in config
4. Check environment variables are set

**Debug:**
```bash
# Test build and start manually
pnpm build
pnpm start

# Check port availability
lsof -i :3000
```

### Low Performance Scores

**Symptom:** Scores lower than expected or failing budgets

**Solutions:**
1. Run multiple times - scores can vary
2. Close other applications to free resources
3. Use production build, not development
4. Check network throttling settings
5. Review Lighthouse recommendations in HTML report

**Debug:**
```bash
# Run with verbose logging
LHCI_LOG_LEVEL=debug pnpm lighthouse:local

# Check individual page reports
open .lighthouseci/*.report.html
```

### CI Workflow Fails

**Symptom:** GitHub Actions workflow fails

**Solutions:**
1. Verify GitHub Secrets are set correctly
2. Check workflow logs for specific errors
3. Ensure Firebase credentials are valid
4. Test locally first with same config

**Debug:**
1. Go to **Actions** tab in GitHub
2. Click on failed workflow run
3. Expand failed step to see logs
4. Download artifacts to inspect reports

### Pages Not Audited

**Symptom:** Some pages missing from results

**Solutions:**
1. Check URL list in config file
2. Verify pages exist and are accessible
3. Check if authentication is required
4. Look for navigation errors in logs

**Debug:**
```bash
# Test page accessibility
curl -I http://localhost:3000/profile

# Check auth cookies
cat .lighthouse-auth.json | jq '.cookies'
```

---

## Best Practices

### Local Development

1. **Run quick audits frequently** - Catch issues early
2. **Run full audits before PRs** - Comprehensive check
3. **Compare before/after** - Measure impact of changes
4. **Focus on trends** - Don't obsess over small variations

### CI/CD

1. **Set realistic budgets** - Too strict = constant failures
2. **Monitor scheduled audits** - Track long-term trends
3. **Review failed PRs** - Understand why performance degraded
4. **Update budgets gradually** - As you improve performance

### Performance Optimization

1. **Use Lighthouse recommendations** - Follow audit suggestions
2. **Optimize images** - Use Next.js Image component
3. **Minimize JavaScript** - Code split and lazy load
4. **Leverage caching** - Use Next.js caching features
5. **Monitor Core Web Vitals** - Focus on user experience

---

## Additional Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
