# Lifehacking Tips Frontend - Development Specification

## Project Overview

Building a modern, minimalist web application for discovering and managing practical daily-life tips. This document serves as the complete specification for frontend development using Next.js 16, shadcn/ui, and Tailwind CSS.

**Repository Structure:**
- Backend API: `lifehacking/` (existing .NET API)
- Frontend: `frontend/` (to be created)

**Technology Stack:**
- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **Language:** TypeScript (strict mode)
- **Authentication:** Firebase Authentication
- **State Management:** React Context + SWR/TanStack Query
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide React (included with shadcn/ui)

**Design Philosophy:**
- Minimalist and modern aesthetic
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Target Lighthouse SEO score: 100%
- Target Lighthouse Performance score: ≥90%

---

## User Types & Capabilities

### 1. Anonymous Users (No Authentication)
- Browse and search tips without signing in
- View tip details with step-by-step instructions
- Filter by category and tags
- Sort results (by date, title)
- Save favorites to browser local storage
- Access all public content

### 2. Authenticated Users (Logged In)
- All anonymous user capabilities
- Persistent favorites stored server-side
- Automatic merge of local storage favorites on first login (deduplicated)
- Cross-device favorite synchronization
- Self-service profile management (view profile, update name, delete account)

### 3. Admin Users
- All authenticated user capabilities
- Create, edit, and delete tips
- Manage categories (create, update, delete)
- Manage users
- Access admin dashboard

---

## Domain Model

### Tip Entity
```typescript
interface Tip {
  id: string; // GUID
  title: string; // 5-200 characters
  description: string; // 10-2000 characters
  steps: TipStep[]; // Ordered list, at least 1
  categoryId: string; // GUID
  categoryName: string; // For display
  tags: string[]; // Max 10 tags, each 1-50 characters
  videoUrl?: string; // Optional YouTube or Instagram URL
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

interface TipStep {
  number: number; // >= 1
  description: string; // 10-500 characters
}
```


### Category Entity
```typescript
interface Category {
  id: string; // GUID
  name: string; // 2-100 characters, unique (case-insensitive)
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}
```

### User Entity
```typescript
interface User {
  id: string; // GUID
  email: string;
  name: string;
  role: 'User' | 'Admin';
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}
```

### Favorite Entity
```typescript
interface Favorite {
  userId: string; // GUID
  tipId: string; // GUID
  addedAt: string; // ISO 8601
  tip: Tip; // Full tip details
}
```

---

## API Integration

### Base Configuration
```typescript
// Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### API Client Setup
```typescript
// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error);
  }

  return response.json();
}
```

### Authentication Helper
```typescript
// lib/api/auth.ts
async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) return {};
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
  };
}
```


---

## API Endpoints Reference

### Public Endpoints (No Authentication)

#### Search Tips
```typescript
GET /api/tip?q={searchTerm}&categoryId={guid}&tags[]={tag}&orderBy={field}&sortDirection={asc|desc}&pageNumber={1}&pageSize={20}

