# Signup Page Redesign - Implementation Tasks

## Overview
This task list implements the signup page redesign to match the login page design with Google signup support and component reuse.

## Task List

### Phase 1: Validation Schema & Error Handling

- [x] 1. Create signup validation schema
  - [x] 1.1 Create `lib/schemas/signup-schema.ts`
  - [x] 1.2 Define `signupSchema` with Zod (name optional, email required, password required)
  - [x] 1.3 Export `SignupFormData` type
  - [x] 1.4 Write unit tests in `lib/schemas/signup-schema.test.ts`
  - [x] 1.5 Write property test for email validation (Property 1.1)
  - [x] 1.6 Write property test for password length (Property 1.2)
  - [x] 1.7 Write property test for optional name field (Property 1.3)

- [x] 2. Update Firebase error handling
  - [x] 2.1 Add 'auth/email-already-in-use' error message to `lib/auth/auth-utils.ts`
  - [x] 2.2 Add 'auth/weak-password' error message
  - [x] 2.3 Add 'auth/operation-not-allowed' error message
  - [x] 2.4 Update tests in `lib/auth/auth-utils.test.ts`

### Phase 2: Backend API Integration

- [x] 3. Create backend user creation function
  - [x] 3.1 Add `CreateUserPayload` interface to `lib/api/user.ts`
  - [x] 3.2 Implement `createUserInBackend()` function
  - [x] 3.3 Handle API errors gracefully
  - [x] 3.4 Write unit tests in `lib/api/user.test.ts`
  - [x] 3.5 Test error scenarios (network failure, backend errors)

### Phase 3: Firebase Authentication Functions

- [x] 4. Add Firebase signup functions
  - [x] 4.1 Add `signUpWithGoogle()` to `lib/auth/firebase-auth.ts`
  - [x] 4.2 Add `signUpWithEmail()` to `lib/auth/firebase-auth.ts`
  - [x] 4.3 Write unit tests in `lib/auth/firebase-auth.test.ts`
  - [x] 4.4 Mock Firebase auth methods
  - [x] 4.5 Test success and error scenarios

### Phase 4: Auth Context Updates

- [x] 5. Extend auth context with signup methods
  - [x] 5.1 Add `signUpWithGoogle()` to `AuthContextType` interface in `lib/auth/auth-context.tsx`
  - [x] 5.2 Add `signUpWithEmail()` to `AuthContextType` interface
  - [x] 5.3 Implement `signUpWithGoogle()` in `AuthProvider`
  - [x] 5.4 Implement `signUpWithEmail()` in `AuthProvider`
  - [x] 5.5 Integrate `createUserInBackend()` in both methods
  - [x] 5.6 Update tests in `lib/auth/auth-context.test.tsx`
  - [x] 5.7 Write property test for Google signup backend creation (Property 2.1)
  - [x] 5.8 Write property test for email signup backend creation (Property 2.2)

### Phase 5: New Components

- [x] 6. Create SignupHeader component
  - [x] 6.1 Create `components/auth/signup-header.tsx`
  - [x] 6.2 Implement component with person_add icon
  - [x] 6.3 Add "Join Us!" heading
  - [x] 6.4 Add "Start making life easier today!" subheading
  - [x] 6.5 Match styling from LoginHeader
  - [x] 6.6 Write unit tests in `components/auth/signup-header.test.tsx`

- [x] 7. Create LoginLink component
  - [x] 7.1 Create `components/auth/login-link.tsx`
  - [x] 7.2 Implement component with link to `/login`
  - [x] 7.3 Add "Already have an account?" text
  - [x] 7.4 Match styling from GuestLink
  - [x] 7.5 Write unit tests in `components/auth/login-link.test.tsx`

- [x] 8. Create SignupForm component
  - [x] 8.1 Create `components/auth/signup-form.tsx`
  - [x] 8.2 Add name field (optional) with person icon
  - [x] 8.3 Add email field (required) with email icon
  - [x] 8.4 Add password field (required) with lock icon
  - [x] 8.5 Add password hint text ("Must be at least 8 characters")
  - [x] 8.6 Implement form submission handler
  - [x] 8.7 Integrate with `signUpWithEmail()` from auth context
  - [x] 8.8 Add loading state
  - [x] 8.9 Add error display
  - [x] 8.10 Add success callback
  - [x] 8.11 Write unit tests in `components/auth/signup-form.test.tsx`
  - [x] 8.12 Write property test for loading state (Property 3.1)
  - [x] 8.13 Write property test for error display (Property 3.2)

### Phase 6: Update Existing Components

- [x] 9. Update AuthNav component
  - [x] 9.1 Add `showLoginButton` prop to `components/layout/auth-nav.tsx`
  - [x] 9.2 Implement "Sign In" button when `showLoginButton` is true
  - [x] 9.3 Add "Have an account?" text (hidden on mobile)
  - [x] 9.4 Link button to `/login`
  - [x] 9.5 Update tests in `components/layout/auth-nav.test.tsx`

### Phase 7: Signup Page Implementation

- [x] 10. Redesign signup page
  - [x] 10.1 Update `app/signup/page.tsx` to use new layout
  - [x] 10.2 Add page-gradient background
  - [x] 10.3 Add decorative blur circles (same as login page)
  - [x] 10.4 Add AuthNav with `showLoginButton={true}`
  - [x] 10.5 Add SignupHeader component
  - [x] 10.6 Add SocialLoginButton for Google signup
  - [x] 10.7 Add Divider with "Or sign up with email" text
  - [x] 10.8 Add SignupForm component
  - [x] 10.9 Add LoginLink component
  - [x] 10.10 Add AuthFooter component
  - [x] 10.11 Implement Google signup handler
  - [x] 10.12 Implement signup success handler (redirect to home)
  - [x] 10.13 Write integration tests in `app/signup/page.test.tsx`
  - [x] 10.14 Write property test for signup redirect (Property 2.3)

