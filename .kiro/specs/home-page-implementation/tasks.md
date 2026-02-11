# Implementation Plan: Home Page Implementation

## Overview

This implementation plan breaks down the home page feature into discrete, incremental tasks. Each task builds on previous work, with testing integrated throughout to catch errors early. The implementation follows a bottom-up approach: starting with foundational types and API clients, then building reusable components, and finally composing them into the complete page.

## Tasks

- [-] 1. Set up TypeScript types and API client infrastructure
  - Create TypeScript interfaces matching the API schema from `docs/api-schema.json`
  - Define types for Category, Tip, API responses, and error handling
  - Implement API client functions for fetching categories and tips
  - Add environment configuration for API base URL
  - _Requirements: 13.1, 13.7, 9.7, 9.8_

- [x] 1.1 Write unit tests for API client functions
  - Test successful API responses with mock data
  - Test error handling for network failures
  - Test error handling for malformed responses
  - Test timeout handling
  - _Requirements: 9.3, 9.4, 9.7, 9.8_

- [x] 2. Implement utility functions and helpers
  - [x] 2.1 Create text truncation utility function
    - Implement function to truncate text with ellipsis
    - Handle edge cases (empty strings, strings shorter than max length)
    - _Requirements: 4.6, 5.7_
  
  - [x] 2.2 Write property test for text truncation
    - **Property 8: Text Truncation Consistency**
    - **Validates: Requirements 4.6, 5.7**
  
  - [x] 2.3 Create user initials derivation function
    - Implement function to extract initials from display name or email
    - Handle single-word names, multi-word names, and email fallback
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [x] 2.4 Write property test for initials derivation
    - **Property 7: User Initials Derivation**
    - **Validates: Requirements 7.2, 7.3, 7.4**
  
  - [x] 2.5 Create category icon mapping utility
    - Implement function to map category names to icons
    - Provide default fallback icon
    - _Requirements: 3.5_
  
  - [x] 2.6 Write property test for icon mapping
    - **Property 4: Icon Mapping Consistency**
    - **Validates: Requirements 3.5**
  
  - [x] 2.7 Create tip count formatting function
    - Implement function to format count as "{count} tips"
    - _Requirements: 3.7_
  
  - [x] 2.8 Write property test for tip count formatting
    - **Property 5: Tip Count Formatting**
    - **Validates: Requirements 3.7**

- [x] 3. Build foundational UI components
  - [x] 3.1 Create UserAvatar component
    - Implement circular avatar with initials
    - Add click handler support
    - Style with Tailwind CSS
    - _Requirements: 7.1, 7.2, 7.6_
  
  - [x] 3.2 Write unit tests for UserAvatar
    - Test rendering with different user objects
    - Test click handler invocation
    - Test initials display for various name formats
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [x] 3.3 Create SearchBar component
    - Implement controlled input with state
    - Add search button
    - Style with Tailwind CSS (responsive, full-width on mobile)
    - _Requirements: 2.3, 2.4, 2.6, 2.7, 10.6_
  
  - [x] 3.4 Write unit tests for SearchBar
    - Test input value changes
    - Test placeholder text display
    - Test that search button doesn't trigger navigation
    - _Requirements: 2.6, 2.7, 2.9_
  
  - [x] 3.5 Write property test for SearchBar mobile width
    - **Property 14: Search Bar Full Width on Mobile**
    - **Validates: Requirements 10.6**
  
  - [x] 3.6 Create CategoryTags component
    - Implement badge components for static tags
    - Style as clickable badges (non-functional)
    - _Requirements: 2.5, 2.8, 2.9_
  
  - [x] 3.7 Write unit tests for CategoryTags
    - Test rendering of all tags
    - Test that clicking tags doesn't trigger navigation
    - _Requirements: 2.5, 2.9_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build card components
  - [x] 5.1 Create CategoryCard component
    - Display category icon, name, and tip count
    - Implement click handler for navigation
    - Style with Tailwind CSS (white card, shadow, hover state)
    - _Requirements: 3.5, 3.6, 3.7, 3.8_
  
  - [x] 5.2 Write unit tests for CategoryCard
    - Test rendering of category data
    - Test navigation on click
    - _Requirements: 3.6, 3.7, 3.8_
  
  - [x] 5.3 Write property test for CategoryCard navigation
    - **Property 6: Navigation ID Preservation**
    - **Validates: Requirements 3.8, 11.1**
  
  - [x] 5.4 Create TipCard component
    - Display tip image, title, description (truncated), category badge
    - Add "Read tip >" link and heart icon (non-functional)
    - Style with Tailwind CSS (responsive layout)
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_
  
  - [x] 5.5 Write unit tests for TipCard
    - Test rendering of tip data
    - Test description truncation
    - Test navigation on link click
    - Test heart icon is non-functional
    - _Requirements: 5.5, 5.6, 5.7, 5.8, 5.11, 5.12_
  
  - [x] 5.6 Write property test for TipCard navigation
    - **Property 6: Navigation ID Preservation**
    - **Validates: Requirements 5.11, 11.2**
  
  - [x] 5.7 Write property test for TipCard data display
    - **Property 3: Data Display Integrity**
    - **Validates: Requirements 5.5, 5.6, 5.8**