Response: {
  items: TipSummary[];
  metadata: {
    totalItems: number;
    pageNumber: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

TipSummary: {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  stepsCount: number;
  createdAt: string;
  updatedAt?: string;
}
```

#### Get Tip Details
```typescript
GET /api/tip/{id}

Response: TipDetailResponse {
  id: string;
  title: string;
  description: string;
  steps: TipStep[];
  categoryId: string;
  categoryName: string;
  tags: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}
```

#### List Categories
```typescript
GET /api/category

Response: {
  items: Category[];
}
```

#### Get Tips by Category
```typescript
GET /api/category/{id}/tips?orderBy={field}&sortDirection={asc|desc}&pageNumber={1}&pageSize={20}

Response: PagedTipsResponse (same as search)
```

### Authenticated Endpoints (Requires JWT)

#### Create User Profile
```typescript
POST /api/user
Headers: { Authorization: Bearer <token> }
Body: {
  email: string;
  name: string;
}

Response: 201 Created
{
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}
```

#### Get Current User
```typescript
GET /api/user/me
Headers: { Authorization: Bearer <token> }

Response: UserResponse
```

#### Update User Name
```typescript
PUT /api/user/me/name
Headers: { Authorization: Bearer <token> }
Body: {
  newName: string;
}

Response: UserResponse
```


#### Delete User Account
```typescript
DELETE /api/user/me
Headers: { Authorization: Bearer <token> }

Response: 204 No Content
```

#### List User Favorites
```typescript
GET /api/me/favorites?q={searchTerm}&categoryId={guid}&tags[]={tag}&orderBy={field}&sortDirection={asc|desc}&pageNumber={1}&pageSize={10}
Headers: { Authorization: Bearer <token> }

Response: {
  items: FavoriteResponse[];
  metadata: PaginationMetadata;
}

FavoriteResponse: {
  userId: string;
  tipId: string;
  addedAt: string;
  tip: TipDetailResponse;
}
```

#### Add Favorite
```typescript
POST /api/me/favorites/{tipId}
Headers: { Authorization: Bearer <token> }

Response: 201 Created
FavoriteResponse
```

#### Remove Favorite
```typescript
DELETE /api/me/favorites/{tipId}
Headers: { Authorization: Bearer <token> }

Response: 204 No Content
```

#### Merge Local Favorites
```typescript
POST /api/me/favorites/merge
Headers: { Authorization: Bearer <token> }
Body: {
  tipIds: string[]; // Array of GUIDs
}

Response: {
  totalReceived: number;
  added: number;
  skipped: number;
  failed: FailedTip[];
}

FailedTip: {
  tipId: string;
  reason: string;
}
```

### Admin Endpoints (Requires Admin Role)

#### Create Tip
```typescript
POST /api/admin/tips
Headers: { Authorization: Bearer <token> }
Body: {
  title: string;
  description: string;
  steps: { number: number; description: string; }[];
  categoryId: string;
  tags?: string[];
  videoUrl?: string;
}

Response: 201 Created
TipDetailResponse
```

#### Update Tip
```typescript
PUT /api/admin/tips/{id}
Headers: { Authorization: Bearer <token> }
Body: (same as create)

Response: TipDetailResponse
```

#### Delete Tip
```typescript
DELETE /api/admin/tips/{id}
Headers: { Authorization: Bearer <token> }

Response: 204 No Content
```


#### Create Category
```typescript
POST /api/admin/categories
Headers: { Authorization: Bearer <token> }
Body: {
  name: string;
}

Response: 201 Created
CategoryResponse
```

#### Update Category
```typescript
PUT /api/admin/categories/{id}
Headers: { Authorization: Bearer <token> }
Body: {
  name: string;
}

Response: CategoryResponse
```

#### Delete Category
```typescript
DELETE /api/admin/categories/{id}
Headers: { Authorization: Bearer <token> }

Response: 204 No Content
Note: Cascades soft-delete to all tips in category
```

### Error Response Format (RFC 7807)
```typescript
interface ApiError {
  status: number;
  type: string;
  title: string;
  detail: string;
  instance: string;
  correlationId: string;
  errors?: Record<string, string[]>; // Validation errors
}

// Common status codes:
// 400 - Validation errors, malformed requests
// 401 - Missing or invalid authentication token
// 403 - Insufficient permissions
// 404 - Resource not found
// 409 - Conflict (e.g., duplicate category name)
// 429 - Rate limit exceeded
// 500 - Internal server error
```

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (public)/
│   │   ├── page.tsx                    # Home
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── tips/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (authenticated)/
│   │   ├── favorites/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── tips/
│   │   │   │   ├── page.tsx            # List
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   └── categories/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx                      # Root layout
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── navigation.tsx
│   │   └── mobile-nav.tsx
│   ├── tips/
│   │   ├── tip-card.tsx
│   │   ├── tip-detail.tsx
│   │   ├── tip-list.tsx
│   │   ├── tip-steps.tsx
│   │   └── related-tips.tsx
│   ├── search/
│   │   ├── search-bar.tsx
│   │   ├── filter-panel.tsx
│   │   ├── sort-dropdown.tsx
│   │   └── active-filters.tsx
│   ├── favorites/
│   │   ├── favorite-button.tsx
│   │   └── favorites-grid.tsx
│   ├── categories/
│   │   ├── category-card.tsx
│   │   ├── category-badge.tsx
│   │   └── category-grid.tsx
│   ├── admin/
│   │   ├── tip-form.tsx
│   │   ├── category-form.tsx
│   │   ├── admin-table.tsx
│   │   └── stats-card.tsx
│   ├── auth/
│   │   ├── auth-provider.tsx
│   │   ├── protected-route.tsx
│   │   └── admin-route.tsx
│   └── shared/
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       ├── pagination.tsx
│       ├── breadcrumb.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── tips.ts
│   │   ├── categories.ts
│   │   ├── favorites.ts
│   │   ├── users.ts
│   │   └── admin.ts
│   ├── auth/
│   │   ├── firebase.ts
│   │   ├── auth-context.tsx
│   │   └── use-auth.ts
│   ├── hooks/
│   │   ├── use-tips.ts
│   │   ├── use-favorites.ts
│   │   ├── use-categories.ts
│   │   ├── use-local-storage.ts
│   │   └── use-debounce.ts
│   ├── utils/
│   │   ├── cn.ts                       # Class name utility
│   │   ├── format-date.ts
│   │   ├── truncate.ts
│   │   └── validators.ts
│   └── constants/
│       ├── routes.ts
│       ├── api-endpoints.ts
│       └── validation-rules.ts
├── types/
│   ├── api.ts
│   ├── tip.ts
│   ├── category.ts
│   ├── user.ts
│   └── favorite.ts
├── public/
│   ├── images/
│   ├── icons/
│   └── og-image.jpg
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```


---

## Page Specifications

### 1. Home Page (`/`)

**Purpose:** Entry point for discovering tips with prominent search functionality

**Layout:**
- Hero section with large search bar (centered)
- Featured categories grid (3-4 columns on desktop)
- Recent tips section (6-8 tip cards)
- Call-to-action for signup

**Components:**
- `SearchBar` (prominent, auto-focus on desktop)
- `CategoryGrid` (clickable category cards)
- `TipList` (recent tips)
- `EmptyState` (when no tips exist)

**SEO:**
```typescript
export const metadata = {
  title: 'Lifehacking Tips | Discover Practical Daily Life Tips',
  description: 'Browse and search practical daily-life tips. Find step-by-step guides for productivity, health, cooking, and more.',
  openGraph: {
    title: 'Lifehacking Tips',
    description: 'Discover practical daily-life tips',
    type: 'website',
  },
};
```

**Empty State:**
```
🚀
Welcome to Lifehacking Tips!

We're just getting started. Check back soon for practical daily-life tips.

[Admin? Add First Tip] (if admin user)
```

---

### 2. Search Results Page (`/search`)

**Purpose:** Display filtered and sorted tip results

**URL Parameters:**
- `q` - Search term
- `category` - Category ID
- `tags` - Comma-separated tags
- `sort` - Sort field (created, updated, title)
- `order` - Sort direction (asc, desc)
- `page` - Page number

**Layout:**
- Sticky search bar in header
- Active filters display (removable chips)
- Filter sidebar (collapsible on mobile)
  - Categories (radio buttons)
  - Tags (multi-select)
  - Sort dropdown
- Results grid (responsive columns)
- Pagination
- Results count

**Components:**
- `SearchBar`
- `FilterPanel`
- `ActiveFilters`
- `SortDropdown`
- `TipList`
- `Pagination`
- `EmptyState`

**Empty State:**
```
🔍
No tips found matching your search

Try different keywords or browse categories to discover helpful tips.

[Browse Categories]
```

**SEO:**
```typescript
// Dynamic based on search
export async function generateMetadata({ searchParams }) {
  const query = searchParams.q || 'tips';
  return {
    title: `Search: ${query} | Lifehacking Tips`,
    description: `Search results for ${query}`,
    robots: 'noindex', // Don't index search results
  };
}
```


---

### 3. Tip Detail Page (`/tips/[id]`)

**Purpose:** Display complete tip information with SEO optimization

**Layout:**
```
┌─────────────────────────────────────────┐
│ Breadcrumb: Home > Category > Tip      │
│                                         │
│ [Category Badge]                        │
│                                         │
│ # Tip Title (H1)                        │
│                                         │
│ [Tag] [Tag] [Tag]                       │
│                                         │
│ [❤️ Favorite] [🔗 Share] [✏️ Edit]      │
│                                         │
│ Created: Jan 15, 2026 | Updated: Jan 20│
│                                         │
├─────────────────────────────────────────┤
│ ## Description                          │
│ Full description text...                │
│                                         │
├─────────────────────────────────────────┤
│ ## Steps                                │
│ 1. First step...                        │
│ 2. Second step...                       │
│ 3. Third step...                        │
│                                         │
├─────────────────────────────────────────┤
│ [Embedded Video] (if videoUrl)          │
│                                         │
├─────────────────────────────────────────┤
│ ## Related Tips                         │
│ [Card] [Card] [Card] [Card]             │
└─────────────────────────────────────────┘
```

**Components:**
- `Breadcrumb`
- `CategoryBadge`
- `TagList`
- `FavoriteButton`
- `ShareButton`
- `TipSteps`
- `VideoEmbed`
- `RelatedTips`

**SEO (Critical!):**
```typescript
export async function generateMetadata({ params }) {
  const tip = await getTip(params.id);
  
  return {
    title: `${tip.title} | Lifehacking Tips`,
    description: tip.description.substring(0, 160),
    openGraph: {
      title: tip.title,
      description: tip.description.substring(0, 160),
      type: 'article',
      publishedTime: tip.createdAt,
      modifiedTime: tip.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: tip.title,
      description: tip.description.substring(0, 160),
    },
  };
}
```

**Structured Data (JSON-LD):**
```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: tip.title,
  description: tip.description,
  step: tip.steps.map(step => ({
    '@type': 'HowToStep',
    position: step.number,
    text: step.description,
  })),
  datePublished: tip.createdAt,
  dateModified: tip.updatedAt,
};
```

**Interactions:**
- Favorite button: Toggle with animation, optimistic update
- Share button: Copy URL to clipboard, show toast
- Edit button: Only visible to admins
- Category badge: Click to view category
- Tags: Click to search by tag
- Related tips: Load asynchronously


---

### 4. Categories Page (`/categories`)

**Purpose:** Browse all available categories

**Layout:**
- Grid of category cards (3-4 columns on desktop)
- Each card shows: category name, tip count, icon (optional)
- Hover effect with elevation

**Components:**
- `CategoryGrid`
- `CategoryCard`
- `EmptyState`

**Empty State:**
```
📂
No categories yet

Check back soon as we organize our tips into categories.
```

**SEO:**
```typescript
export const metadata = {
  title: 'Browse Categories | Lifehacking Tips',
  description: 'Explore tips organized by categories including productivity, health, cooking, and more.',
};
```

---

### 5. Category Detail Page (`/categories/[id]`)

**Purpose:** Display all tips in a specific category

**Layout:**
- Category name (H1)
- Tip count
- Sort options
- Paginated tip grid
- Breadcrumb navigation

**Components:**
- `Breadcrumb`
- `SortDropdown`
- `TipList`
- `Pagination`
- `EmptyState`

**Empty State:**
```
📂
No tips in this category yet

This category is waiting for its first tip. Check back soon!

[View All Categories]
```

**SEO:**
```typescript
export async function generateMetadata({ params }) {
  const category = await getCategory(params.id);
  
  return {
    title: `${category.name} Tips | Lifehacking Tips`,
    description: `Browse practical tips in the ${category.name} category`,
  };
}
```

---

### 6. Favorites Page (`/favorites`) - Authenticated

**Purpose:** Display user's saved favorite tips

**Layout:**
- Search bar (filter within favorites)
- Filter options (category, tags)
- Sort options
- Paginated favorites grid
- Remove from favorites action

**Components:**
- `SearchBar`
- `FilterPanel`
- `TipList` (with remove action)
- `Pagination`
- `EmptyState`

**Empty State:**
```
❤️
Your favorites list is empty

Start exploring tips and save the ones you love. They'll appear here for easy access.

[Explore Tips]
```

**Authentication:**
- Redirect to login if not authenticated
- Show loading state while fetching


---

### 7. Profile Page (`/profile`) - Authenticated

**Purpose:** User profile management

**Layout:**
- User information display (name, email, role)
- Edit name form
- Delete account button (with confirmation)
- Logout button

**Components:**
- `ProfileCard`
- `EditNameForm`
- `DeleteAccountDialog`
- `Button` (logout)

**Interactions:**
- Edit name: Inline form with validation
- Delete account: Confirmation modal with warning
- Logout: Clear auth state, redirect to home

---

### 8. Admin Dashboard (`/admin`) - Admin Only

**Purpose:** Overview and quick actions for admins

**Layout:**
- Statistics cards (total tips, categories, users)
- Quick action buttons (Create Tip, Create Category)
- Recent activity feed

**Components:**
- `StatsCard`
- `QuickActions`
- `ActivityFeed`

**Authorization:**
- Redirect to home if not admin
- Show 403 error if authenticated but not admin

---

### 9. Admin Tips Management (`/admin/tips`) - Admin Only

**Purpose:** Manage all tips (list, create, edit, delete)

**Layout:**
- Search and filter controls
- Create new tip button
- Tips table with actions
- Pagination

**Components:**
- `SearchBar`
- `AdminTable`
- `Pagination`
- `Button` (create, edit, delete)

**Table Columns:**
- Title
- Category
- Tags
- Created Date
- Actions (Edit, Delete)

---

### 10. Admin Tip Editor (`/admin/tips/new` and `/admin/tips/[id]/edit`) - Admin Only

**Purpose:** Create or edit tips

**Layout:**
- Form with fields:
  - Title (text input)
  - Description (textarea)
  - Steps (dynamic list with add/remove)
  - Category (dropdown)
  - Tags (multi-input)
  - Video URL (text input)
- Real-time validation
- Preview mode toggle
- Save/Cancel buttons

**Components:**
- `TipForm`
- `StepInput` (dynamic list)
- `CategorySelect`
- `TagInput`
- `Button` (save, cancel, preview)

**Validation:**
- Title: 5-200 characters
- Description: 10-2000 characters
- Steps: At least 1, each 10-500 characters
- Category: Required
- Tags: Max 10, each 1-50 characters
- Video URL: Valid YouTube or Instagram URL

**Interactions:**
- Add step: Append new step input
- Remove step: Remove from list (min 1)
- Preview: Show formatted tip
- Save: Validate, API call, redirect on success
- Cancel: Confirm if changes, redirect


---

### 11. Admin Categories Management (`/admin/categories`) - Admin Only

**Purpose:** Manage categories (list, create, edit, delete)

**Layout:**
- Create new category button
- Categories list with tip counts
- Edit/Delete actions per category

**Components:**
- `CategoryForm` (inline or modal)
- `AdminTable`
- `DeleteDialog` (with cascade warning)

**Delete Warning:**
```
⚠️ Delete Category?

This will also delete all tips in this category. This action cannot be undone.

[Cancel] [Delete Category]
```

---

### 12. Login Page (`/login`)

**Purpose:** User authentication

**Layout:**
- Firebase Authentication UI
- Email/password login
- Social login options (Google, etc.)
- Link to signup page
- "Continue as Guest" link

**Components:**
- `FirebaseAuthUI`
- `Button` (continue as guest)

**Flow:**
1. User enters credentials
2. Firebase authentication
3. Receive ID token
4. Check if user profile exists (GET /api/user/me)
5. If not, redirect to profile creation
6. If yes, merge local favorites if any
7. Redirect to intended page or home

---

### 13. Signup Page (`/signup`)

**Purpose:** New user registration

**Layout:**
- Firebase Authentication UI
- Email/password registration
- Social signup options
- Link to login page

**Components:**
- `FirebaseAuthUI`

**Flow:**
1. User enters credentials
2. Firebase authentication
3. Receive ID token
4. Automatically call POST /api/user to create profile
5. Merge local favorites if any
6. Redirect to home or onboarding

---

## Design System

### Color Palette (Minimalist)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Primary (Neutral grays)
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        
        // Muted
        muted: 'hsl(210 40% 96.1%)',
        'muted-foreground': 'hsl(215.4 16.3% 46.9%)',
        
        // Accent (Subtle blue)
        accent: 'hsl(210 40% 96.1%)',
        'accent-foreground': 'hsl(222.2 47.4% 11.2%)',
        
        // Primary action
        primary: 'hsl(222.2 47.4% 11.2%)',
        'primary-foreground': 'hsl(210 40% 98%)',
        
        // Secondary
        secondary: 'hsl(210 40% 96.1%)',
        'secondary-foreground': 'hsl(222.2 47.4% 11.2%)',
        
        // Destructive
        destructive: 'hsl(0 84.2% 60.2%)',
        'destructive-foreground': 'hsl(210 40% 98%)',
        
        // Border
        border: 'hsl(214.3 31.8% 91.4%)',
        
        // Input
        input: 'hsl(214.3 31.8% 91.4%)',
        
        // Ring (focus)
        ring: 'hsl(222.2 84% 4.9%)',
      },
    },
  },
};
```


### Typography

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
    },
  },
};
```

