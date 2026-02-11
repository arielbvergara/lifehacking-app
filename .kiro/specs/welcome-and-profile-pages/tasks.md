# Implementation Plan: Welcome and Profile Pages

## Overview

This implementation plan breaks down the welcome and profile pages feature into discrete, incremental coding tasks. Each task builds on previous work, with testing integrated throughout to catch errors early. The implementation follows the existing Next.js App Router architecture and design system.

## Tasks

- [ ] 1. Create welcome page components
  - [x] 1.1 Create CelebrationIcon SVG component
    - Create `components/welcome/celebration-icon.tsx`
    - Implement SVG high-five illustration with green checkmark
    - Use primary green color (#2bee2b) from design system
    - Export as React functional component
    - _Requirements: 1.2_

  - [x] 1.2 Create WelcomeActions component
    - Create `components/welcome/welcome-actions.tsx`
    - Implement "Start Exploring Tips" button with arrow icon
    - Implement "View My Profile" link with user icon
    - Accept onExplore and onViewProfile callback props
    - Use Material Icons Round for icons
    - Apply primary green styling to button, gray styling to link
    - _Requirements: 2.1, 2.3, 2.5, 2.6_

  - [x]* 1.3 Write unit tests for WelcomeActions component
    - Test button and link rendering
    - Test callback invocation on clicks
    - Test icon presence
    - Test styling classes
    - _Requirements: 2.1, 2.3, 2.5, 2.6_

  - [x] 1.4 Create WelcomeCard component
    - Create `components/welcome/welcome-card.tsx`
    - Compose CelebrationIcon and WelcomeActions
    - Add heading "Welcome to the Family!"
    - Add subtext "Your account has been successfully created. Ready to make life a little easier?"
    - Use Next.js useRouter for navigation
    - Apply white card styling with rounded corners
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

  - [x]* 1.5 Write unit tests for WelcomeCard component
    - Test heading and subtext rendering
    - Test CelebrationIcon presence
    - Test WelcomeActions integration
    - Test card styling classes
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

- [ ] 2. Create welcome page route
  - [x] 2.1 Create welcome page at app/welcome/page.tsx
    - Create client component with "use client" directive
    - Render WelcomeCard component
    - Add gradient background (page-gradient class)
    - Add decorative blur circles matching signup/login pages
    - Include AuthNav and AuthFooter components for consistency
    - _Requirements: 1.1, 1.6, 1.7, 7.1, 7.2_

  - [x]* 2.2 Write property test for welcome page navigation
    - **Property 2: Explore Button Navigation**
    - Generate random button click events
    - Verify router.push('/') is called for any click
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 2: Explore Button Navigation**
    - **Validates: Requirements 2.2**

  - [x]* 2.3 Write property test for profile link navigation
    - **Property 3: Profile Link Navigation**
    - Generate random link click events
    - Verify router.push('/profile') is called for any click
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 3: Profile Link Navigation**
    - **Validates: Requirements 2.4**

- [ ] 3. Update signup flow to redirect to welcome page
  - [x] 3.1 Modify signup page to redirect to /welcome
    - Update `app/signup/page.tsx`
    - Change handleSignupSuccess to navigate to '/welcome' instead of '/'
    - Ensure navigation occurs after successful signup
    - _Requirements: 1.1, 6.1_

  - [ ]* 3.2 Write property test for signup success navigation
    - **Property 1: Signup Success Navigation**
    - Generate random signup success states
    - Verify router.push('/welcome') is called for any successful signup
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 1: Signup Success Navigation**
    - **Validates: Requirements 1.1**

  - [ ]* 3.3 Write property test for signup callback navigation
    - **Property 5: Signup Success Callback Navigation**
    - Generate random onSuccess callback invocations
    - Verify router.push('/welcome') is called for any invocation
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 5: Signup Success Callback Navigation**
    - **Validates: Requirements 6.1**

  - [ ]* 3.4 Write property test for backend failure handling
    - **Property 10: Backend Creation Failure Handling**
    - Generate random backend creation failure scenarios
    - Verify error is displayed and router.push is NOT called
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 10: Backend Creation Failure Handling**
    - **Validates: Requirements 6.4**

- [x] 4. Checkpoint - Test welcome page flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create profile page components
  - [x] 5.1 Create ProfileField component
    - Create `components/profile/profile-field.tsx`
    - Accept label, value, and optional multiline props
    - Display label in bold, value in regular weight
    - Handle null values with "Not set" fallback
    - Support multiline for long values (like tokens)
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 5.2 Write unit tests for ProfileField component
    - Test label and value rendering
    - Test null value fallback
    - Test multiline mode
    - _Requirements: 3.4_

  - [x] 5.3 Create ProfileLoading component
    - Create `components/profile/profile-loading.tsx`
    - Display loading spinner or skeleton
    - Use Material Icons Round for spinner
    - Match card styling
    - _Requirements: 4.4_

  - [x] 5.4 Create ProfileCard component
    - Create `components/profile/profile-card.tsx`
    - Accept profile and idToken props
    - Use ProfileField for each data field (id, email, displayName, createdAt)
    - Display idToken in multiline ProfileField
    - Add home navigation button/link
    - Apply white card styling with rounded corners
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 5.1_

  - [ ]* 5.5 Write unit tests for ProfileCard component
    - Test all ProfileField instances render
    - Test home navigation element presence
    - Test card styling
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 5.1_

  - [ ]* 5.6 Write property test for profile data rendering
    - **Property 6: Profile Data Rendering**
    - Generate random UserProfile objects with varying fields
    - Verify all fields appear in rendered output
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 6: Profile Data Rendering**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 6. Create profile page route with authentication
  - [x] 6.1 Create profile page at app/profile/page.tsx
    - Create client component with "use client" directive
    - Use AuthContext to get user, idToken, and loading state
    - Implement authentication check and redirect logic
    - Redirect to '/login' if not authenticated
    - Display ProfileLoading while auth is loading
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 6.2 Write property test for unauthenticated access
    - **Property 7: Unauthenticated Profile Access**
    - Generate random unauthenticated states
    - Verify router.push('/login') is called for any unauthenticated state
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 7: Unauthenticated Profile Access**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 6.3 Write property test for loading state display
    - **Property 8: Loading State Display**
    - Generate random loading states
    - Verify loading indicator is rendered for any loading state
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 8: Loading State Display**
    - **Validates: Requirements 4.4**

- [ ] 7. Implement profile data fetching and error handling
  - [x] 7.1 Add profile data fetching to profile page
    - Use useState for profile data and error state
    - Use useEffect to fetch data on mount
    - Call getUserProfile(idToken) from lib/api/user.ts
    - Handle loading, success, and error states
    - Display ProfileLoading during fetch
    - Display ProfileCard on success
    - _Requirements: 3.1, 3.7, 3.8_

  - [x] 7.2 Implement error handling and display
    - Create error state component
    - Handle 401 errors (redirect to login)
    - Handle 404 errors (display "Profile not found")
    - Handle 500 errors (display "Server error")
    - Handle network errors (display connection message)
    - Add retry functionality for recoverable errors
    - _Requirements: 4.5_

  - [ ]* 7.3 Write unit tests for error scenarios
    - Test 401 error redirects to login
    - Test 404 error displays correct message
    - Test 500 error displays correct message
    - Test network error displays correct message
    - Test retry functionality
    - _Requirements: 4.5_

  - [ ]* 7.4 Write property test for API error display
    - **Property 9: API Error Display**
    - Generate random API error responses
    - Verify error message is displayed for any error
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 9: API Error Display**
    - **Validates: Requirements 4.5**

- [ ] 8. Add profile page styling and layout
  - [x] 8.1 Apply gradient background and decorative elements
    - Add page-gradient background class
    - Add decorative blur circles matching other auth pages
    - Include AuthNav and AuthFooter for consistency
    - Ensure responsive layout
    - _Requirements: 1.7, 5.3, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 8.2 Write property test for profile home navigation
    - **Property 4: Profile Home Navigation**
    - Generate random navigation click events
    - Verify router.push('/') is called for any click
    - Configure 100 iterations minimum
    - Tag: **Feature: welcome-and-profile-pages, Property 4: Profile Home Navigation**
    - **Validates: Requirements 5.2**

- [x] 9. Final checkpoint - Integration testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Testing is integrated throughout to catch errors early
- All components follow existing design system patterns
- Authentication flow leverages existing AuthContext
- API integration uses existing getUserProfile function
