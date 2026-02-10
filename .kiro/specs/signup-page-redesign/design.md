# Signup Page Redesign - Design Document

## 1. Architecture Overview

### 1.1 System Context
The signup page is the user registration entry point for the LifeHacking Tips application. It integrates with:
- **Firebase Authentication** - Handles user registration (Google OAuth, email/password)
- **Backend API** - CleanArchitecture API for user profile creation
- **Next.js App Router** - Client components for optimal interactivity
- **Existing Auth Context** - Reuses authentication infrastructure from login page

### 1.2 Design Principles
1. **Consistency** - Match login page design language exactly
2. **Component Reuse** - Leverage existing components wherever possible
3. **Separation of Concerns** - UI components separate from business logic
4. **Accessibility First** - WCAG 2.1 AA compliance from the start
5. **Type Safety** - Strict TypeScript for all components and utilities

### 1.3 Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-based configuration)
- **Authentication**: Firebase Authentication (already configured)
- **State Management**: React Context API (existing auth context)
- **Form Validation**: Zod (existing validation infrastructure)
- **Icons**: Material Icons Round

## 2. Component Architecture

### 2.1 Component Hierarchy

```
SignupPage (Client Component)
├── AuthNav (Reused Component - modified props)
│   └── Logo (Reused Component)
├── Main Content Area
│   ├── Decorative Elements (Static - same as login)
│   └── Signup Card
│       ├── SignupHeader (New Component - similar to LoginHeader)
│       ├── SocialLoginButton (Reused Component)
│       ├── Divider (Reused Component)
│       ├── SignupForm (New Component - similar to LoginForm)
│       └── LoginLink (New Component - similar to GuestLink)
└── AuthFooter (Reused Component)
```

### 2.2 Component Specifications

#### 2.2.1 SignupPage (`app/signup/page.tsx`)
**Type**: Client Component
**Responsibility**: Layout and composition
**Status**: ⏳ Needs Implementation

**Props**: None (page component)

**Behavior**:
- Renders the page layout with gradient background (same as login)
- Composes all child components
- Provides callback handlers for authentication actions
- Uses `useAuth()` hook for authentication methods
- Handles navigation to home page after successful signup

**Implementation**:
```typescript
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthNav } from "@/components/layout/auth-nav";
import { AuthFooter } from "@/components/layout/auth-footer";
import { SignupHeader } from "@/components/auth/signup-header";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { Divider } from "@/components/shared/divider";
import { SignupForm } from "@/components/auth/signup-form";
import { LoginLink } from "@/components/auth/login-link";

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithGoogle } = useAuth();

  const handleGoogleSignup = async () => {
    try {
      await signUpWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("Google signup failed:", error);
    }
  };

  const handleSignupSuccess = () => {
    router.push("/");
  };

  return (
    <div className="page-gradient min-h-screen flex flex-col antialiased selection:text-black selection:bg-primary">
      <AuthNav showSignupButton={false} showLoginButton={true} />
      
      <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Blur Circles - same as login */}
        <div 
          className="absolute top-1/4 left-10 w-72 h-72 rounded-full blur-3xl -z-10 mix-blend-multiply filter opacity-50 animate-pulse-slow"
          style={{ backgroundColor: 'rgba(43, 238, 43, 0.2)' }}
        ></div>
        <div 
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full blur-3xl -z-10 mix-blend-multiply filter opacity-50"
          style={{ backgroundColor: 'rgba(254, 240, 138, 0.4)' }}
        ></div>

        {/* Signup Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 relative z-10 border border-white/50 shadow-soft">
          <SignupHeader />

          <div className="space-y-3 mb-8">
            <SocialLoginButton provider="google" onLogin={handleGoogleSignup} />
          </div>

          <Divider text="Or sign up with email" />

          <div className="mt-6">
            <SignupForm onSuccess={handleSignupSuccess} />
          </div>

          <LoginLink />
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
```

#### 2.2.2 SignupHeader (`components/auth/signup-header.tsx`)
**Type**: Client Component
**Responsibility**: Display welcoming header for signup
**Status**: ⏳ Needs Implementation

**Props**: None

**Behavior**:
- Displays "Join Us!" heading
- Shows person_add icon in primary color circle
- Displays friendly subheading

**Implementation**:
```typescript
export function SignupHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-block p-3 rounded-full mb-4 bg-primary-light">
        <span className="material-icons-round text-3xl text-primary-dark">
          person_add
        </span>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        Join Us!
      </h1>
      <p className="text-gray-500">
        Start making life easier today!
      </p>
    </div>
  );
}
```