### Spacing Scale

```typescript
// Base unit: 4px
spacing: {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}
```

### Component Variants

**Button:**
- `default` - Primary action (dark background)
- `secondary` - Secondary action (light background)
- `ghost` - Minimal styling
- `destructive` - Delete/remove actions (red)
- `outline` - Outlined button
- `link` - Text link style

**Card:**
- Default with subtle border and shadow
- Hover state: elevated shadow, slight scale

**Badge:**
- `default` - Neutral gray
- `secondary` - Light background
- `destructive` - Red for errors
- `outline` - Outlined style

---

## Component Specifications

### TipCard Component

```typescript
interface TipCardProps {
  tip: {
    id: string;
    title: string;
    description: string;
    categoryName: string;
    tags: string[];
    stepsCount: number;
    createdAt: string;
  };
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
  showFavoriteButton?: boolean;
}

// Features:
// - Click anywhere navigates to tip detail
// - Favorite button stops propagation
// - Category badge clickable
// - Tags clickable (search by tag)
// - Truncate description to 2 lines
// - Show steps count and relative date
// - Hover effect (shadow + scale)
```


### SearchBar Component

```typescript
interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

// Features:
// - Debounced input (300ms)
// - Clear button when text present
// - Search icon (left side)
// - Enter key submits
// - Accessible with proper labels
// - Loading indicator during search
```

