# Login Page Redesign - Design Document

## 1. Architecture Overview

### 1.1 System Context
The login page is the entry point for authenticated users in the LifeHacking Tips application. It integrates with:
- **Firebase Authentication** - Handles user authentication (Google OAuth, email/password)
- **Backend API** - CleanArchitecture API for user profile management
- **Next.js App Router** - Server and client components for optimal performance

### 1.2 Design Principles
1. **Separation of Concerns** - UI components separate from business logic
2. **Reusability** - Leverage existing Firebase configuration and auth utilities
3. **Progressive Enhancement** - Works without JavaScript, enhanced with it
4. **Accessibility First** - WCAG 2.1 AA compliance from the start
5. **Type Safety** - Strict TypeScript for all components and utilities

### 1.3 Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-based configuration)
- **Authentication**: Firebase Authentication (already configured)
- **State Management**: React Context API
- **Form Validation**: React Hook Form + Zod
- **Icons**: Material Icons Round

## 2. Component Architecture

### 2.1 Component Hierarchy

```
LoginPage (Server Component)
├── AuthNav (Client Component)
│   └── Logo (Client Component)
├── Main Content Area
│   ├── Decorative Elements (Static)
│   └── Login Card
│       ├── LoginHeader (Client Component)
│       ├── SocialLoginButton (Client Component)
│       ├── Divider (Client Component)
│       ├── LoginForm (Client Component)
│       └── GuestLink (Client Component)
└── AuthFooter (Client Component)
```

### 2.2 Component Specifications

#### 2.2.1 LoginPage (`app/login/page.tsx`)
**Type**: Server Component (default)
**Responsibility**: Layout and composition
**Status**: ✅ Implemented (Phase 2)

**Props**: None (page component)

**Behavior**:
- Renders the page layout with gradient background
- Composes all child components
- Provides callback handlers for authentication actions

#### 2.2.2 LoginForm (`components/auth/login-form.tsx`)
**Type**: Client Component
**Responsibility**: Email/password authentication form
**Status**: ✅ UI Complete, ⏳ Logic Pending (Phase 3)

**Props**:
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
}
```

**State**:
```typescript
{
  email: string;
  password: string;
  rememberMe: boolean;
  error: string | null;
  loading: boolean;
}
```

**Behavior**:
- Validates email format (HTML5 + Zod schema)
- Validates password requirements
- Calls Firebase `signInWithEmailAndPassword`
- Displays user-friendly error messages
- Shows loading state during authentication
- Calls `onSuccess` callback after successful login

#### 2.2.3 SocialLoginButton (`components/auth/social-login-button.tsx`)
**Type**: Client Component
**Responsibility**: Google OAuth authentication
**Status**: ✅ UI Complete, ⏳ Logic Pending (Phase 3)

**Props**:
```typescript
interface SocialLoginButtonProps {
  provider: "google";
  onLogin: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}
```

**Behavior**:
- Calls Firebase `signInWithPopup` with GoogleAuthProvider
- Handles popup blocked errors
- Shows loading state during authentication
- Displays error messages if authentication fails

#### 2.2.4 AuthNav (`components/layout/auth-nav.tsx`)
**Type**: Client Component
**Responsibility**: Navigation bar with logo and signup link
**Status**: ✅ Implemented (Phase 2)

**Props**: None

**Behavior**:
- Displays logo and brand name
- Provides link to signup page
- Responsive: hides "New here?" text on mobile

#### 2.2.5 Other Components
All other components (LoginHeader, Divider, GuestLink, AuthFooter, Logo) are complete and require no changes.

### 2.3 Home Page Component Architecture

#### 2.3.1 HomePage (`app/page.tsx`)
**Type**: Client Component
**Responsibility**: Display coming soon page or authenticated user welcome
**Status**: ⏳ Needs Implementation

**Props**: None (page component)

**Behavior**:
- Uses `useAuth()` hook to check authentication state
- For unauthenticated users: displays ComingSoon component
- For authenticated users: displays personalized welcome message with user name
- Shows loading state while checking authentication

#### 2.3.2 ComingSoon (`components/home/coming-soon.tsx`)
**Type**: Client Component
**Responsibility**: Display coming soon message with branding
**Status**: ⏳ Needs Implementation

**Props**: None

**Behavior**:
- Displays logo and application branding
- Shows "Coming Soon" heading with subtitle
- Provides prominent link/button to login page
- Uses consistent design language with login page (gradient, colors)
- Fully responsive design

## 3. Authentication Flow

### 3.1 Google OAuth Flow

```
User clicks "Continue with Google"
    ↓
