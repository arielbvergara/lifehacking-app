# Implementation Plan: Search Page Category Filter

## Overview

This implementation plan breaks down the search page category filter feature into discrete, incremental tasks. Each task builds on previous work, with testing integrated throughout to catch issues early. The plan follows a bottom-up approach: building small components first, then composing them into larger features, and finally wiring everything together.

## Tasks

- [x] 1. Create CategoryPill component with basic rendering
  - Create `components/search/category-pill.tsx`
  - Implement CategoryPill component with props interface (category, isSelected, onClick)
  - Render "All" pill when category is null (text only, no image)
  - Render category name and image when category has image
  - Render category name only when category has no image
  - Apply selected/unselected styling based on isSelected prop
  - Ensure minimum 44x44px touch target size
  - _Requirements: 1.3, 1.4, 1.5, 7.3_

- [ ]* 1.1 Write property test for CategoryPill rendering
  - **Property 1: Category pill rendering reflects image availability**
  - **Validates: Requirements 1.4, 1.5**
  - Generate random categories with and without images
  - Verify image and name displayed when image exists
  - Verify only name displayed when image is null

- [ ]* 1.2 Write unit tests for CategoryPill component
  - Test "All" pill renders without image
  - Test category with image renders both image and name
  - Test category without image renders name only
  - Test selected styling applied when isSelected is true
  - Test unselected styling applied when isSelected is false
  - Test minimum touch target size (44x44px)
  - _Requirements: 1.3, 1.4, 1.5, 7.3_

- [x] 2. Add keyboard and accessibility support to CategoryPill
  - Add keyboard event handlers (Enter, Space)
  - Add ARIA attributes (role="tab", aria-pressed, aria-label)
  - Add visible focus indicator styling
  - Implement onClick callback on Enter/Space key press
  - _Requirements: 8.2, 8.5, 8.8_

- [ ]* 2.1 Write property test for keyboard selection
  - **Property 6: Keyboard selection triggers category change**
  - **Validates: Requirements 8.2**
  - Generate random categories
  - Focus each pill and simulate Enter/Space key press
  - Verify onClick callback is called

- [ ]* 2.2 Write property test for focus indicators
  - **Property 7: Focus indicator visibility on all pills**
  - **Validates: Requirements 8.5**
  - Generate random categories
  - Focus each pill
  - Verify focus indicator styles are applied

- [ ]* 2.3 Write property test for ARIA pressed attribute
  - **Property 8: ARIA pressed attribute reflects selection state**
  - **Validates: Requirements 8.8**
  - Generate random categories with random selection states
  - Verify aria-pressed="true" when selected
  - Verify aria-pressed="false" when not selected

- [ ]* 2.4 Write unit tests for CategoryPill accessibility
  - Test Enter key triggers onClick
  - Test Space key triggers onClick
  - Test focus indicator visible when focused
  - Test ARIA attributes present (role, aria-pressed, aria-label)
  - _Requirements: 8.2, 8.5, 8.8_

- [x] 3. Create session storage caching utilities
  - Create `lib/utils/category-cache.ts`
  - Implement getCachedCategories() function
  - Implement setCachedCategories() function
  - Use session storage key "categories_cache"
  - Handle storage errors gracefully (silent failure)
  - _Requirements: 9.1, 9.2, 9.3_

- [ ]* 3.1 Write unit tests for caching utilities
  - Test getCachedCategories returns null when cache empty
  - Test getCachedCategories returns cached data when present
  - Test setCachedCategories stores data in session storage
  - Test silent failure when session storage unavailable
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 4. Create CategoryFilterBar component with API integration
  - Create `components/search/category-filter-bar.tsx`
  - Implement CategoryFilterBar component with props (selectedCategoryId, onCategorySelect)
  - Fetch categories from API on mount using fetchCategories()
  - Check cache before fetching (use getCachedCategories)
  - Store fetched categories in cache (use setCachedCategories)
  - Render "All" pill first, then fetched categories
  - Display loading skeleton while fetching
  - Hide component entirely on API error (return null)
  - Render CategoryPill components with correct props
  - Implement horizontal scrollable container
  - Add scroll indicators (fade edges) for overflow
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 7.1, 7.2_