### FavoriteButton Component

```typescript
interface FavoriteButtonProps {
  tipId: string;
  isFavorite: boolean;
  onToggle: (tipId: string, isFavorite: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Features:
// - Heart icon (filled when favorite)
// - Animation on toggle
// - Optimistic UI update
// - Toast notification
// - Accessible button with label
// - Loading state during API call
```

### FilterPanel Component

```typescript
interface FilterPanelProps {
  categories: Category[];
  availableTags: string[];
  selectedCategoryId?: string;
  selectedTags: string[];
  onCategoryChange: (id: string | null) => void;
  onTagsChange: (tags: string[]) => void;
  onClear: () => void;
}

// Features:
// - Collapsible on mobile
// - Category radio buttons
// - Tag checkboxes with search
// - Clear all button
// - Active filter count badge
// - Accessible form controls
```

### EmptyState Component

```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// Features:
// - Centered layout
// - Large icon (emoji or SVG)
// - Clear title and description
// - Optional action button
// - Consistent styling
```

### Pagination Component

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

// Features:
// - Previous/Next buttons
// - Page numbers (with ellipsis for many pages)
// - Disabled state for first/last page
// - Accessible navigation
// - Keyboard support
```


---

## State Management

### Authentication State

```typescript
// lib/auth/auth-context.tsx
interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