#### 2.2.3 SignupForm (`components/auth/signup-form.tsx`)
**Type**: Client Component
**Responsibility**: Email/password signup form
**Status**: ⏳ Needs Implementation

**Props**:
```typescript
interface SignupFormProps {
  onSuccess?: () => void;
}
```

**State**:
```typescript
{
  name: string;
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}
```

**Behavior**:
- Validates email format (HTML5 + Zod schema)
- Validates password requirements (min 8 chars)
- Name field is optional
- Calls `signUpWithEmail()` from auth context
- Displays user-friendly error messages
- Shows loading state during signup
- Calls `onSuccess` callback after successful signup

**Implementation**:
```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getFirebaseErrorMessage } from "@/lib/auth/auth-utils";

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUpWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUpWithEmail(email, password, name || undefined);
      onSuccess?.();
    } catch (err: any) {
      const errorCode = err?.code || "unknown";
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field (Optional) */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Display Name <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons-round text-gray-400">person</span>
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons-round text-gray-400">email</span>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons-round text-gray-400">lock</span>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Must be at least 8 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full font-bold py-3.5 px-4 rounded-xl text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed btn-bounce text-black transition-all bg-primary hover:bg-primary-dark shadow-soft hover:shadow-lg"
      >
        {loading ? (
          <>
            <span className="material-icons-round animate-spin">refresh</span>
            Creating account...
          </>
        ) : (
          <>
            Sign Up
            <span className="material-icons-round">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
```

#### 2.2.4 LoginLink (`components/auth/login-link.tsx`)
**Type**: Client Component
**Responsibility**: Link to login page for existing users
**Status**: ⏳ Needs Implementation

**Props**: None

**Behavior**:
- Displays "Already have an account?" text
- Provides link to `/login`
- Similar styling to `GuestLink` component

**Implementation**:
```typescript
import Link from "next/link";

export function LoginLink() {
  return (
    <div className="mt-8 text-center pt-6 border-t border-gray-100">
      <p className="text-sm text-gray-500 mb-3">Already have an account?</p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 text-gray-600 font-bold hover:text-primary transition-colors group"
      >
        Sign in
        <span className="material-icons-round group-hover:translate-x-1 transition-transform text-lg">
          arrow_right_alt
        </span>
      </Link>
    </div>
  );
}
```

#### 2.2.5 AuthNav Updates (`components/layout/auth-nav.tsx`)
**Type**: Client Component (existing)
**Responsibility**: Navigation bar with logo and auth buttons
**Status**: ⏳ Needs Update

**Props**:
```typescript
interface AuthNavProps {
  showSignupButton?: boolean;
  showLoginButton?: boolean;
}
```

**Changes**:
- Add `showLoginButton` prop (default: false)
- When `showLoginButton` is true, display "Sign In" button linking to `/login`
- Keep existing `showSignupButton` functionality

**Updated Implementation**:
```typescript
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

interface AuthNavProps {
  showSignupButton?: boolean;
  showLoginButton?: boolean;
}

export function AuthNav({ showSignupButton = true, showLoginButton = false }: AuthNavProps) {
  return (
    <nav className="w-full py-6 px-4 md:px-8 bg-transparent relative z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        
        {showSignupButton && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">
              New here?
            </span>
            <Link
              href="/signup"
              className="px-5 py-2 rounded-full bg-white text-gray-700 font-bold shadow-sm hover:shadow-md transition-all text-sm border border-gray-100"
            >
              Create Account
            </Link>
          </div>
        )}

        {showLoginButton && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">
              Have an account?
            </span>
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-white text-gray-700 font-bold shadow-sm hover:shadow-md transition-all text-sm border border-gray-100"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
```

### 2.3 Reused Components (No Changes)
- `AuthFooter` - Used as-is
- `SocialLoginButton` - Used as-is with different callback
- `Divider` - Used as-is with different text
- `Logo` - Used as-is

## 3. Authentication Context Updates

### 3.1 Add Signup Methods to Auth Context

**File**: `lib/auth/auth-context.tsx`

**New Methods**:

```typescript
// Add to AuthContextType interface
interface AuthContextType {
  // ... existing properties
  signUpWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
}

// Implementation in AuthProvider
const signUpWithGoogle = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Sign in with Google (Firebase)
    const user = await firebaseSignUpWithGoogle();
    
    // Get ID token
    const idToken = await user.getIdToken();
    
    // Create user in backend
    await createUserInBackend(idToken, {
      email: user.email!,
      name: user.displayName || undefined,
      externalAuthId: user.uid,
    });
    
    setUser(user);
    setIdToken(idToken);
  } catch (err: any) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

const signUpWithEmail = async (email: string, password: string, name?: string) => {
  try {
    setLoading(true);
    setError(null);
    
    // Create user with email/password (Firebase)
    const user = await firebaseSignUpWithEmail(email, password);
    
    // Get ID token
    const idToken = await user.getIdToken();
    
    // Create user in backend
    await createUserInBackend(idToken, {
      email,
      name,
      externalAuthId: user.uid,
    });
    
    setUser(user);
    setIdToken(idToken);
  } catch (err: any) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};
```

### 3.2 Add Firebase Signup Functions

**File**: `lib/auth/firebase-auth.ts`

**New Functions**:

```typescript
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function signUpWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signUpWithEmail(
  email: string, 
  password: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}
```

### 3.3 Add Backend User Creation Function

**File**: `lib/api/user.ts`

**New Function**:

```typescript
interface CreateUserPayload {
  email: string;
  name?: string;
  externalAuthId: string;
}

export async function createUserInBackend(
  idToken: string,
  payload: CreateUserPayload
): Promise<void> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const response = await fetch(`${apiBaseUrl}/api/User`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let backendMessage = "Failed to create user in backend";
    try {
      const problem = await response.json();
      if (problem && typeof problem.detail === "string") {
        backendMessage = problem.detail;
      }
    } catch {
      // Ignore JSON parse issues
    }
    throw new Error(backendMessage);
  }
}
```

## 4. Form Validation Schema

### 4.1 Signup Schema

**File**: `lib/schemas/signup-schema.ts` (new file)

```typescript
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string()
    .max(100, "Name is too long")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type SignupFormData = z.infer<typeof signupSchema>;
```

## 5. Error Handling

### 5.1 Firebase Error Mapping Updates

**File**: `lib/auth/auth-utils.ts`

**Add New Error Codes**:

```typescript
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // ... existing error codes
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password': 'Password is too weak. Please use a stronger password',
  'auth/operation-not-allowed': 'Email/password accounts are not enabled',
};
```

## 6. File Structure

### 6.1 New Files to Create

```
components/
└── auth/
    ├── signup-header.tsx         # New component
    ├── signup-form.tsx           # New component
    └── login-link.tsx            # New component

lib/
└── schemas/
    └── signup-schema.ts          # New validation schema
```

### 6.2 Files to Update

```
app/
└── signup/
    └── page.tsx                  # Complete redesign

components/
└── layout/
    └── auth-nav.tsx              # Add showLoginButton prop

lib/
├── auth/
│   ├── auth-context.tsx          # Add signup methods
│   ├── firebase-auth.ts          # Add signup functions
│   └── auth-utils.ts             # Add signup error codes
└── api/
    └── user.ts                   # Add createUserInBackend function
```

## 7. Correctness Properties

### 7.1 Form Validation Properties

**Property 1.1: Email Validation**
```
For all strings s:
  If s is a valid email format (contains @ and domain),
  then signupSchema.parse({ email: s, password: "valid123", name: "" }) succeeds
  
If s is not a valid email format,
  then signupSchema.parse({ email: s, password: "valid123", name: "" }) throws ZodError
```
**Validates**: Requirements AC-3.9

**Property 1.2: Password Length**
```
For all strings p:
  If length(p) >= 8 and length(p) <= 100,
  then signupSchema.parse({ email: "test@example.com", password: p, name: "" }) succeeds
  
If length(p) < 8 or length(p) > 100,
  then signupSchema.parse({ email: "test@example.com", password: p, name: "" }) throws ZodError
```
**Validates**: Requirements AC-3.10

**Property 1.3: Optional Name Field**
```
For all strings n (including empty string):
  signupSchema.parse({ email: "test@example.com", password: "valid123", name: n }) succeeds
  
Name field can be omitted:
  signupSchema.parse({ email: "test@example.com", password: "valid123" }) succeeds
```
**Validates**: Requirements AC-3.2

### 7.2 Authentication Properties

**Property 2.1: Google Signup Creates Backend User**
```
For all successful Google signups:
  After signUpWithGoogle() completes,
  Backend user exists with:
    - email from Google account
    - name from Google displayName
    - externalAuthId from Firebase UID
```
**Validates**: Requirements AC-2.6

