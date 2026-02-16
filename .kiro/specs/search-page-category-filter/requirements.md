# Requirements Document

## Introduction

This document specifies the requirements for implementing a category filter bar feature in the header of the search page. The feature enables users to filter search results by category through a horizontal scrollable list of category pills, each displaying a category image and name. The filter bar appears only on the `/search` route and integrates with the existing search functionality to provide a comprehensive search and filtering experience.

## Glossary

- **Search_Page**: The web page located at `/search` route that displays searchable and filterable tip results
- **Category_Filter_Bar**: A horizontal scrollable component displaying category pills for filtering
- **Category_Pill**: An interactive button element showing a category image icon and category name
- **Header**: The main navigation component at the top of the application
- **Tip_Card**: A reusable component displaying tip summary information in a card layout
- **Search_Bar**: The existing search input component in the header for text-based search
- **API_Client**: The service layer for making HTTP requests to the backend API
- **URL_State**: The browser URL query parameters that persist filter and search state

## Requirements

### Requirement 1: Category Filter Bar Component

**User Story:** As a user, I want to see a horizontal list of category options with images, so that I can visually identify and select categories to filter my search results.

#### Acceptance Criteria

1. THE Category_Filter_Bar SHALL display a horizontally scrollable list of Category_Pills
2. WHEN the Category_Filter_Bar renders, THE System SHALL fetch categories from the GET /api/Category endpoint
3. THE Category_Filter_Bar SHALL include an "All" Category_Pill as the first item without an image
4. WHEN a category has an image, THE Category_Pill SHALL display the category image as an icon alongside the category name
5. WHEN a category does not have an image, THE Category_Pill SHALL display only the category name
6. WHEN the Category_Filter_Bar is loading categories, THE System SHALL display a loading skeleton
7. IF the category API request fails, THEN THE System SHALL hide the Category_Filter_Bar entirely
8. THE Category_Filter_Bar SHALL highlight the currently selected Category_Pill with distinct visual styling

### Requirement 2: Header Integration

**User Story:** As a user, I want the category filter to appear in the header only when I'm on the search page, so that the interface remains clean and contextually relevant.

#### Acceptance Criteria

1. THE Header SHALL accept a showCategoryFilter prop with a default value of false
2. WHEN showCategoryFilter is true, THE Header SHALL render the Category_Filter_Bar below the main navigation
3. WHEN showCategoryFilter is false, THE Header SHALL NOT render the Category_Filter_Bar
4. THE Header SHALL maintain all existing functionality when Category_Filter_Bar is displayed
5. THE Search_Bar SHALL remain visible and functional when Category_Filter_Bar is displayed

### Requirement 3: Search Page Implementation

**User Story:** As a user, I want a dedicated search page where I can search for tips and filter by category, so that I can find relevant tips efficiently.

#### Acceptance Criteria

1. THE System SHALL create a new page at the /search route
2. THE Search_Page SHALL render the Header with showCategoryFilter set to true
3. THE Search_Page SHALL display Tip_Cards in a responsive grid layout
4. WHEN the Search_Page loads without query parameters, THE System SHALL fetch and display all tips using GET /api/Tip
5. WHEN a search query parameter q exists, THE System SHALL fetch tips filtered by the search term
6. WHEN a categoryId parameter exists, THE System SHALL fetch tips filtered by the category
7. WHEN both q and categoryId parameters exist, THE System SHALL fetch tips filtered by both search term and category
8. THE Search_Page SHALL reuse existing Tip_Card components from the home page
9. THE Search_Page SHALL display loading states while fetching tips
10. IF the tip fetch request fails, THEN THE Search_Page SHALL display an error message with a retry button

### Requirement 4: Category Selection Behavior

**User Story:** As a user, I want to click on category pills to filter results, so that I can narrow down tips to specific categories of interest.

#### Acceptance Criteria

1. WHEN a user clicks a Category_Pill, THE System SHALL immediately trigger a search request with the selected categoryId
2. WHEN a user clicks the "All" Category_Pill, THE System SHALL trigger a search request without a categoryId parameter
3. WHEN a Category_Pill is clicked, THE System SHALL update the URL to reflect the selected category
4. WHEN the "All" Category_Pill is clicked, THE System SHALL remove the categoryId parameter from the URL
5. WHEN a category is selected, THE System SHALL preserve any existing search query parameter q in the URL
6. THE System SHALL highlight only one Category_Pill at a time as selected
7. WHEN no categoryId parameter exists in the URL, THE "All" Category_Pill SHALL be highlighted as selected

### Requirement 5: Search Bar Integration