// Usage:
const { user, isAdmin, signOut } = useAuth();
```

### Local Storage (Anonymous Favorites)

```typescript
// lib/hooks/use-local-storage.ts
function useLocalFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const addFavorite = (tipId: string) => {
    const updated = [...favorites, tipId];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };
  
  const removeFavorite = (tipId: string) => {
    const updated = favorites.filter(id => id !== tipId);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };
  
  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites');
  };
  
  return { favorites, addFavorite, removeFavorite, clearFavorites };
}
```

### Data Fetching (SWR Example)

```typescript
// lib/hooks/use-tips.ts
import useSWR from 'swr';

function useTips(params: SearchParams) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/tip', params],
    ([url, params]) => searchTips(params)
  );
  
  return {
    tips: data?.items || [],
    metadata: data?.metadata,
    isLoading,
    error,
    mutate,
  };
}

// Usage:
const { tips, metadata, isLoading } = useTips({ 
  q: searchTerm, 
  pageNumber: 1 
});
```

---

## Accessibility Implementation

### Keyboard Navigation

```typescript
// Example: Dropdown menu
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button aria-label="Open menu">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => {}}>
      Item 1
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// Features:
// - Tab to focus trigger
// - Enter/Space to open
// - Arrow keys to navigate items
// - Escape to close
// - Focus returns to trigger
```

### Screen Reader Support

```typescript
// Example: Favorite button
<button
  onClick={handleToggle}
  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  aria-pressed={isFavorite}