- [ ]* 4.1 Write unit tests for CategoryFilterBar
  - Test renders "All" pill as first item
  - Test fetches categories on mount
  - Test uses cached categories on subsequent mounts
  - Test displays loading skeleton while loading
  - Test hides component on API error (returns null)
  - Test renders CategoryPill for each category
  - Test calls onCategorySelect when pill clicked
  - Test horizontal scrollable container present
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 7.1_

- [x] 5. Add keyboard navigation to CategoryFilterBar
  - Implement Tab key navigation (sequential focus)
  - Implement Arrow key navigation (Left/Right)
  - Add ARIA attributes (role="tablist", aria-label)
  - Add ARIA live region for selection announcements
  - _Requirements: 8.1, 8.3, 8.4, 8.6, 8.7_

- [ ]* 5.1 Write unit tests for CategoryFilterBar keyboard navigation
  - Test Tab key moves focus between pills
  - Test Right Arrow moves focus to next pill
  - Test Left Arrow moves focus to previous pill
  - Test ARIA tablist role present
  - Test ARIA label present
  - Test ARIA live region present and updates on selection
  - _Requirements: 8.1, 8.3, 8.4, 8.6, 8.7_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Enhance Header component with category filter support
  - Modify `components/layout/header.tsx`
  - Add showCategoryFilter prop to HeaderProps interface (default: false)
  - Conditionally render CategoryFilterBar when showCategoryFilter is true
  - Position CategoryFilterBar below main navigation
  - Pass selectedCategoryId and onCategorySelect props to CategoryFilterBar
  - Maintain all existing Header functionality
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 7.1 Write unit tests for enhanced Header
  - Test CategoryFilterBar renders when showCategoryFilter is true
  - Test CategoryFilterBar does not render when showCategoryFilter is false
  - Test existing Header functionality works with CategoryFilterBar
  - Test SearchBar remains visible and functional with CategoryFilterBar
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Update SearchBar to navigate to search page
  - Modify `components/shared/search-bar.tsx`
  - Update handleSubmit to navigate to `/search?q={query}`
  - Accept optional onSearch prop to allow parent override
  - Use custom handler if onSearch prop provided
  - Use default navigation if onSearch not provided
  - _Requirements: 5.1_

- [ ]* 8.1 Write unit tests for SearchBar navigation
  - Test navigates to /search with q parameter on submit
  - Test uses custom onSearch handler when provided
  - Test uses default navigation when onSearch not provided
  - _Requirements: 5.1_

- [x] 9. Create SearchPage component with URL state management
  - Create `app/search/page.tsx`
  - Implement SearchPage component
  - Use useSearchParams to read q and categoryId from URL
  - Use useRouter for navigation
  - Implement state for tips, loading, error, pagination
  - Fetch tips on mount and when URL parameters change
  - Pass q and categoryId to fetchTips API call
  - Implement handleCategorySelect to update URL with categoryId
  - Implement handleSearch to update URL with q parameter
  - Preserve existing parameters when updating URL
  - Remove categoryId from URL when "All" is selected
  - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 6.4, 6.5, 6.6, 6.7_

- [ ]* 9.1 Write property test for URL parameter handling
  - **Property 3: URL parameters determine API call parameters**
  - **Validates: Requirements 3.5, 3.6, 3.7**
  - Generate random combinations of q and categoryId parameters
  - Verify fetchTips called with exactly those parameters present in URL

- [ ]* 9.2 Write property test for category selection URL updates
  - **Property 4: Category selection updates URL and preserves search query**
  - **Validates: Requirements 4.3, 4.4, 4.5**
  - Generate random categories and search queries
  - Select each category
  - Verify URL updated with categoryId (or removed for "All")
  - Verify q parameter preserved

- [ ]* 9.3 Write property test for search submission URL updates
  - **Property 5: Search submission updates URL and preserves category filter**
  - **Validates: Requirements 5.1, 5.2, 5.4**
  - Generate random search queries and category selections
  - Submit each search
  - Verify URL updated with q parameter
  - Verify categoryId parameter preserved

