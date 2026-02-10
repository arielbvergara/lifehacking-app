# Login Page Redesign - Requirements

## Overview
Redesign the login page to match the modern, friendly design template provided in `docs/design-templates/login-page/`. The new design features a vibrant green color scheme, improved UX with social login options, and a more welcoming aesthetic.

## User Stories

### US-1: As a visitor, I want to see a welcoming login page
**Acceptance Criteria:**
- AC-1.1: Page displays "Welcome Back!" heading with a waving hand emoji icon
- AC-1.2: Page includes friendly subheading "Ready to make life easier today?"
- AC-1.3: Background has a subtle gradient (light green to white)
- AC-1.4: Page includes decorative blur circles for visual interest
- AC-1.5: Login form is centered in a rounded card with soft shadow

### US-2: As a visitor, I want to log in with Google
**Acceptance Criteria:**
- AC-2.1: "Continue with Google" button is prominently displayed above email login
- AC-2.2: Button includes Google logo and proper branding
- AC-2.3: Button has hover and active states with smooth animations
- AC-2.4: Clicking the button initiates Firebase Google authentication
- AC-2.5: After successful Google login, user is redirected to home page

### US-3: As a visitor, I want to log in with email and password
**Acceptance Criteria:**
- AC-3.1: Email input field has an email icon on the left
- AC-3.2: Password input field has a lock icon on the left
- AC-3.3: Both fields have placeholder text and proper labels
- AC-3.4: Fields have focus states with primary color ring
- AC-3.5: "Forgot?" link is displayed next to password label
- AC-3.6: "Keep me logged in" checkbox is available
- AC-3.7: "Log In" button is styled with primary green color
- AC-3.8: Button includes arrow icon and bounce animation on click
- AC-3.9: Form validates email format before submission
- AC-3.10: Error messages are displayed clearly below the form

### US-4: As a visitor, I want to navigate to signup or browse as guest
**Acceptance Criteria:**
- AC-4.1: Navigation bar includes "Create Account" button in top right
- AC-4.2: "Continue as Guest" link is displayed at bottom of form
- AC-4.3: Both options have hover states and smooth transitions
- AC-4.4: Clicking "Create Account" navigates to `/signup`
- AC-4.5: Clicking "Continue as Guest" navigates to home page

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

### US-7: As a visitor, I want to see a welcoming home page
**Acceptance Criteria:**
- AC-7.1: Home page displays "Coming Soon" message with branding
- AC-7.2: Page includes logo and application name
- AC-7.3: Navigation link to login page is prominently displayed
- AC-7.4: Page uses consistent design language with login page
- AC-7.5: Page is responsive on all screen sizes

### US-8: As an authenticated user, I want to see my name on the home page
**Acceptance Criteria:**
- AC-8.1: Home page displays user's display name or email
- AC-8.2: Welcome message is personalized (e.g., "Welcome back, John!")
- AC-8.3: Sign out button is available
- AC-8.4: User profile information loads from auth context
- AC-8.5: Loading state is shown while checking authentication

## Design Specifications

### Color Palette
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
- Font Family: "Plus Jakarta Sans" (fallback: system sans-serif)
- Heading: 3xl (1.875rem), extrabold (800)
- Subheading: base, regular (400), gray-500
- Labels: sm, bold (700)
- Buttons: base, bold (700)

### Spacing & Layout
- Form card: max-width 28rem (448px)
- Card padding: 2.5rem (40px) on desktop, 2rem (32px) on mobile
- Card border-radius: 1.5rem (24px)
- Input height: 3rem (48px)
- Button height: 3.5rem (56px)
- Gap between elements: 1.25rem (20px)

### Animations
- Button bounce: scale(0.95) on active
- Hover lift: translateY(-2px) on button hover
- Focus ring: 2px solid primary color
- Transition duration: 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)

## Technical Requirements

### TR-1: Project Structure
- Create `/app/login/page.tsx` for the login page
- Create `/components/auth/login-form.tsx` for the form component
- Create `/components/auth/social-login-button.tsx` for Google button
- Create `/lib/auth/firebase-auth.ts` for authentication logic
- Update `/app/page.tsx` for the home page with "Coming Soon" design
- Create `/components/home/coming-soon.tsx` for the coming soon component
- Update `/app/globals.css` with custom styles and animations

### TR-2: Dependencies
- Firebase Authentication (already installed)
- Google Fonts: Plus Jakarta Sans
- Material Icons Round (for icons)
- Tailwind CSS (already configured)

### TR-3: Firebase Configuration
- Enable Google Sign-In provider in Firebase Console
- Configure OAuth consent screen
- Add authorized domains for production

### TR-4: API Integration
- After successful Firebase login, call `POST /api/user` if user doesn't exist
- Store JWT token in secure HTTP-only cookie or localStorage
- Redirect to home page after successful authentication

### TR-5: Error Handling
- Display Firebase authentication errors in user-friendly format
- Handle network errors gracefully
- Show loading states during authentication
- Implement rate limiting feedback

## Out of Scope
- Password reset functionality (separate feature)
- Two-factor authentication
- Social login providers other than Google
- Remember me persistence (browser default)
- Dark mode support (future enhancement)

## Success Metrics
- Login page loads in < 2 seconds
- Google login completes in < 5 seconds
- Email login completes in < 3 seconds
- Zero accessibility violations (axe DevTools)
- Lighthouse Accessibility score: 100
- Mobile usability score: 100

## Dependencies
- Firebase project must be configured
- Backend API must be running
- Google OAuth credentials must be set up

## References
- Design template: `/docs/design-templates/login-page/login-page.html`
- Design mockup: `/docs/design-templates/login-page/login-page.png`
- Frontend spec: `/docs/Frontend-Development-Spec.md`
- API schema: `/docs/api-schema.json`
