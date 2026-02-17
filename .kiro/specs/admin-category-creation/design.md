# Admin Category Creation - Design

## Architecture Overview

This feature implements a protected admin interface for category creation using Next.js middleware for access control, React components for the UI, and a service layer for API communication.

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /admin/category/create (Server Component)            │ │
│  │    └─> CategoryForm (Client Component)                │ │
│  │          ├─> useAuth() - Get Firebase token           │ │
│  │          ├─> Form State Management                    │ │
│  │          └─> API Service Layer                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Middleware                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Check: /admin/* routes                               │ │
│  │    1. User authenticated?                             │ │
│  │    2. Firebase custom claims: admin = true?           │ │
│  │    3. Yes → Allow access                              │ │
│  │    4. No → Redirect to /404                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  POST /api/admin/categories/images                    │ │
│  │    └─> Upload to S3, return metadata                  │ │
│  │                                                        │ │
│  │  POST /api/admin/categories                           │ │
│  │    └─> Create category with image metadata           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

### 1. Middleware (`middleware.ts`)

**Purpose:** Protect admin routes from unauthorized access

**Location:** Root of project (`middleware.ts`)

**Implementation:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    // Check if user is authenticated
    const session = request.cookies.get('session');
    
    if (!session) {
      // Not authenticated - redirect to 404
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // TODO: Phase 2 - Replace with backend verification
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me`, {
    //   headers: { Authorization: `Bearer ${session.value}` }
    // });
    // const user = await response.json();
    // if (!user.isAdmin) return NextResponse.redirect(new URL('/404', request.url));
    
    // Phase 1: Check Firebase custom claims
    try {
      // Decode token and check custom claims
      // Note: This is a simplified check. In production, verify token signature
      const tokenPayload = JSON.parse(
        Buffer.from(session.value.split('.')[1], 'base64').toString()
      );
      
      if (!tokenPayload.admin) {
        // Not admin - redirect to 404
        return NextResponse.redirect(new URL('/404', request.url));
      }
    } catch (error) {
      // Invalid token - redirect to 404
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

**Key Features:**
- Intercepts all `/admin/*` routes
- Checks authentication via session cookie
- Verifies Firebase custom claims for admin status
- Redirects unauthorized users to 404
- Includes comments for Phase 2 backend verification upgrade

### 2. Page Component (`app/admin/category/create/page.tsx`)

**Purpose:** Server component that renders the admin category creation page

**Type:** Server Component

**Implementation:**
```typescript
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { CategoryForm } from '@/components/admin/category-form';

export const metadata: Metadata = {
  title: 'Create Category | Admin',
  description: 'Create a new category for organizing life hacks',
};

export default function CreateCategoryPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Create category' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Category
          </h1>
          <p className="text-gray-600">
            Add a new category to organize life hacks
          </p>
        </div>

        <CategoryForm />
      </main>
      
      <Footer />
    </div>
  );
}
```

### 3. Category Form Component (`components/admin/category-form.tsx`)

**Purpose:** Client component with form logic, validation, and submission

**Type:** Client Component

**State Management:**
```typescript
interface FormState {
  categoryName: string;
  selectedFile: File | null;
  previewUrl: string | null;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: {
    categoryName?: string;
    image?: string;
  };
}
```

**Key Features:**
- Category name input with real-time validation
- Drag-and-drop image upload zone
- Image preview with remove functionality
- Form submission with two-step API flow
- Comprehensive error handling
- Loading states and disabled states during submission

**Validation Rules:**
- Category name: 2-100 characters, trimmed
- Image: Required, max 5MB, types: jpeg, png, gif, webp

**Component Structure:**
```typescript
'use client';

export function CategoryForm() {
  // State management
  const [formState, setFormState] = useState<FormState>({...});
  const { idToken } = useAuth();
  
  // Validation functions
  const validateCategoryName = (name: string) => {...};
  const validateImageFile = (file: File) => {...};
  
  // Event handlers
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {...};
  const handleFileSelect = (file: File) => {...};
  const handleDrop = (e: DragEvent) => {...};
  const handleRemoveImage = () => {...};
  const handleSubmit = async (e: FormEvent) => {...};
  
  // Render
  return (
    <form onSubmit={handleSubmit}>
      {/* Category Name Input */}
      {/* Image Upload Zone */}
      {/* Image Preview */}
      {/* Submit Button */}
      {/* Error Display */}
    </form>
  );
}
```

### 4. API Service Layer (`lib/api/admin-category.ts`)

**Purpose:** Encapsulate API calls with proper error handling

**Functions:**

```typescript
/**
 * Upload category image to S3
 */
