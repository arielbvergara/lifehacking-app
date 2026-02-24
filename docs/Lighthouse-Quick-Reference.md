# Lighthouse CI Quick Reference

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure credentials
cp .env.example .env.local
# Edit .env.local and add:
# LHCI_TEST_EMAIL=test@example.com
# LHCI_TEST_PASSWORD=your_password
# LHCI_BASE_URL=http://localhost:3000

# 3. Run your first audit
pnpm lighthouse:local
```

---

## 📋 Commands

| Command | Purpose | Duration | Pages |
|---------|---------|----------|-------|
| `pnpm lighthouse:local` | Quick local audit | 3-5 min | 7 |
| `pnpm lighthouse:full` | Comprehensive audit | 8-12 min | 13 |
| `pnpm lighthouse:ci` | CI pipeline audit | 5-7 min | 6 |

---

## 📊 Performance Budgets

### Category Scores (CI)

| Category | Threshold | Level |
|----------|-----------|-------|
| Performance | ≥ 75 | Error |
| Accessibility | ≥ 90 | Error |
| Best Practices | ≥ 85 | Error |
| SEO | ≥ 85 | Warning |

### Core Web Vitals (CI)

| Metric | Budget |
|--------|--------|
| FCP | ≤ 2000ms |
| LCP | ≤ 2500ms |
| CLS | ≤ 0.1 |
| TBT | ≤ 300ms |
| Speed Index | ≤ 3000ms |

---

## 🔧 Troubleshooting

### Authentication Fails

```bash
# Test auth script manually
node scripts/lighthouse-auth.js

# Check auth data
cat .lighthouse-auth.json
```

### Server Won't Start

```bash
# Test build and start
pnpm build
pnpm start

# Check port
lsof -i :3000
```

### Low Scores

```bash
# Run with debug logging
LHCI_LOG_LEVEL=debug pnpm lighthouse:local

# View detailed reports
open .lighthouseci/*.report.html
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.lighthouserc.js` | Local quick config |
| `.lighthouserc.full.js` | Full audit config |
| `.lighthouserc.ci.js` | CI config |
| `scripts/lighthouse-auth.js` | Auth handler |
| `.lighthouse-auth.json` | Auth data (gitignored) |
| `.lighthouseci/` | Reports directory (gitignored) |

---

## 🔐 GitHub Secrets

Required for CI/CD:

- `LHCI_TEST_EMAIL` - Test user email
- `LHCI_TEST_PASSWORD` - Test user password
- `LHCI_GITHUB_APP_TOKEN` - (Optional) Enhanced features

**Add at:** Settings → Secrets and variables → Actions

---

## 🤖 CI/CD Workflows

### PR Checks
- **File:** `.github/workflows/lighthouse-ci.yml`
- **Trigger:** Every PR
- **Duration:** ~5-7 min
- **Action:** Posts results as PR comment

### Scheduled Audits
- **File:** `.github/workflows/lighthouse-scheduled.yml`
- **Trigger:** Nightly at 2 AM UTC
- **Duration:** ~10-15 min
- **Action:** Creates issue on failure

---

## 📖 Full Documentation

See `docs/Lighthouse-Setup-Guide.md` for complete details.