SocialLoginButton calls onLogin()
    ↓
firebase-auth.ts: signInWithGoogle()
    ↓
Firebase: signInWithPopup(GoogleAuthProvider)
    ↓
Success: User object returned
    ↓
Get Firebase ID token
    ↓
Check if user exists in backend (GET /api/User/me)
    ↓
If 404: Create user (POST /api/User)
    ↓
Store auth state in Context
    ↓
Redirect to home page
```

### 3.2 Email/Password Flow

```
User submits form
    ↓
LoginForm validates inputs (Zod schema)
    ↓
firebase-auth.ts: signInWithEmail()
    ↓
Firebase: signInWithEmailAndPassword()
    ↓
Success: User object returned
    ↓
Get Firebase ID token
    ↓
Check if user exists in backend (GET /api/User/me)
    ↓
If 404: Create user (POST /api/User)
    ↓
Store auth state in Context
    ↓
Redirect to home page
```

### 3.3 Guest Flow

```
User clicks "Continue as Guest"
    ↓
Navigate to home page (/)
    ↓
No authentication required
```

## 4. Data Models

### 4.1 Firebase User
```typescript
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}
```

### 4.2 Auth Context State
```typescript
interface AuthContextState {
  user: FirebaseUser | null;
  idToken: string | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### 4.3 Form Validation Schema
```typescript
const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

### 4.4 Backend User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  // Additional fields from backend
}
```

## 5. File Structure & Implementation Plan

### 5.1 New Files to Create (Phase 3)

```
lib/
├── auth/
│   ├── firebase-auth.ts          # Firebase auth functions (NEW)
│   ├── auth-context.tsx          # Auth context provider (NEW)
│   └── auth-utils.ts             # Auth utility functions (NEW)
├── api/
│   └── user.ts                   # User API functions (NEW)
└── schemas/
    └── login-schema.ts           # Zod validation schemas (NEW)
```

### 5.2 Files to Update (Phase 3)

```
app/
├── login/
│   └── page.tsx                  # Add auth context, handlers (UPDATE)
└── layout.tsx                    # Wrap with AuthProvider (UPDATE)

components/
└── auth/
    ├── login-form.tsx            # Connect to auth context (UPDATE)
    └── social-login-button.tsx  # Connect to auth context (UPDATE)
```

### 5.3 Existing Files to Reuse

```
lib/
└── firebase.ts                   # ✅ Already configured, reuse as-is
```

### 5.4 Home Page Files (New)

```
app/
└── page.tsx                      # Update with coming soon design (UPDATE)

components/
└── home/
    └── coming-soon.tsx           # Coming soon component (NEW)
```

## 6. Authentication Logic Design

### 6.1 Firebase Auth Functions (`lib/auth/firebase-auth.ts`)

```typescript
// Reuse existing Firebase instance from lib/firebase.ts
import { auth } from '@/lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmail(
  email: string, 
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getIdToken(user: User): Promise<string> {
  return await user.getIdToken();
}
```

### 6.2 Auth Context (`lib/auth/auth-context.tsx`)

**Purpose**: Centralized authentication state management

**Features**:
- Listens to Firebase auth state changes
- Provides auth methods to all components
- Manages loading and error states
- Handles backend user profile synchronization

**API**:
```typescript
const { 
  user, 
  idToken, 
  loading, 
  error,
  signInWithGoogle,
  signInWithEmail,
  signOut 
} = useAuth();
```

### 6.3 User API Functions (`lib/api/user.ts`)

```typescript
export async function getUserProfile(idToken: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/User/me`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return response.json();
}