export async function uploadCategoryImage(
  file: File,
  token: string
): Promise<CategoryImageDto> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories/images`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  
  if (!response.ok) {
    throw await handleApiError(response);
  }
  
  return response.json();
}

/**
 * Create category with image metadata
 */
export async function createCategory(
  data: CreateCategoryRequest,
  token: string
): Promise<CategoryResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) {
    throw await handleApiError(response);
  }
  
  return response.json();
}

/**
 * Handle API errors and convert to user-friendly messages
 */
async function handleApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    const errorData = await response.json();
    return {
      status: response.status,
      message: errorData.detail || errorData.title || 'An error occurred',
      errors: errorData.errors,
    };
  }
  
  return {
    status: response.status,
    message: 'An unexpected error occurred',
  };
}
```

### 5. Type Definitions (`lib/types/admin-category.ts`)

**Purpose:** TypeScript interfaces for type safety

```typescript
/**
 * Category image metadata from S3 upload
 */
export interface CategoryImageDto {
  imageUrl: string;
  imageStoragePath: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

/**
 * Request to create a new category
 */
export interface CreateCategoryRequest {
  name: string;
  image: CategoryImageDto;
}

/**
 * Category response from API
 */
export interface CategoryResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  image: CategoryImageDto;
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Form validation errors
 */
export interface ValidationErrors {
  categoryName?: string;
  image?: string;
}
```

## User Flow

### Happy Path: Successful Category Creation

1. **Access Page**
   - Admin user navigates to `/admin/category/create`
   - Middleware verifies authentication and admin status
   - Page renders with empty form

2. **Enter Category Name**
   - User types category name (e.g., "Productivity")
   - Real-time validation shows character count (12/100)
   - No validation errors

3. **Upload Image**
   - User drags image file onto upload zone
   - File validation passes (PNG, 2.3MB)
   - Image preview displays immediately
   - File name and size shown below preview

4. **Submit Form**
   - User clicks "Create Category" button
   - Button shows loading spinner
   - Form fields disabled

5. **Image Upload**
   - API call: `POST /api/admin/categories/images`
   - S3 upload completes successfully
   - Image metadata received

6. **Category Creation**
   - API call: `POST /api/admin/categories`
   - Category created with image metadata
   - Success response received

7. **Success State**
   - Success message displayed
   - Form resets to empty state
   - User can create another category

### Error Paths

**Path 1: Unauthorized Access**
- Non-admin user navigates to `/admin/category/create`
- Middleware detects missing admin claim
- User redirected to `/404`

**Path 2: Validation Error**
- User enters "A" (too short)
- Validation error: "Category name must be at least 2 characters"
- Submit button remains disabled

**Path 3: Image Upload Failure**
- User submits form
- Image upload fails (network error)
- Error message: "Failed to upload image. Please try again."
- Form remains filled, user can retry

**Path 4: Category Name Conflict**
- User submits form with existing category name
- Image uploads successfully
- Category creation returns 409 Conflict
- Error message: "Category with name 'Productivity' already exists"
- Form remains filled, user can change name

**Path 5: Backend Admin Verification Failure**
- User submits form
- Backend returns 403 Forbidden (admin verification failed)
- User redirected to `/404`

## Validation Logic

### Category Name Validation

```typescript
const CATEGORY_NAME_MIN_LENGTH = 2;
const CATEGORY_NAME_MAX_LENGTH = 100;

function validateCategoryName(name: string): string | null {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return 'Category name is required';
  }
  
  if (trimmed.length < CATEGORY_NAME_MIN_LENGTH) {
    return `Category name must be at least ${CATEGORY_NAME_MIN_LENGTH} characters`;
  }
  
  if (trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
    return `Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters`;
  }
  
  return null; // Valid
}
```