**User Story:** As a user, I want to use the search bar in the header to search for tips while maintaining my category filter, so that I can combine text search with category filtering.

#### Acceptance Criteria

1. WHEN a user submits a search query from the Search_Bar on the Search_Page, THE System SHALL navigate to /search with the q parameter
2. WHEN a search is submitted, THE System SHALL preserve any existing categoryId parameter in the URL
3. WHEN a search query is submitted, THE System SHALL fetch tips filtered by both the search term and selected category
4. THE Search_Bar SHALL update the URL with the q parameter when a search is performed
5. WHEN the Search_Page loads with a q parameter, THE Search_Bar SHALL display the search term

### Requirement 6: URL State Management

**User Story:** As a user, I want to share search result URLs with others and use browser navigation, so that I can bookmark searches and navigate back to previous results.

#### Acceptance Criteria

1. WHEN a category is selected, THE System SHALL update the URL to include the categoryId query parameter
2. WHEN the "All" category is selected, THE System SHALL remove the categoryId query parameter from the URL
3. WHEN a search is performed, THE System SHALL update the URL to include the q query parameter
4. THE System SHALL support URLs with both q and categoryId parameters simultaneously
5. WHEN the browser back button is pressed, THE System SHALL restore the previous search and filter state from the URL
6. WHEN the browser forward button is pressed, THE System SHALL restore the next search and filter state from the URL
7. WHEN the Search_Page loads, THE System SHALL read q and categoryId parameters from the URL and apply them to the search
8. WHEN the page is reloaded, THE System SHALL preserve the search and filter state from the URL parameters

### Requirement 7: Responsive Design

**User Story:** As a mobile user, I want the category filter to work smoothly on my device, so that I can easily browse and select categories on smaller screens.

#### Acceptance Criteria

1. THE Category_Filter_Bar SHALL support horizontal scrolling on all screen sizes
2. WHEN content overflows the viewport, THE Category_Filter_Bar SHALL display visual scroll indicators
3. THE Category_Pill SHALL have a minimum touch target size of 44x44 pixels on mobile devices
4. THE Category_Filter_Bar SHALL support touch-based scrolling gestures on mobile devices
5. THE Category_Filter_Bar SHALL display smooth scrolling animations when navigating between categories
6. THE Tip_Cards grid SHALL adapt to screen size using responsive breakpoints

### Requirement 8: Keyboard Navigation and Accessibility

**User Story:** As a keyboard user, I want to navigate through category options using my keyboard, so that I can filter results without using a mouse.

#### Acceptance Criteria

1. WHEN a user presses the Tab key, THE System SHALL move focus between Category_Pills in sequential order
2. WHEN a Category_Pill has focus and the user presses Enter or Space, THE System SHALL select that category
3. WHEN a Category_Pill has focus and the user presses the Right Arrow key, THE System SHALL move focus to the next Category_Pill
4. WHEN a Category_Pill has focus and the user presses the Left Arrow key, THE System SHALL move focus to the previous Category_Pill
5. THE Category_Pill SHALL display a visible focus indicator when focused
6. THE Category_Filter_Bar SHALL include appropriate ARIA labels for screen reader support
7. WHEN a category is selected, THE System SHALL announce the selection to screen readers using ARIA live regions
8. THE Category_Pill SHALL include aria-pressed attribute to indicate selected state

### Requirement 9: Performance and Caching

**User Story:** As a user, I want the category list to load quickly and not refetch unnecessarily, so that I have a smooth browsing experience.

#### Acceptance Criteria

1. THE System SHALL cache the category list for the duration of the user session
2. WHEN the Category_Filter_Bar mounts for the first time, THE System SHALL fetch categories from the API
3. WHEN the Category_Filter_Bar mounts subsequently in the same session, THE System SHALL use the cached category list
4. THE System SHALL fetch tips with a maximum timeout of 10 seconds
5. THE System SHALL fetch categories with a maximum timeout of 10 seconds

### Requirement 10: Error Handling

**User Story:** As a user, I want clear feedback when something goes wrong, so that I understand what happened and can take appropriate action.

#### Acceptance Criteria

1. IF the category API request fails, THEN THE System SHALL hide the Category_Filter_Bar
2. IF the tip search API request fails, THEN THE System SHALL display an error message to the user
3. WHEN an error message is displayed, THE System SHALL provide a "Try Again" button
4. WHEN the user clicks "Try Again", THE System SHALL retry the failed API request
5. IF an API request times out, THEN THE System SHALL display a timeout error message
6. THE System SHALL log API errors to the browser console for debugging purposes