- [x] 6. Build section components
  - [x] 6.1 Create HeroSection component
    - Compose headline, subheadline, SearchBar, and CategoryTags
    - Style with Tailwind CSS (responsive spacing)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 6.2 Write unit tests for HeroSection
    - Test rendering of headline and subheadline
    - Test presence of SearchBar and CategoryTags
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 6.3 Create ExploreCategories component
    - Display section title and subtitle
    - Render CategoryCard grid with loading/error states
    - Add "View all >" link
    - Implement responsive grid (1/2/3 columns)
    - _Requirements: 3.1, 3.2, 3.4, 3.9, 10.2, 10.3_
  
  - [x] 6.4 Write unit tests for ExploreCategories
    - Test loading state display
    - Test error state display with retry button
    - Test success state with category cards
    - _Requirements: 3.4, 9.1, 9.3_
  
  - [x] 6.5 Write property test for ExploreCategories list rendering
    - **Property 2: List Rendering Completeness**
    - **Validates: Requirements 3.4**
  
  - [x] 6.6 Write property test for ExploreCategories responsive grid
    - **Property 13: Responsive Grid Column Count**
    - **Validates: Requirements 10.2, 10.3**
  
  - [x] 6.7 Create FeaturedTip component
    - Display tip in prominent card format
    - Show "LIFEHACK" badge, title, description (truncated), image
    - Add "Read More" and "Save" buttons (Save is non-functional)
    - Implement responsive layout (stack on mobile)
    - Handle loading/error states
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.10, 4.11_
  
  - [x] 6.8 Write unit tests for FeaturedTip
    - Test loading state display
    - Test error state display with retry button
    - Test success state with tip data
    - Test "Read More" navigation
    - Test "Save" button is non-functional
    - _Requirements: 4.2, 4.7, 4.8, 4.10, 4.11, 9.2, 9.4_
  
  - [x] 6.9 Write property test for FeaturedTip navigation
    - **Property 6: Navigation ID Preservation**
    - **Validates: Requirements 4.10, 11.3**
  
  - [x] 6.10 Create LatestLifehacks component
    - Display section title
    - Render TipCard grid with loading/error states
    - Implement responsive grid (1/2/3 columns)
    - _Requirements: 5.1, 5.3, 10.4, 10.5_
  
  - [x] 6.11 Write unit tests for LatestLifehacks
    - Test loading state display
    - Test error state display with retry button
    - Test success state with tip cards
    - _Requirements: 5.3, 9.2, 9.4_
  
  - [x] 6.12 Write property test for LatestLifehacks list rendering
    - **Property 2: List Rendering Completeness**
    - **Validates: Requirements 5.3**
  
  - [x] 6.13 Write property test for LatestLifehacks responsive grid
    - **Property 13: Responsive Grid Column Count**
    - **Validates: Requirements 10.4, 10.5**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build layout components
  - [x] 8.1 Create HomeHeader component
    - Display logo and navigation
    - Show "Login" and "Join for Free" buttons for anonymous users
    - Show UserAvatar with dropdown menu for authenticated users
    - Implement responsive mobile menu
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.6, 7.7, 7.8_
  
  - [x] 8.2 Write unit tests for HomeHeader
    - Test anonymous user UI (Login and Join buttons)
    - Test authenticated user UI (UserAvatar)
    - Test navigation on button clicks
    - Test avatar dropdown menu
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.7, 7.8_
  
  - [x] 8.3 Create HomeFooter component
    - Implement footer with Discover, Company, Legal sections
    - Add social media icons
    - Add copyright notice
    - Style with Tailwind CSS (responsive layout)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 8.4 Write unit tests for HomeFooter
    - Test rendering of all sections
    - Test presence of social media icons
    - Test copyright notice
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 9. Implement main page component with data fetching
  - [x] 9.1 Create custom hook for home page data fetching
    - Implement `useHomeData` hook to fetch categories and tips in parallel
    - Manage loading, error, and data states
    - Implement retry logic
    - Prevent duplicate requests
    - _Requirements: 3.3, 4.1, 5.2, 9.1, 9.2, 9.9, 14.1_
  
  - [x] 9.2 Write unit tests for useHomeData hook
    - Test parallel API calls
    - Test loading states
    - Test error handling
    - Test retry functionality
    - Test request deduplication
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 9.9, 14.1_
  
  - [x] 9.3 Write property test for parallel API requests
    - **Property 15: Parallel API Request Independence**
    - **Validates: Requirements 14.1**
  
  - [x] 9.4 Write property test for request deduplication
    - **Property 12: Request Deduplication**
    - **Validates: Requirements 9.9**
  
  - [x] 9.5 Write property test for loading state exclusivity
    - **Property 9: Loading State Exclusivity**
    - **Validates: Requirements 9.1, 9.2**
  
  - [x] 9.6 Write property test for error state completeness
    - **Property 10: Error State Completeness**
    - **Validates: Requirements 9.3, 9.4, 9.6**
  
  - [x] 9.7 Write property test for error message sanitization
    - **Property 11: Error Message Sanitization**
    - **Validates: Requirements 9.5**
  
  - [x] 9.8 Update app/page.tsx with new home page implementation
    - Replace existing content with new home page
    - Use useHomeData hook for data fetching
    - Compose all section components (Hero, ExploreCategories, FeaturedTip, LatestLifehacks)
    - Add HomeHeader and HomeFooter
    - Implement loading and error states at page level
    - Ensure authentication context integration
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 9.9 Write integration tests for home page
    - Test page renders for anonymous users
    - Test page renders for authenticated users
    - Test all sections are present
    - Test data flows correctly from API to components
    - _Requirements: 1.2, 6.1, 6.2, 7.1_
  
  - [x] 9.10 Write property test for auth state rendering
    - **Property 1: Component Renders for All Auth States**
    - **Validates: Requirements 1.2**

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Add environment configuration and final polish
  - [x] 11.1 Add API_BASE_URL to environment variables
    - Update .env.local with NEXT_PUBLIC_API_BASE_URL
    - Document required environment variables
    - _Requirements: 13.7_
  
  - [x] 11.2 Verify responsive design across breakpoints
    - Test mobile layout (< 768px)
    - Test tablet layout (768px - 1023px)
    - Test desktop layout (≥ 1024px)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 11.3 Verify styling consistency
    - Check color scheme (green accents, white cards)
    - Check spacing and typography
    - Check hover states and transitions
    - _Requirements: 12.2, 12.3, 12.4, 12.6, 12.8, 12.9_
  
  - [x] 11.4 Run full test suite and type checking
    - Run `npm run typecheck` to verify TypeScript compilation
    - Run `npm run test:run` to execute all tests
    - Fix any failing tests or type errors
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for complete implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate data flow and component composition
- The implementation follows a bottom-up approach: utilities → components → sections → page
- All components use TypeScript for type safety
- All styling uses Tailwind CSS
- API client functions include proper error handling and timeout support