export async function createUser(idToken: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/User`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
}
```

## 7. Error Handling Strategy

### 7.1 Firebase Error Mapping

```typescript
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site',
  'auth/popup-closed-by-user': 'Sign-in was cancelled',
  'auth/network-request-failed': 'Network error. Please check your connection',
};

export function getFirebaseErrorMessage(code: string): string {
  return FIREBASE_ERROR_MESSAGES[code] || 'An error occurred. Please try again';
}
```

### 7.2 Error Display Strategy

1. **Form Validation Errors**: Display inline below each field
2. **Authentication Errors**: Display in error banner below form
3. **Network Errors**: Display with retry button
4. **Backend Errors**: Display user-friendly message, log details

## 8. Accessibility Implementation

### 8.1 Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows visual flow
- Focus indicators are visible (2px primary color ring)
- Escape key closes error messages

### 8.2 Screen Reader Support
- All form inputs have proper labels
- Error messages are announced via `aria-live="polite"`
- Loading states are announced
- Button states are announced (loading, disabled)

### 8.3 ARIA Attributes
```typescript
// Form field with error
<input
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}

// Loading button
<button aria-busy={loading} disabled={loading}>
  {loading ? "Signing in..." : "Sign in"}
</button>
```

## 9. Performance Optimization

### 9.1 Code Splitting
- Auth context loaded only when needed
- Firebase auth SDK loaded on demand
- Form validation library (Zod) bundled separately

### 9.2 Image Optimization
- Google logo embedded as SVG (no external request)
- Material Icons loaded from Google Fonts CDN with `display=swap`

### 9.3 Loading States
- Skeleton loaders for async operations
- Optimistic UI updates where possible
- Debounced form validation (300ms)

## 10. Security Considerations

### 10.1 Token Management
- Firebase ID tokens stored in memory only (not localStorage)
- Tokens refreshed automatically by Firebase SDK
- Tokens sent to backend via Authorization header

### 10.2 Input Validation
- Client-side validation with Zod
- Server-side validation on backend (defense in depth)
- XSS protection via React's automatic escaping

### 10.3 HTTPS Only
- All API requests use HTTPS
- Firebase auth requires HTTPS in production
- Secure cookies for session management

## 11. Testing Strategy

### 11.1 Unit Tests
- Test each component in isolation
- Mock Firebase auth functions
- Test form validation logic
- Test error handling

### 11.2 Integration Tests
- Test complete authentication flows
- Test backend API integration
- Test error scenarios (network failures, invalid credentials)

### 11.3 Property-Based Tests
See section 12 for correctness properties.

### 11.4 Accessibility Tests
- Automated: axe DevTools, Lighthouse
- Manual: Keyboard navigation, screen reader testing
- Color contrast verification

## 12. Correctness Properties

### 12.1 Authentication Properties

**Property 1.1: Email Validation**
```
For all strings s:
  If s is a valid email format (contains @ and domain),
  then loginSchema.parse({ email: s, password: "valid123" }) succeeds
  
If s is not a valid email format,
  then loginSchema.parse({ email: s, password: "valid123" }) throws ZodError
```
**Validates**: Requirements AC-3.9

**Property 1.2: Password Length**
```
For all strings p:
  If length(p) >= 8 and length(p) <= 100,
  then loginSchema.parse({ email: "test@example.com", password: p }) succeeds
  
If length(p) < 8 or length(p) > 100,
  then loginSchema.parse({ email: "test@example.com", password: p }) throws ZodError
```
**Validates**: Requirements AC-3.9

**Property 1.3: Firebase Error Mapping**
```
For all Firebase error codes c:
  getFirebaseErrorMessage(c) returns a non-empty string
  
For all known error codes c in FIREBASE_ERROR_MESSAGES:
  getFirebaseErrorMessage(c) returns a user-friendly message (not the code itself)
```
**Validates**: Requirements TR-5

### 12.2 UI State Properties

**Property 2.1: Loading State Consistency**
```
For all authentication operations:
  When operation starts, loading = true and button is disabled
  When operation completes (success or error), loading = false and button is enabled
  
Invariant: loading state never remains true indefinitely (timeout after 30s)
```
**Validates**: Requirements AC-2.3, AC-3.8

**Property 2.2: Error Display**
```
For all authentication errors e:
  If e occurs, then error message is displayed within 100ms
  Error message is non-empty and user-friendly
  Error message is announced to screen readers (aria-live)
```
**Validates**: Requirements AC-3.10, AC-6.6

**Property 2.3: Form Validation Feedback**
```
For all form fields f:
  If f is invalid and touched, then error message is displayed
  If f becomes valid, then error message is cleared
  Error messages are specific to the validation failure
```
**Validates**: Requirements AC-3.9, AC-3.10

### 12.3 Navigation Properties

**Property 3.1: Successful Login Redirect**
```
For all successful authentication operations:
  User is redirected to home page ("/") within 2 seconds
  Navigation preserves any "returnTo" query parameter
```
**Validates**: Requirements AC-2.5

**Property 3.2: Guest Navigation**
```
When "Continue as Guest" is clicked:
  User is navigated to home page ("/") immediately
  No authentication state is created
```
**Validates**: Requirements AC-4.5

### 12.4 Accessibility Properties

**Property 4.1: Keyboard Navigation**
```
For all interactive elements e:
  e is reachable via Tab key
  e has visible focus indicator when focused
  e can be activated via Enter or Space key
```
**Validates**: Requirements AC-6.2, AC-6.4

**Property 4.2: Screen Reader Announcements**
```
For all state changes s (loading, error, success):
  s is announced to screen readers within 100ms
  Announcement text is descriptive and actionable
```
**Validates**: Requirements AC-6.5, AC-6.6

**Property 4.3: Color Contrast**
```
For all text elements t:
  Contrast ratio between t and background >= 4.5:1
  
For all interactive elements i:
  Contrast ratio in all states (default, hover, focus) >= 4.5:1
```
**Validates**: Requirements AC-6.3

### 12.5 Performance Properties

**Property 5.1: Page Load Time**
```
For all page loads:
  Time to interactive (TTI) < 2 seconds on 3G connection
  Largest Contentful Paint (LCP) < 2.5 seconds
```
**Validates**: Requirements Success Metrics

**Property 5.2: Authentication Time**
```
For all Google OAuth operations:
  Time from click to redirect < 5 seconds (excluding user interaction)
  
For all email/password operations:
  Time from submit to redirect < 3 seconds
```
**Validates**: Requirements Success Metrics

## 13. Implementation Checklist

### Phase 3: Functionality (3 days)

#### Day 1: Authentication Setup
- [ ] Create `lib/auth/firebase-auth.ts` with auth functions
- [ ] Create `lib/schemas/login-schema.ts` with Zod validation
- [ ] Create `lib/auth/auth-utils.ts` with error mapping
- [ ] Write unit tests for auth functions
- [ ] Write property tests for validation schema (Property 1.1, 1.2)

#### Day 2: Context & Integration
- [ ] Create `lib/auth/auth-context.tsx` with AuthProvider
- [ ] Create `lib/api/user.ts` with API functions
- [ ] Update `app/layout.tsx` to wrap with AuthProvider
- [ ] Update `app/login/page.tsx` to use auth context
- [ ] Write integration tests for auth flow

#### Day 3: Component Integration
- [ ] Update `components/auth/login-form.tsx` with validation
- [ ] Update `components/auth/social-login-button.tsx` with Google OAuth
- [ ] Add error handling and user feedback
- [ ] Add redirect logic after successful login
- [ ] Write property tests for UI states (Property 2.1, 2.2, 2.3)
- [ ] Manual testing of all flows

### Phase 4: Testing & Polish (2 days)

#### Day 1: Testing
- [ ] Run all unit tests and property tests
- [ ] Run accessibility tests (axe DevTools)
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements
- [ ] Test responsive design on all breakpoints
- [ ] Write property tests for accessibility (Property 4.1, 4.2, 4.3)

#### Day 2: Polish & Deploy
- [ ] Fix any bugs found during testing
- [ ] Optimize performance (Lighthouse audit)
- [ ] Write property tests for performance (Property 5.1, 5.2)
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Final QA and production deployment

## 14. Dependencies & Prerequisites

### 14.1 Environment Variables
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 14.2 Firebase Console Setup
1. Enable Google Sign-In provider
2. Add authorized domains (localhost, production domain)
3. Configure OAuth consent screen
4. Add test users for development

### 14.3 Backend API Requirements
- `GET /api/User/me` - Returns user profile or 404
- `POST /api/User` - Creates new user profile
- Both endpoints accept `Authorization: Bearer <firebase-id-token>`

## 15. Success Criteria

### 15.1 Functional Requirements
- ✅ All user stories (US-1 through US-6) are implemented
- ✅ All acceptance criteria are met
- ✅ All technical requirements (TR-1 through TR-5) are satisfied

### 15.2 Quality Requirements
- ✅ Zero TypeScript errors
- ✅ All unit tests pass
- ✅ All property tests pass
- ✅ Zero accessibility violations (axe DevTools)
- ✅ Lighthouse Accessibility score: 100
- ✅ Lighthouse Performance score: > 90

### 15.3 User Experience
- ✅ Page loads in < 2 seconds
- ✅ Google login completes in < 5 seconds
- ✅ Email login completes in < 3 seconds
- ✅ All animations are smooth (60fps)
- ✅ No layout shift (CLS < 0.1)

## 16. Future Enhancements

### 16.1 Phase 5: Advanced Features (Future)
- Password reset functionality
- Two-factor authentication
- Social login providers (Facebook, Apple)
- Remember me persistence (secure cookie)
- Dark mode support

### 16.2 Phase 6: Optimization (Future)
- Server-side rendering for initial page load
- Prefetch authentication resources
- Implement rate limiting on client side
- Add analytics tracking

---

**Design Status**: ✅ Complete and ready for implementation

**Next Steps**: Create `tasks.md` with detailed implementation tasks based on this design.