>
  <Heart className={isFavorite ? 'fill-current' : ''} />
  {showLabel && (isFavorite ? 'Favorited' : 'Favorite')}
</button>

// Example: Loading state
<div role="status" aria-live="polite">
  {isLoading && <span className="sr-only">Loading tips...</span>}
</div>
```

### Focus Management

```typescript
// Example: Modal focus trap
import { Dialog, DialogContent } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Focus automatically trapped inside */}
    <DialogTitle>Confirm Delete</DialogTitle>
    <DialogDescription>
      Are you sure you want to delete this tip?
    </DialogDescription>
    <DialogFooter>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleConfirm} variant="destructive">
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```


---

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

// Example: Tip card image (if added later)
<Image
  src={tip.imageUrl}
  alt={tip.title}
  width={400}
  height={300}
  className="rounded-lg"
  loading="lazy"
  placeholder="blur"
  blurDataURL={tip.blurDataUrl}
/>
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const AdminTipForm = dynamic(() => import('@/components/admin/tip-form'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});

// Route-based splitting (automatic with App Router)
// Each page in app/ directory is automatically code-split
```

### Data Fetching Strategy

```typescript
// Server Components (default in App Router)
// Fetch data on server, no client-side JS needed
export default async function TipsPage() {
  const tips = await getTips(); // Server-side fetch
  
  return <TipList tips={tips} />;
}

// Client Components (for interactivity)
'use client';

export function SearchBar() {
  const [query, setQuery] = useState('');
  // Client-side interactivity
}
```

