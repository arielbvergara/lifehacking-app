# Frontend Development - Quick Reference

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript (strict)
- **Auth:** Firebase Authentication
- **Data:** SWR or TanStack Query
- **Forms:** React Hook Form + Zod

## Project Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, Signup
│   ├── (public)/          # Home, Search, Tips, Categories
│   ├── (authenticated)/   # Favorites, Profile
│   └── (admin)/           # Admin pages
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer, Nav
│   ├── tips/              # Tip-related components
│   ├── search/            # Search components
│   └── shared/            # Reusable components
├── lib/
│   ├── api/               # API client functions
│   ├── auth/              # Firebase auth
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utilities
└── types/                 # TypeScript types
```

## Key API Endpoints

### Public
```
GET  /api/tip?q={term}&categoryId={id}&pageNumber={n}
GET  /api/tip/{id}
GET  /api/category
GET  /api/category/{id}/tips
```

### Authenticated
```
POST /api/user
GET  /api/user/me
GET  /api/me/favorites
POST /api/me/favorites/{tipId}
POST /api/me/favorites/merge
```

### Admin
```
POST /api/admin/tips
PUT  /api/admin/tips/{id}
DELETE /api/admin/tips/{id}
POST /api/admin/categories
```

## Essential Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code
```

## Priority Pages
1. Home (`/`) - Search entry point
2. Search (`/search`) - Results with filters
3. Tip Detail (`/tips/[id]`) - SEO optimized
4. Favorites (`/favorites`) - User favorites
5. Admin Tip Editor (`/admin/tips/new`)

## Critical Features
- ✅ Empty states everywhere
- ✅ Local storage favorites (anonymous)
- ✅ Server favorites (authenticated)
- ✅ Favorites merge on login
- ✅ SEO optimization (Lighthouse 100)
- ✅ WCAG 2.1 AA accessibility
- ✅ Mobile-first responsive

## Component Checklist
- [ ] TipCard
- [ ] SearchBar
- [ ] FilterPanel
- [ ] FavoriteButton
- [ ] EmptyState
- [ ] Pagination
- [ ] TipForm (admin)
- [ ] CategoryBadge

## Implementation Phases
1. **Setup** - Project init, structure, auth
2. **Public** - Home, search, tip detail, categories
3. **Auth** - Login, favorites, profile
4. **Admin** - Dashboard, CRUD operations
5. **Polish** - Accessibility, performance, SEO
6. **Test** - Unit, integration, E2E

## Success Metrics
- Lighthouse SEO: 100
- Lighthouse Performance: ≥90
- Lighthouse Accessibility: 100
- WCAG 2.1 AA: 100%

---

**See `Frontend-Development-Spec.md` for complete details.**
