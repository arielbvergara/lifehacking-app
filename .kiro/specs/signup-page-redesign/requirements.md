# Signup Page Redesign - Requirements

## Overview
Redesign the signup page to match the modern, friendly design of the login page. The new design will feature the same vibrant green color scheme, improved UX with Google signup option, and consistent visual language across authentication pages.

## User Stories

### US-1: As a visitor, I want to see a welcoming signup page
**Acceptance Criteria:**
- AC-1.1: Page displays "Join Us!" heading with a celebration emoji icon (🎉 or person_add icon)
- AC-1.2: Page includes friendly subheading "Start making life easier today!"
- AC-1.3: Background has the same gradient as login page (light green to white)
- AC-1.4: Page includes decorative blur circles for visual interest (matching login page)
- AC-1.5: Signup form is centered in a rounded card with soft shadow (matching login page)

### US-2: As a visitor, I want to sign up with Google
**Acceptance Criteria:**
- AC-2.1: "Continue with Google" button is prominently displayed above email signup
- AC-2.2: Button includes Google logo and proper branding (reuse existing component)
- AC-2.3: Button has hover and active states with smooth animations
- AC-2.4: Clicking the button initiates Firebase Google authentication
- AC-2.5: Google account name is automatically used as display name
- AC-2.6: After successful Google signup, user account is created in backend
- AC-2.7: User is redirected to home page after successful signup

### US-3: As a visitor, I want to sign up with email and password
**Acceptance Criteria:**
- AC-3.1: Name input field has a person icon on the left
- AC-3.2: Name field is optional (can be left empty)
- AC-3.3: Email input field has an email icon on the left
- AC-3.4: Password input field has a lock icon on the left
- AC-3.5: All fields have placeholder text and proper labels
- AC-3.6: Fields have focus states with primary color ring
- AC-3.7: "Sign Up" button is styled with primary green color
- AC-3.8: Button includes arrow icon and bounce animation on click
- AC-3.9: Form validates email format before submission
- AC-3.10: Form validates password requirements (min 8 characters)
- AC-3.11: Error messages are displayed clearly below the form
- AC-3.12: After successful signup, user account is created in backend
- AC-3.13: User is redirected to home page after successful signup

### US-4: As a visitor, I want to navigate to login page
**Acceptance Criteria:**
- AC-4.1: Navigation bar includes "Sign In" button in top right
- AC-4.2: "Already have an account? Sign in" link is displayed at bottom of form
- AC-4.3: Both options have hover states and smooth transitions
- AC-4.4: Clicking "Sign In" button navigates to `/login`
- AC-4.5: Clicking "Sign in" link navigates to `/login`

### US-5: As a visitor, I want the page to be responsive
**Acceptance Criteria:**
- AC-5.1: Page layout adapts to mobile, tablet, and desktop screens
- AC-5.2: Form card maintains readability on all screen sizes
- AC-5.3: Navigation collapses appropriately on mobile
- AC-5.4: Touch targets are at least 44x44px on mobile
- AC-5.5: Text remains readable without horizontal scrolling

### US-6: As a visitor, I want the page to be accessible
**Acceptance Criteria:**
- AC-6.1: All form inputs have proper labels
- AC-6.2: Focus indicators are visible on all interactive elements
- AC-6.3: Color contrast meets WCAG 2.1 AA standards (4.5:1)
- AC-6.4: Page is navigable via keyboard only
- AC-6.5: Screen readers can announce all content correctly
- AC-6.6: Form validation errors are announced to screen readers

## Design Specifications

### Color Palette
Reuse the same color palette from login page:
```typescript
colors: {
  primary: "#2bee2b",           // Vibrant green
  primaryDark: "#1fa81f",       // Darker green for hover
  primaryLight: "#eaffea",      // Light green background
  backgroundLight: "#f6f8f6",   // Page background
  softGray: "#f0f2f0",          // Soft gray accents
  textMain: "#1a2e1a",          // Dark green text
}
```

### Typography
Same as login page:
- Font Family: "Plus Jakarta Sans" (fallback: system sans-serif)
- Heading: 3xl (1.875rem), extrabold (800)
- Subheading: base, regular (400), gray-500
- Labels: sm, bold (700)
- Buttons: base, bold (700)

### Spacing & Layout
Same as login page:
- Form card: max-width 28rem (448px)
- Card padding: 2.5rem (40px) on desktop, 2rem (32px) on mobile
- Card border-radius: 1.5rem (24px)
- Input height: 3rem (48px)
- Button height: 3.5rem (56px)
- Gap between elements: 1.25rem (20px)