**Property 2.2: Email Signup Creates Backend User**
```
For all successful email signups:
  After signUpWithEmail(email, password, name) completes,
  Backend user exists with:
    - email from form
    - name from form (or undefined if not provided)
    - externalAuthId from Firebase UID
```
**Validates**: Requirements AC-3.12

**Property 2.3: Signup Redirect**
```
For all successful signups (Google or email):
  User is redirected to home page ("/") within 2 seconds
```
**Validates**: Requirements AC-2.7, AC-3.13

### 7.3 UI State Properties

**Property 3.1: Loading State Consistency**
```
For all signup operations:
  When operation starts, loading = true and form is disabled
  When operation completes (success or error), loading = false and form is enabled
```
**Validates**: Requirements AC-2.3, AC-3.8

**Property 3.2: Error Display**
```
For all signup errors e:
  If e occurs, then error message is displayed within 100ms
  Error message is non-empty and user-friendly
  Error message is announced to screen readers (aria-live)
```
**Validates**: Requirements AC-3.11, AC-6.6

### 7.4 Accessibility Properties

**Property 4.1: Keyboard Navigation**
```
For all interactive elements e:
  e is reachable via Tab key
  e has visible focus indicator when focused
  e can be activated via Enter or Space key
```
**Validates**: Requirements AC-6.2, AC-6.4

**Property 4.2: Form Labels**
```
For all form inputs i:
  i has an associated label element
  Label is properly linked via htmlFor attribute
  Label text is descriptive and clear
```
**Validates**: Requirements AC-6.1

**Property 4.3: Color Contrast**
```
For all text elements t:
  Contrast ratio between t and background >= 4.5:1
```
**Validates**: Requirements AC-6.3

## 8. Implementation Checklist

### Phase 1: Component Creation (1 day)

- [ ] Create `components/auth/signup-header.tsx`
- [ ] Create `components/auth/signup-form.tsx`
- [ ] Create `components/auth/login-link.tsx`
- [ ] Create `lib/schemas/signup-schema.ts`
- [ ] Update `components/layout/auth-nav.tsx` with `showLoginButton` prop

### Phase 2: Authentication Logic (1 day)

- [ ] Add `signUpWithGoogle()` to `lib/auth/firebase-auth.ts`
- [ ] Add `signUpWithEmail()` to `lib/auth/firebase-auth.ts`
- [ ] Add `createUserInBackend()` to `lib/api/user.ts`
- [ ] Update `lib/auth/auth-context.tsx` with signup methods
- [ ] Add signup error codes to `lib/auth/auth-utils.ts`

### Phase 3: Page Implementation (1 day)

- [ ] Redesign `app/signup/page.tsx` with new layout
- [ ] Integrate all components
- [ ] Add Google signup handler
- [ ] Add email signup handler
- [ ] Add navigation handlers
- [ ] Test all flows manually

### Phase 4: Testing & Polish (1 day)

- [ ] Write unit tests for signup components
- [ ] Write property tests for validation schema
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Test responsive design on all breakpoints
- [ ] Test error scenarios (duplicate email, weak password, network errors)
- [ ] Run Lighthouse audit
- [ ] Fix any bugs found during testing

## 9. Success Criteria

### 9.1 Functional Requirements
- ✅ All user stories (US-1 through US-6) are implemented
- ✅ All acceptance criteria are met
- ✅ Visual consistency with login page: 100%

### 9.2 Quality Requirements
- ✅ Zero TypeScript errors
- ✅ All unit tests pass
- ✅ All property tests pass
- ✅ Zero accessibility violations (axe DevTools)
- ✅ Lighthouse Accessibility score: 100

### 9.3 User Experience
- ✅ Page loads in < 2 seconds
- ✅ Google signup completes in < 5 seconds
- ✅ Email signup completes in < 3 seconds
- ✅ All animations match login page
- ✅ No layout shift (CLS < 0.1)

## 10. Future Enhancements

### 10.1 Phase 2: Advanced Features (Future)
- Email verification after signup
- Password strength indicator
- Terms of service checkbox
- Privacy policy checkbox
- Profile picture upload

### 10.2 Phase 3: Optimization (Future)
- Server-side rendering for initial page load
- Prefetch authentication resources
- Add analytics tracking for signup funnel
- A/B testing for signup conversion

---

**Design Status**: ✅ Complete and ready for implementation

**Next Steps**: Create `tasks.md` with detailed implementation tasks based on this design.