### Caching

```typescript
// Next.js fetch with caching
export async function getTips() {
  const res = await fetch(`${API_URL}/api/tip`, {
    next: { 
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['tips'], // Cache tag for on-demand revalidation
    },
  });
  
  return res.json();
}

// SWR caching
const { data } = useSWR('/api/tip', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
});
```

---

## Error Handling

### API Error Handling

```typescript
// lib/api/client.ts
class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    public detail: string,
    public correlationId: string,
    public errors?: Record<string, string[]>
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.status,
        error.type,
        error.detail,
        error.correlationId,
        error.errors
      );
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error or other
    throw new Error('Network error. Please try again.');
  }
}
```

### Error Boundary

```typescript
// components/shared/error-boundary.tsx
'use client';

export function ErrorBoundary({ 
  error, 
  reset 
}: { 
  error: Error; 
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```


### Toast Notifications

```typescript
// Using shadcn/ui toast
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Tip added to favorites',
      variant: 'default',
    });
  };
  
  const handleError = (error: ApiError) => {
    toast({
      title: 'Error',
      description: error.detail,
      variant: 'destructive',
    });
  };
}
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// components/tips/tip-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TipCard } from './tip-card';

describe('TipCard', () => {
  const mockTip = {
    id: '123',
    title: 'Test Tip',
    description: 'Test description',
    categoryName: 'Productivity',
    tags: ['work', 'efficiency'],
    stepsCount: 3,
    createdAt: '2026-01-15T00:00:00Z',
  };
  
  it('renders tip information', () => {
    render(<TipCard tip={mockTip} isFavorite={false} onFavoriteToggle={() => {}} />);
    
    expect(screen.getByText('Test Tip')).toBeInTheDocument();
    expect(screen.getByText('Productivity')).toBeInTheDocument();
  });
  
  it('calls onFavoriteToggle when favorite button clicked', () => {
    const handleToggle = jest.fn();
    render(<TipCard tip={mockTip} isFavorite={false} onFavoriteToggle={handleToggle} />);
    
    const favoriteButton = screen.getByLabelText('Add to favorites');
    fireEvent.click(favoriteButton);
    
    expect(handleToggle).toHaveBeenCalledWith('123');
  });
});
```

### Integration Tests

```typescript
// app/(public)/search/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import SearchPage from './page';

jest.mock('@/lib/api/tips', () => ({
  searchTips: jest.fn(() => Promise.resolve({
    items: [/* mock tips */],
    metadata: { totalItems: 10, pageNumber: 1, totalPages: 1 },
  })),
}));

describe('SearchPage', () => {
  it('displays search results', async () => {
    render(<SearchPage searchParams={{ q: 'productivity' }} />);
    
    await waitFor(() => {
      expect(screen.getByText(/results/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright - Optional)

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('search for tips', async ({ page }) => {
  await page.goto('/');
  
  await page.fill('[placeholder="Search for tips..."]', 'productivity');
  await page.press('[placeholder="Search for tips..."]', 'Enter');
  
  await expect(page).toHaveURL(/\/search\?q=productivity/);
  await expect(page.locator('.tip-card')).toHaveCount(10);
});
```


---

## Development Workflow

### Initial Setup

```bash
# Create Next.js project
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=false

# Install shadcn/ui
npx shadcn-ui@latest init

# Install dependencies
cd frontend
npm install swr react-hook-form zod @hookform/resolvers
npm install firebase
npm install lucide-react
npm install date-fns

# Install dev dependencies
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/search-page

# Commit changes (Conventional Commits)
git commit -m "feat: add search page with filters"

# Push and create PR
git push origin feature/search-page
```

---

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure (Week 1)
- [ ] Initialize Next.js project
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up project structure
- [ ] Configure TypeScript
- [ ] Set up API client
- [ ] Configure Firebase Authentication
- [ ] Create layout components (Header, Footer, Navigation)
- [ ] Implement authentication context
- [ ] Set up error handling

### Phase 2: Public Pages (Week 2)
- [ ] Home page with search
- [ ] Search results page with filters
- [ ] Tip detail page (SEO optimized)
- [ ] Category list page
- [ ] Category detail page
- [ ] Empty states for all pages
- [ ] Implement local storage favorites
- [ ] Add loading skeletons

### Phase 3: Authentication & User Features (Week 3)
- [ ] Login/Signup pages
- [ ] Protected route wrapper
- [ ] Favorites page (authenticated)
- [ ] Profile page
- [ ] Favorites merge on login
- [ ] User profile management
- [ ] Toast notifications