### Animations
Same as login page:
- Button bounce: scale(0.95) on active
- Hover lift: translateY(-2px) on button hover
- Focus ring: 2px solid primary color
- Transition duration: 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)

## Technical Requirements

### TR-1: Component Reuse
- Reuse `AuthNav` component with custom "Sign In" button
- Reuse `AuthFooter` component as-is
- Reuse `SocialLoginButton` component for Google signup
- Reuse `Divider` component with "Or sign up with email" text
- Create `SignupHeader` component (similar to `LoginHeader`)
- Create `SignupForm` component (similar to `LoginForm`)

### TR-2: Authentication Integration
- Use existing `useAuth()` context from `lib/auth/auth-context.tsx`
- Add `signUpWithGoogle()` method to auth context
- Add `signUpWithEmail(email, password, name?)` method to auth context
- Both methods should create backend user profile automatically
- Reuse existing Firebase configuration from `lib/firebase.ts`

### TR-3: Form Validation
- Reuse existing validation utilities from `lib/schemas/login-schema.ts`
- Create `signupSchema` with optional name field
- Email validation: required, valid email format
- Password validation: required, min 8 characters, max 100 characters
- Name validation: optional, max 100 characters

### TR-4: API Integration
- After successful Firebase signup, call `POST /api/User` to create user profile
- Send user data: email, name (from form or Google), externalAuthId (Firebase UID)
- Store JWT token from Firebase
- Handle backend errors gracefully

### TR-5: Error Handling
- Display Firebase authentication errors in user-friendly format
- Handle "email already in use" error specifically
- Handle network errors gracefully
- Show loading states during authentication
- Reuse error mapping from `lib/auth/auth-utils.ts`

## Component Architecture

### New Components

#### SignupHeader (`components/auth/signup-header.tsx`)
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

#### SignupForm (`components/auth/signup-form.tsx`)
- Similar structure to `LoginForm`
- Three fields: name (optional), email, password
- No "Remember me" checkbox
- No "Forgot password" link
- Submit button text: "Sign Up"
- Uses `signUpWithEmail()` from auth context

### Reused Components
- `AuthNav` - with `showSignupButton={false}` and custom "Sign In" button
- `AuthFooter` - no changes
- `SocialLoginButton` - with `onLogin={handleGoogleSignup}`
- `Divider` - with `text="Or sign up with email"`

## Authentication Flow

### Google Signup Flow
```
User clicks "Continue with Google"
    ↓
SocialLoginButton calls onSignup()
    ↓
auth-context: signUpWithGoogle()
    ↓
Firebase: signInWithPopup(GoogleAuthProvider)
    ↓
Success: User object returned with displayName
    ↓
Get Firebase ID token
    ↓
Create user in backend (POST /api/User)
    - email: from Google account
    - name: from Google displayName
    - externalAuthId: Firebase UID
    ↓
Store auth state in Context
    ↓
Redirect to home page (/)
```

### Email/Password Signup Flow
```
User submits form
    ↓
SignupForm validates inputs (Zod schema)
    ↓
auth-context: signUpWithEmail(email, password, name)
    ↓
Firebase: createUserWithEmailAndPassword()
    ↓
Success: User object returned
    ↓
Get Firebase ID token
    ↓
Create user in backend (POST /api/User)
    - email: from form
    - name: from form (optional)
    - externalAuthId: Firebase UID
    ↓
Store auth state in Context
    ↓
Redirect to home page (/)
```

## Out of Scope
- Email verification (future enhancement)
- Password strength indicator (future enhancement)
- Terms of service checkbox (future enhancement)
- Social signup providers other than Google
- Profile picture upload during signup

## Success Metrics
- Signup page loads in < 2 seconds
- Google signup completes in < 5 seconds
- Email signup completes in < 3 seconds
- Zero accessibility violations (axe DevTools)
- Lighthouse Accessibility score: 100
- Mobile usability score: 100
- Visual consistency with login page: 100%

## Dependencies
- Firebase project must be configured
- Backend API must be running
- Google OAuth credentials must be set up
- Login page redesign must be complete (for component reuse)

## References
- Login page spec: `.kiro/specs/login-page-redesign/`
- Existing signup page: `app/signup/page.tsx`
- Auth context: `lib/auth/auth-context.tsx`
- API schema: `docs/api-schema.json`
