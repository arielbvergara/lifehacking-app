# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev             # Start dev server (localhost:3000)
pnpm build           # Production build
pnpm typecheck       # tsc --noEmit
pnpm lint            # ESLint
pnpm test            # Vitest watch mode
pnpm test:run        # Vitest single run
pnpm test:coverage   # Coverage report (V8 provider)
pnpm test:e2e        # Playwright E2E (Chromium)
```

To run a single test file: `pnpm test <path-or-pattern>` (e.g. `pnpm test lib/api/tips`).

## Architecture

### Providers (app/layout.tsx)

The root layout wraps everything in: `AuthProvider → FavoritesProvider → {children}`, with `ToastContainer` as a sibling. Any component that calls `useAuth()` or `useFavoritesContext()` must be a descendant of this layout.

### Authentication (lib/auth/)

Two-layer auth:
1. **Firebase** (`lib/firebase.ts`, `lib/auth/firebase-auth.ts`) — handles sign-in/sign-up, issues the ID token.
2. **Backend** — receives the Firebase JWT as `Authorization: Bearer <token>` for all authenticated API calls.

`AuthProvider` (`lib/auth/auth-context.tsx`) listens to `onAuthStateChanged`, keeps `user` (FirebaseUser) and `idToken` in state, writes a `session` cookie so middleware can read it server-side, and syncs the user to the backend via `handleUserSync`. Sign-up flows set `isSigningUp` to suppress the sync in the listener since `createUserInBackend` is called explicitly.

`useAuth()` — the hook for components. Throws if used outside `AuthProvider`.

### Favorites (lib/context/favorites-context.tsx)

`FavoritesProvider` is the single source of truth for favorites:
- **Authenticated**: fetches from `GET /api/me/favorites`, stores tip IDs in state.
- **Anonymous**: reads/writes `localStorage` via `localStorageManager` (`lib/storage/favorites-storage.ts`), capped at `ANONYMOUS_MAX_FAVORITES`.
- **On login**: `merge-handler.ts` triggers `POST /api/me/favorites/merge` to sync localStorage favorites to the server, then calls the registered `refreshFavorites` callback.
- All mutations use optimistic updates with rollback on error.

`useFavoritesContext()` — the hook for components.

### API Layer (lib/api/, lib/config/api.ts)

- Base URL: `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:5055`).
- `fetchWithTimeout()` (`lib/api/utils.ts`) — base fetch with `AbortController` timeout (10s standard, 30s admin). Throws `APIError` wrapping RFC 7807 `ProblemDetails`. Backend error details are intentionally sanitized before reaching the client.
- API modules: `tips.ts`, `categories.ts`, `favorites.ts`, `user.ts`, `admin-tip.ts`, `admin-category.ts`, `admin-user.ts`, `admin-dashboard.ts`.

### Server-Side Data Fetching (lib/data/)

Uses Next.js 16's `'use cache'` directive (not `React.cache()` or SWR). Cache life profiles are defined in `next.config.ts`:
- `home` — 5 min stale/revalidate, 10 min expire.
- `search` — same.

`lib/data/home-data.ts` exports `getHomePageData()` which fetches categories, featured tip, and latest tips in parallel. Similar patterns in `tip-data.ts`, `category-data.ts`, `search-data.ts`.

### Routing

Flat App Router structure — no route groups. Key routes:
- `/` — Home
- `/search` — Search with filters
- `/tip/[id]` — Tip detail (canonical)
- `/tips/[id]` — Tip detail (alternate; both exist)
- `/categories/[id]` — Category tips
- `/favorites` — Authenticated favorites
- `/profile` — Authenticated profile
- `/admin` — Admin dashboard
- `/admin/tips`, `/admin/categories`, `/admin/users` — Admin CRUD

Each route segment that can error has a co-located `error.tsx` and `not-found.tsx`.

### AI Features (lib/services/gemini.ts)

Gemini AI generates tip content (title, description, steps, tags) from YouTube or Instagram video URLs. Uses primary/fallback model env vars (`NEXT_PUBLIC_GEMINI_MODEL_PRIMARY`, `NEXT_PUBLIC_GEMINI_MODEL_FALLBACK`).

### Images

Remote images are served through CloudFront (`d2llilw45t9776.cloudfront.net/public/**`). Use `next/image` for all images; AVIF/WebP formats are configured.

### Module Alias

`@/` resolves to the repository root (configured in both `tsconfig.json` and `vitest.config.ts`).

## Testing

- Unit tests are co-located with source: `foo.ts` → `foo.test.ts`.
- Test environment is `happy-dom` (not jsdom).
- E2E tests live in `/e2e/`; they are currently disabled in CI.
- Vitest globals are enabled — no need to import `describe`/`it`/`expect`.