### Image File Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return `Image size cannot exceed ${sizeMB}MB`;
  }
  
  return null; // Valid
}
```

## Error Handling Strategy

### Error Types and User Messages

| Error Type | Status Code | User Message |
|------------|-------------|--------------|
| Network Error | N/A | "Unable to connect. Please check your internet connection." |
| Validation Error | 400 | Display specific field errors from API |
| Unauthorized | 403 | Redirect to 404 (handled by middleware) |
| Conflict | 409 | "Category with name '{name}' already exists" |
| Server Error | 500 | "Something went wrong. Please try again later." |
| Unknown Error | Other | "An unexpected error occurred. Please try again." |

### Error Display

- **Field-level errors:** Display below the relevant input field in red text
- **Form-level errors:** Display at the top of the form in a red alert box
- **API errors:** Parse error response and display user-friendly message
- **Accessibility:** All errors announced to screen readers via `role="alert"`

## Accessibility Features

### Keyboard Navigation
- Tab order: Name input → Upload zone → Remove button (if image) → Submit button
- Enter key submits form when focused on submit button
- Escape key clears image preview (if focused on remove button)

### Screen Reader Support
- All inputs have associated labels
- Error messages linked to inputs via `aria-describedby`
- Loading states announced via `aria-live="polite"`
- Success/error messages announced via `role="alert"`
- Image preview includes alt text with file name

### Visual Indicators
- Focus visible on all interactive elements
- High contrast error messages (red text on white background)
- Loading spinner with animation
- Disabled state clearly indicated (reduced opacity, cursor not-allowed)

## Responsive Design

### Mobile (< 640px)
- Single column layout
- Full-width form inputs
- Larger touch targets (min 44x44px)
- Stacked breadcrumb items

### Tablet (640px - 1024px)
- Centered form with max-width 600px
- Comfortable spacing between elements

### Desktop (> 1024px)
- Centered form with max-width 600px
- Optimal line length for readability
- Hover states on interactive elements

## Testing Strategy

### Unit Tests

**Middleware Tests** (`middleware.test.ts`)
- ✓ Allows access for authenticated admin users
- ✓ Redirects unauthenticated users to 404
- ✓ Redirects non-admin users to 404
- ✓ Only protects /admin/* routes
- ✓ Handles invalid tokens gracefully

**Form Component Tests** (`category-form.test.tsx`)
- ✓ Renders form with all fields
- ✓ Validates category name (too short, too long, empty)
- ✓ Validates image file (type, size)
- ✓ Shows character count for category name
- ✓ Displays image preview after selection
- ✓ Removes image when remove button clicked
- ✓ Disables submit button when form invalid
- ✓ Shows loading state during submission
- ✓ Displays success message after successful submission
- ✓ Displays error message on submission failure
- ✓ Handles drag-and-drop events
- ✓ Prevents form submission when already submitting

**API Service Tests** (`admin-category.test.ts`)
- ✓ Uploads image with correct headers and body
- ✓ Creates category with correct payload
- ✓ Handles 400 validation errors
- ✓ Handles 403 forbidden errors
- ✓ Handles 409 conflict errors
- ✓ Handles 500 server errors
- ✓ Handles network errors
- ✓ Parses error responses correctly

### Integration Tests

**End-to-End Flow** (`e2e/admin-category-creation.spec.ts`)
- ✓ Complete category creation flow (name + image + submit)
- ✓ Unauthorized access redirects to 404
- ✓ Form validation prevents invalid submission
- ✓ Error handling displays appropriate messages
- ✓ Success flow resets form

### Accessibility Tests

**Automated Checks**
- ✓ All form inputs have labels
- ✓ Error messages have role="alert"
- ✓ Focus order is logical
- ✓ Color contrast meets WCAG AA standards
- ✓ Interactive elements have sufficient size

**Manual Checks**
- ✓ Keyboard-only navigation works
- ✓ Screen reader announces all states
- ✓ Focus visible on all elements
- ✓ No keyboard traps

## Performance Considerations

### Image Preview Optimization
- Use `URL.createObjectURL()` for instant preview
- Revoke object URL when component unmounts
- No server upload until form submission

### Form Validation
- Debounce validation to avoid excessive re-renders
- Validate on blur for better UX
- Show validation errors only after user interaction

### API Calls
- Include timeout for API requests (30 seconds)
- Cancel pending requests on component unmount
- Retry logic for transient network errors (optional)

## Security Considerations

### Input Sanitization
- Category name trimmed before submission
- No HTML rendering of user input
- Backend performs additional validation

### Token Management
- Firebase ID token retrieved from auth context
- Token included in Authorization header
- Token not stored in localStorage or sessionStorage

### Error Messages
- Generic messages for server errors
- No sensitive information exposed
- Correlation IDs logged for debugging

## Future Enhancements (Phase 2)

### Backend Verification
Replace Firebase custom claims check with backend API:

```typescript
// middleware.ts - Phase 2
export async function middleware(request: NextRequest) {
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value;
    
    // Call backend to verify admin status
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (!response.ok) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    const user = await response.json();
    
    if (!user.isAdmin) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### Additional Features
- Image cropping before upload
- Category list/management page
- Category edit functionality
- Category deletion with confirmation
- Bulk operations
- Category reordering

## Constants and Configuration

```typescript
// lib/constants/admin-category.ts

export const CATEGORY_NAME_MIN_LENGTH = 2;
export const CATEGORY_NAME_MAX_LENGTH = 100;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
export const API_TIMEOUT_MS = 30000; // 30 seconds

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  CATEGORY_EXISTS: (name: string) => `Category with name '${name}' already exists`,
  NAME_REQUIRED: 'Category name is required',
  NAME_TOO_SHORT: `Category name must be at least ${CATEGORY_NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters`,
  IMAGE_REQUIRED: 'Please select an image',
  IMAGE_TYPE_INVALID: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
  IMAGE_SIZE_EXCEEDED: `Image size cannot exceed ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`,
};
```

## Reference Documentation

- API Schema: `#[[file:docs/api-schema.json]]`
- Firebase Custom Claims: https://firebase.google.com/docs/auth/admin/custom-claims
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- File API: https://developer.mozilla.org/en-US/docs/Web/API/File
- FormData: https://developer.mozilla.org/en-US/docs/Web/API/FormData