- [ ]* 9.4 Write unit tests for SearchPage
  - Test fetches all tips on initial load (no params)
  - Test fetches tips with q parameter when present in URL
  - Test fetches tips with categoryId parameter when present in URL
  - Test fetches tips with both parameters when both in URL
  - Test updates URL when category selected
  - Test updates URL when search submitted
  - Test removes categoryId from URL when "All" selected
  - Test preserves q when category changes
  - Test preserves categoryId when search changes
  - Test browser back button restores previous state
  - Test browser forward button restores next state
  - Test page reload preserves state from URL
  - _Requirements: 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 6.4, 6.5, 6.6, 6.7_

- [x] 10. Add UI rendering to SearchPage
  - Render Header with showCategoryFilter={true} and showSearchBar={true}
  - Pass handleCategorySelect to Header
  - Pass handleSearch to Header/SearchBar
  - Display loading skeletons while loading (reuse TipCardSkeleton pattern)
  - Display error message with retry button on error
  - Render responsive grid of TipCard components for tips
  - Display "No tips found" message when tips array is empty
  - Render Footer component
  - _Requirements: 3.2, 3.3, 3.8, 3.9, 3.10_

- [ ]* 10.1 Write unit tests for SearchPage UI
  - Test renders Header with showCategoryFilter={true}
  - Test displays loading skeletons while loading
  - Test displays error message on API failure
  - Test displays retry button on error
  - Test retries API call when retry button clicked
  - Test renders TipCard for each tip
  - Test displays "No tips found" when tips array empty
  - Test renders Footer
  - _Requirements: 3.2, 3.3, 3.8, 3.9, 3.10_

- [x] 11. Add responsive design and styling
  - Apply Tailwind responsive classes to tip grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
  - Add smooth scrolling to CategoryFilterBar (scroll-behavior: smooth)
  - Add scroll indicators (fade edges) using CSS gradients
  - Ensure CategoryPill has proper spacing and padding
  - Test mobile touch scrolling
  - _Requirements: 7.1, 7.2, 7.5, 7.6_

- [ ]* 11.1 Write unit tests for responsive design
  - Test tip grid has responsive classes
  - Test CategoryFilterBar has smooth scrolling
  - Test scroll indicators present when content overflows
  - _Requirements: 7.1, 7.2, 7.5, 7.6_

- [x] 12. Add API timeout configuration
  - Verify fetchTips uses API_TIMEOUT constant (10 seconds)
  - Verify fetchCategories uses API_TIMEOUT constant (10 seconds)
  - Test timeout error handling displays appropriate message
  - _Requirements: 9.4, 9.5, 10.5_

- [ ]* 12.1 Write unit tests for timeout handling
  - Test fetchTips has 10-second timeout
  - Test fetchCategories has 10-second timeout
  - Test timeout error displays "Request timeout" message
  - _Requirements: 9.4, 9.5, 10.5_

- [x] 13. Add error logging
  - Add console.error calls for API errors in SearchPage
  - Add console.error calls for API errors in CategoryFilterBar
  - Include error details and context in logs
  - _Requirements: 10.6_

- [ ]* 13.1 Write unit tests for error logging
  - Test console.error called when category API fails
  - Test console.error called when tip search API fails
  - _Requirements: 10.6_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 15. Write end-to-end tests
  - Test navigate to /search, verify CategoryFilterBar appears
  - Test click category, verify URL updates and results filter
  - Test click "All", verify categoryId removed from URL
  - Test submit search, verify q parameter added to URL
  - Test select category then search, verify both parameters in URL
  - Test browser back button, verify state restored
  - Test reload page with parameters, verify state persisted
  - Test keyboard navigation through categories
  - Test mobile touch scrolling

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- End-to-end tests validate complete user workflows
- The implementation reuses existing components (TipCard, Header, SearchBar) to minimize code duplication
- Session storage caching improves performance without adding complexity
- URL-based state management enables sharing and browser navigation