### Phase 4: Admin Features (Week 4)
- [ ] Admin route protection
- [ ] Admin dashboard
- [ ] Tips management (list, create, edit, delete)
- [ ] Tip editor form with validation
- [ ] Categories management
- [ ] Admin navigation

### Phase 5: Polish & Optimization (Week 5)
- [ ] Accessibility audit and fixes
- [ ] Performance optimization
- [ ] SEO enhancements
- [ ] Cross-browser testing
- [ ] Mobile responsiveness review
- [ ] Error handling improvements
- [ ] Loading states refinement

### Phase 6: Testing & Documentation (Week 6)
- [ ] Unit tests for components
- [ ] Integration tests for pages
- [ ] E2E tests for critical flows
- [ ] Lighthouse audits
- [ ] Documentation updates
- [ ] Deployment preparation


---

## Code Quality Standards

### TypeScript

```typescript
// ✅ Good: Explicit types
interface TipCardProps {
  tip: Tip;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
}

// ❌ Bad: Using any
function handleClick(data: any) { }

// ✅ Good: Type guards
function isTip(obj: unknown): obj is Tip {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

### Component Structure

```typescript
// ✅ Good: Clear component structure
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onSubmit: (value: string) => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [value, setValue] = useState('');
  
  const handleSubmit = () => {
    onSubmit(value);
  };
  
  return (
    <div>
      <h2>{title}</h2>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
```

### Naming Conventions

```typescript
// Components: PascalCase
export function TipCard() {}

// Hooks: camelCase with 'use' prefix
export function useTips() {}

// Utilities: camelCase
export function formatDate() {}

// Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = 'http://localhost:8080';

// Types/Interfaces: PascalCase
export interface Tip {}
export type TipStatus = 'draft' | 'published';
```

### File Organization

```typescript
// ✅ Good: One component per file
// components/tips/tip-card.tsx
export function TipCard() {}

// ✅ Good: Co-located types
// types/tip.ts
export interface Tip {}
export interface TipSummary {}

// ✅ Good: Grouped utilities
// lib/utils/format.ts
export function formatDate() {}
export function formatNumber() {}
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables (Production)

```bash
# Set in Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# ... other Firebase config
```

### Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-image-domain.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Enable React strict mode
  reactStrictMode: true,
  // Optimize production build
  swcMinify: true,
};

module.exports = nextConfig;
```


---

## Success Metrics

### Lighthouse Targets

**SEO: 100**
- ✅ Meta tags on all pages
- ✅ Structured data (JSON-LD)
- ✅ Semantic HTML
- ✅ Proper heading hierarchy
- ✅ Descriptive alt text
- ✅ Canonical URLs
- ✅ robots.txt and sitemap

**Performance: ≥90**
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1
- ✅ Total Blocking Time < 200ms

**Accessibility: 100**
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast 4.5:1
- ✅ Focus indicators
- ✅ ARIA labels

**Best Practices: 100**
- ✅ HTTPS
- ✅ No console errors
- ✅ Secure dependencies
- ✅ Modern image formats
- ✅ Proper caching headers

---

## Troubleshooting Guide

### Common Issues

**Issue: API CORS errors**
```typescript
// Solution: Ensure backend CORS is configured
// Backend should allow: http://localhost:3000 (dev)
// and your production domain
```

**Issue: Firebase authentication not working**
```typescript
// Solution: Check Firebase config
// Ensure all environment variables are set
// Verify Firebase project settings
```

**Issue: Hydration errors**
```typescript
// Solution: Ensure server and client render same content
// Use 'use client' directive for client-only components
// Avoid using browser APIs in server components
```

**Issue: Slow page loads**
```typescript
// Solution: Check bundle size
npm run build
// Analyze with @next/bundle-analyzer
// Implement code splitting
// Optimize images
```

---

## Resources & References

### Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [SWR](https://swr.vercel.app/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE Accessibility Tool](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

### Design
- [Radix UI](https://www.radix-ui.com/) (shadcn/ui is built on this)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind UI](https://tailwindui.com/)

---

## Next Steps

1. **Review this specification** - Ensure understanding of all requirements
2. **Set up development environment** - Install tools and dependencies
3. **Create project structure** - Initialize Next.js project
4. **Start with Phase 1** - Core infrastructure and layout
5. **Iterate and test** - Build incrementally, test frequently
6. **Optimize and polish** - Performance, accessibility, SEO
7. **Deploy** - Production deployment to Vercel

---

**Ready to build an amazing lifehacking tips application! 🚀**

Let's start with Phase 1 when you're ready.
