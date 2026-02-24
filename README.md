# Lifehacking App — Frontend

> A modern web application for discovering and managing practical daily-life tips, built with a focus on performance, observability, and developer experience.

---

## 🏗️ Architecture Overview

This repository contains the **frontend** of the Lifehacking platform, a full-stack product composed of two separate repositories:

| Layer | Repository | Technology |
|-------|-----------|------------|
| **Frontend** | [lifehacking-app](https://github.com/arielbvergara/lifehacking-app) (this repo) | Next.js 16 |
| **Backend** | [lifehacking](https://github.com/arielbvergara/lifehacking) | .NET 9 |

---

## 🚀 Tech Stack

### Framework & Language

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org) | React framework with App Router, Server Components, and built-in caching |
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Strict type safety across the entire codebase |

### Styling & Design

| Technology | Purpose |
|------------|---------|
| [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS framework |
| [Google Stitch](https://stitch.withgoogle.com) | Design system and UI prototyping (design-phase tool, not a runtime dependency) |

### Authentication & Data

| Technology | Purpose |
|------------|---------|
| [Firebase](https://firebase.google.com) | Authentication (Email/Password, Social login) and Firestore database |

### AI & Intelligence

| Technology | Purpose |
|------------|---------|
| [Google Gemini AI](https://ai.google.dev) | In-app AI features powered by `@google/generative-ai` |
| [Kiro](https://kiro.dev) | AI coding assistant used during development |

### Observability & Monitoring

| Technology | Purpose |
|------------|---------|
| [Sentry.io](https://sentry.io) | Error tracking, performance monitoring, and session replay |

### Deployment & Infrastructure

| Technology | Purpose |
|------------|---------|
| [Vercel](https://vercel.com) | Primary hosting and edge deployment for the Next.js frontend |
| [Docker](https://www.docker.com) | Containerised deployments for self-hosted environments |
| [AWS CloudFront](https://aws.amazon.com/cloudfront/) | CDN for image delivery and caching |

### Developer Experience & Quality

| Technology | Purpose |
|------------|---------|
| [GitHub Actions](https://github.com/features/actions) | CI pipeline — type-checking, linting, unit tests, E2E tests, and build verification on every PR |
| [GitHub Copilot](https://github.com/features/copilot) | AI-powered code review integrated into pull request workflows |
| [Dependabot](https://docs.github.com/en/code-security/dependabot) | Automated weekly dependency updates (every Monday) |
| [Husky](https://typicode.github.io/husky) | Git hooks for pre-commit quality checks |
| [ESLint](https://eslint.org) | Static code analysis and style enforcement |
| [pnpm](https://pnpm.io) | Fast, disk-efficient package manager |

### Testing

| Technology | Purpose |
|------------|---------|
| [Vitest](https://vitest.dev) | Unit and integration tests with happy-dom environment |
| [Playwright](https://playwright.dev) | End-to-end browser testing |
| [@testing-library/react](https://testing-library.com/react) | React component testing utilities |

### Form Handling & Validation

| Technology | Purpose |
|------------|---------|
| [React Hook Form](https://react-hook-form.com) | Performant, flexible form management |
| [Zod](https://zod.dev) | Schema validation with TypeScript inference |

---

## 🎨 Design System

The project uses a custom design system built on Tailwind CSS with:

- Custom color palette optimized for the lifehacking brand
- Custom animations (fade-in, slide-down, slide-in, pulse-slow)
- Responsive breakpoints including custom `lg-header` at 1088px
- Utility classes like `scrollbar-hide` for enhanced UX
- Design templates available in `docs/design-templates/` for reference

---

## ⚡ Performance & Caching

This project leverages Next.js 16's advanced caching features:

- **Cache Components** enabled for optimal performance
- **Custom Cache Life Profiles**:
  - Home page data: 5-minute stale/revalidate, 10-minute expiry
  - Search/category data: 5-minute stale/revalidate, 10-minute expiry
- **CloudFront CDN** for image delivery with optimized caching
- **Sentry Performance Monitoring** for real-time performance insights

See [`docs/Next-16-Cache-Components.md`](docs/Next-16-Cache-Components.md) for detailed caching patterns.

---

## 🔒 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### Firebase Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

### API Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend API (default: `http://localhost:5055`) |

### Gemini AI Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for AI features |
| `NEXT_PUBLIC_GEMINI_MODEL_PRIMARY` | Primary Gemini model (default: `gemini-2.5-flash`) |
| `NEXT_PUBLIC_GEMINI_MODEL_FALLBACK` | Fallback Gemini model (default: `gemini-2.5`) |

### Sentry Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Data Source Name for error tracking |
| `SENTRY_ORG` | Sentry organization identifier |
| `SENTRY_PROJECT` | Sentry project identifier |

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org)
- [pnpm 10+](https://pnpm.io)

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Unit tests (watch mode)
pnpm test

# Unit tests (single run)
pnpm test:run

# Unit tests with UI
pnpm test:ui

# Unit tests with coverage
pnpm test:coverage

# End-to-end tests
pnpm test:e2e

# End-to-end tests with UI
pnpm test:e2e:ui
```

### Test Configuration

- **Unit Tests**: Vitest with happy-dom environment for fast, lightweight DOM simulation
- **E2E Tests**: Playwright with Chromium for browser automation
- **Coverage**: V8 provider with text, JSON, and HTML reporters
- **Test Location**: Unit tests alongside source files, E2E tests in `/e2e` directory

---

## 🔄 CI/CD Pipeline

Every pull request and push to `master`/`development` automatically runs the full quality gate via **GitHub Actions**:

1. ✅ TypeScript type checking
2. ✅ ESLint linting
3. ✅ Vitest unit tests
4. ✅ Production build verification
5. ⏸️ Playwright E2E tests (currently disabled, can be enabled in CI config)

**Dependabot** automatically opens pull requests every **Monday** to keep all npm dependencies up to date, grouped by minor/patch updates.

Production deployments are handled by **Vercel** on merge to `main`, and containerised environments can be deployed using the provided **Docker** configuration.

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [`docs/Frontend-Development-Spec.md`](docs/Frontend-Development-Spec.md) | Full frontend development specification |
| [`docs/Frontend-Quick-Reference.md`](docs/Frontend-Quick-Reference.md) | Quick reference for common patterns |
| [`docs/CI-Setup.md`](docs/CI-Setup.md) | CI/CD setup and GitHub Secrets guide |
| [`docs/Sentry-Setup-Guide.md`](docs/Sentry-Setup-Guide.md) | Sentry monitoring configuration guide |
| [`docs/Next-16-Cache-Components.md`](docs/Next-16-Cache-Components.md) | Next.js 16 caching patterns used in this project |
| [`docs/api-schema.json`](docs/api-schema.json) | OpenAPI 3.0 schema for backend API integration |
| [`docs/design-templates/`](docs/design-templates/) | Design templates and UI mockups for key pages |