### Phase 8: Accessibility Testing

- [ ] 11. Test keyboard navigation
  - [ ] 11.1 Verify all form fields are keyboard accessible
  - [ ] 11.2 Verify tab order is logical
  - [ ] 11.3 Verify focus indicators are visible
  - [ ] 11.4 Verify Enter key submits form
  - [ ] 11.5 Write property test for keyboard navigation (Property 4.1)

- [ ] 12. Test screen reader support
  - [ ] 12.1 Verify all form inputs have proper labels
  - [ ] 12.2 Verify error messages are announced
  - [ ] 12.3 Verify loading states are announced
  - [ ] 12.4 Test with VoiceOver (macOS) or NVDA (Windows)
  - [ ] 12.5 Write property test for form labels (Property 4.2)

- [ ] 13. Test color contrast
  - [ ] 13.1 Run axe DevTools accessibility audit
  - [ ] 13.2 Verify all text meets 4.5:1 contrast ratio
  - [ ] 13.3 Verify interactive elements meet contrast requirements
  - [ ] 13.4 Fix any contrast issues found
  - [ ] 13.5 Write property test for color contrast (Property 4.3)

### Phase 9: Responsive Design Testing

- [ ] 14. Test responsive layout
  - [ ] 14.1 Test on mobile (375px width)
  - [ ] 14.2 Test on tablet (768px width)
  - [ ] 14.3 Test on desktop (1440px width)
  - [ ] 14.4 Verify form card is readable on all sizes
  - [ ] 14.5 Verify navigation collapses properly on mobile
  - [ ] 14.6 Verify touch targets are at least 44x44px
  - [ ] 14.7 Verify no horizontal scrolling on any screen size

### Phase 10: Integration Testing

- [ ] 15. Test Google signup flow
  - [ ] 15.1 Test successful Google signup
  - [ ] 15.2 Test Google popup blocked scenario
  - [ ] 15.3 Test Google popup closed by user
  - [ ] 15.4 Test network error during Google signup
  - [ ] 15.5 Test backend error during user creation
  - [ ] 15.6 Verify redirect to home page after success
  - [ ] 15.7 Verify Google display name is used

- [ ] 16. Test email signup flow
  - [ ] 16.1 Test successful email signup with name
  - [ ] 16.2 Test successful email signup without name
  - [ ] 16.3 Test email already in use error
  - [ ] 16.4 Test weak password error
  - [ ] 16.5 Test invalid email format error
  - [ ] 16.6 Test network error during signup
  - [ ] 16.7 Test backend error during user creation
  - [ ] 16.8 Verify redirect to home page after success

- [ ] 17. Test navigation
  - [ ] 17.1 Test "Sign In" button in navigation
  - [ ] 17.2 Test "Sign in" link at bottom of form
  - [ ] 17.3 Verify both navigate to `/login`
  - [ ] 17.4 Test logo link (should go to home)

### Phase 11: Performance Testing

- [ ] 18. Run performance audits
  - [ ] 18.1 Run Lighthouse performance audit
  - [ ] 18.2 Verify page loads in < 2 seconds
  - [ ] 18.3 Verify Largest Contentful Paint (LCP) < 2.5s
  - [ ] 18.4 Verify Cumulative Layout Shift (CLS) < 0.1
  - [ ] 18.5 Verify Time to Interactive (TTI) < 3s
  - [ ] 18.6 Optimize any performance issues found

### Phase 12: Visual Consistency Check

- [ ] 19. Compare with login page
  - [ ] 19.1 Verify gradient background matches exactly
  - [ ] 19.2 Verify blur circles match exactly
  - [ ] 19.3 Verify card styling matches exactly
  - [ ] 19.4 Verify button styling matches exactly
  - [ ] 19.5 Verify input field styling matches exactly
  - [ ] 19.6 Verify spacing and layout match exactly
  - [ ] 19.7 Verify animations match exactly

### Phase 13: Final Testing & Polish

- [ ] 20. Run all tests
  - [ ] 20.1 Run all unit tests (`npm test`)
  - [ ] 20.2 Run all property tests
  - [ ] 20.3 Fix any failing tests
  - [ ] 20.4 Verify test coverage is adequate

- [ ] 21. Manual testing
  - [ ] 21.1 Test complete signup flow end-to-end
  - [ ] 21.2 Test error scenarios
  - [ ] 21.3 Test on different browsers (Chrome, Firefox, Safari)
  - [ ] 21.4 Test on different devices (mobile, tablet, desktop)
  - [ ] 21.5 Fix any bugs found

- [ ] 22. Documentation
  - [ ] 22.1 Update README if needed
  - [ ] 22.2 Add comments to complex code
  - [ ] 22.3 Document any environment variables needed
  - [ ] 22.4 Document any Firebase configuration needed

## Notes

- All property-based tests should use the testing framework specified in the design document
- Reuse existing test utilities and mocks where possible
- Follow the same code style and patterns as the login page implementation
- Ensure all TypeScript types are properly defined
- Run `npm run lint` before committing changes

## Success Criteria

- [ ] All tasks completed
- [ ] All tests passing
- [ ] Zero TypeScript errors
- [ ] Zero accessibility violations
- [ ] Lighthouse Accessibility score: 100
- [ ] Visual consistency with login page: 100%
- [ ] Page loads in < 2 seconds
- [ ] Google signup completes in < 5 seconds
- [ ] Email signup completes in < 3 seconds
