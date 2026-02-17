# Admin Category Creation - Tasks

## 1. Setup and Configuration

- [x] 1.1 Create constants file for validation rules and error messages
- [x] 1.2 Create TypeScript type definitions for admin category API
- [x] 1.3 Verify environment variables for API URL are configured

## 2. Middleware Implementation

- [x] 2.1 Create Next.js middleware file at project root
  - [x] 2.1.1 Implement route matching for `/admin/*` paths
  - [x] 2.1.2 Add authentication check (session cookie)
  - [x] 2.1.3 Add Firebase custom claims verification for admin status
  - [x] 2.1.4 Implement redirect to 404 for unauthorized users
  - [x] 2.1.5 Add comments for Phase 2 backend verification upgrade
  - [x] 2.1.6 Add error handling for invalid tokens

## 3. API Service Layer

- [x] 3.1 Create admin category API service file
  - [x] 3.1.1 Implement `uploadCategoryImage()` function
  - [x] 3.1.2 Implement `createCategory()` function
  - [x] 3.1.3 Implement `handleApiError()` helper function
  - [x] 3.1.4 Add proper TypeScript types for all functions
  - [x] 3.1.5 Add timeout handling for API requests
  - [x] 3.1.6 Add Authorization header with Bearer token

## 4. Category Form Component

- [x] 4.1 Create CategoryForm component file
  - [x] 4.1.1 Set up component as client component ('use client')
  - [x] 4.1.2 Define FormState interface and initialize state
  - [x] 4.1.3 Integrate useAuth() hook to get Firebase ID token

- [x] 4.2 Implement category name input
  - [x] 4.2.1 Create input field with label
  - [x] 4.2.2 Add onChange handler with validation
  - [x] 4.2.3 Display character count (e.g., "45/100")
  - [x] 4.2.4 Show validation errors below input
  - [x] 4.2.5 Add proper ARIA attributes for accessibility

- [x] 4.3 Implement image upload functionality
  - [x] 4.3.1 Create drag-and-drop zone UI
  - [x] 4.3.2 Add file input (hidden) for click-to-upload
  - [x] 4.3.3 Implement drag event handlers (onDragOver, onDragLeave, onDrop)
  - [x] 4.3.4 Implement file selection handler
  - [x] 4.3.5 Add file validation (type and size)
  - [x] 4.3.6 Show validation errors for invalid files
  - [x] 4.3.7 Add visual feedback during drag-over

- [x] 4.4 Implement image preview
  - [x] 4.4.1 Create preview UI with image display
  - [x] 4.4.2 Use URL.createObjectURL() for instant preview
  - [x] 4.4.3 Display file name and size
  - [x] 4.4.4 Add remove button to clear selection
  - [x] 4.4.5 Clean up object URL on component unmount
  - [x] 4.4.6 Add proper alt text for accessibility

- [x] 4.5 Implement form submission
  - [x] 4.5.1 Create submit button with loading state
  - [x] 4.5.2 Disable button when form is invalid
  - [x] 4.5.3 Implement handleSubmit function
  - [x] 4.5.4 Call uploadCategoryImage() API
  - [x] 4.5.5 Call createCategory() API with image metadata
  - [x] 4.5.6 Handle success (show message, reset form)
  - [x] 4.5.7 Handle errors (display user-friendly messages)
  - [x] 4.5.8 Prevent double submission

- [x] 4.6 Implement error handling
  - [x] 4.6.1 Create error display component/section
  - [x] 4.6.2 Map API errors to user-friendly messages
  - [x] 4.6.3 Handle 403 Forbidden (redirect to 404)
  - [x] 4.6.4 Handle 409 Conflict (category exists)
  - [x] 4.6.5 Handle network errors
  - [x] 4.6.6 Add ARIA live region for error announcements

- [x] 4.7 Add styling and responsive design
  - [x] 4.7.1 Style form layout with Tailwind CSS
  - [x] 4.7.2 Style drag-and-drop zone
  - [x] 4.7.3 Style image preview
  - [x] 4.7.4 Add mobile-responsive styles
  - [x] 4.7.5 Add focus states for accessibility
  - [x] 4.7.6 Ensure minimum touch target sizes (44x44px)

## 5. Page Component Updates

- [x] 5.1 Update admin category create page
  - [x] 5.1.1 Fix TypeScript errors (metadata function, unused params)
  - [x] 5.1.2 Import and render CategoryForm component
  - [x] 5.1.3 Add proper metadata for SEO
  - [x] 5.1.4 Update breadcrumb items
  - [x] 5.1.5 Add page description text

## 6. Testing

- [ ] 6.1 Write middleware tests
  - [ ] 6.1.1 Test: Allows access for authenticated admin users
  - [ ] 6.1.2 Test: Redirects unauthenticated users to 404
  - [ ] 6.1.3 Test: Redirects non-admin users to 404
  - [ ] 6.1.4 Test: Only protects /admin/* routes
  - [ ] 6.1.5 Test: Handles invalid tokens gracefully

- [ ] 6.2 Write API service tests
  - [ ] 6.2.1 Test: uploadCategoryImage() with correct headers
  - [ ] 6.2.2 Test: createCategory() with correct payload
  - [ ] 6.2.3 Test: Handles 400 validation errors
  - [ ] 6.2.4 Test: Handles 403 forbidden errors
  - [ ] 6.2.5 Test: Handles 409 conflict errors
  - [ ] 6.2.6 Test: Handles 500 server errors
  - [ ] 6.2.7 Test: Handles network errors

- [ ] 6.3 Write form component tests
  - [ ] 6.3.1 Test: Renders form with all fields
  - [ ] 6.3.2 Test: Validates category name (too short, too long, empty)
  - [ ] 6.3.3 Test: Validates image file (type, size)
  - [ ] 6.3.4 Test: Shows character count for category name
  - [ ] 6.3.5 Test: Displays image preview after selection
  - [ ] 6.3.6 Test: Removes image when remove button clicked
  - [ ] 6.3.7 Test: Disables submit button when form invalid
  - [ ] 6.3.8 Test: Shows loading state during submission
  - [ ] 6.3.9 Test: Displays success message after submission
  - [ ] 6.3.10 Test: Displays error message on failure
  - [ ] 6.3.11 Test: Handles drag-and-drop events
  - [ ] 6.3.12 Test: Prevents double submission

- [ ] 6.4 Write accessibility tests
  - [ ] 6.4.1 Test: All form inputs have labels
  - [ ] 6.4.2 Test: Error messages have role="alert"
  - [ ] 6.4.3 Test: Focus order is logical
  - [ ] 6.4.4 Test: Color contrast meets WCAG AA
  - [ ] 6.4.5 Test: Interactive elements have sufficient size

## 7. Integration and Manual Testing

- [ ] 7.1 Test complete flow with valid data
  - [ ] 7.1.1 Navigate to /admin/category/create as admin
  - [ ] 7.1.2 Enter valid category name
  - [ ] 7.1.3 Upload valid image
  - [ ] 7.1.4 Submit form
  - [ ] 7.1.5 Verify success message
  - [ ] 7.1.6 Verify form resets

- [ ] 7.2 Test unauthorized access
  - [ ] 7.2.1 Navigate to /admin/category/create as non-admin
  - [ ] 7.2.2 Verify redirect to 404
  - [ ] 7.2.3 Navigate as unauthenticated user
  - [ ] 7.2.4 Verify redirect to 404

- [ ] 7.3 Test validation errors
  - [ ] 7.3.1 Test category name too short
  - [ ] 7.3.2 Test category name too long
  - [ ] 7.3.3 Test empty category name
  - [ ] 7.3.4 Test invalid image type
  - [ ] 7.3.5 Test oversized image
  - [ ] 7.3.6 Test missing image

- [ ] 7.4 Test API error scenarios
  - [ ] 7.4.1 Test duplicate category name (409)
  - [ ] 7.4.2 Test network error
  - [ ] 7.4.3 Test backend admin verification failure (403)

- [ ] 7.5 Test responsive design
  - [ ] 7.5.1 Test on mobile viewport (< 640px)
  - [ ] 7.5.2 Test on tablet viewport (640px - 1024px)
  - [ ] 7.5.3 Test on desktop viewport (> 1024px)

- [ ] 7.6 Test accessibility
  - [ ] 7.6.1 Test keyboard-only navigation
  - [ ] 7.6.2 Test with screen reader
  - [ ] 7.6.3 Test focus indicators
  - [ ] 7.6.4 Test error announcements

## 8. Documentation

- [ ] 8.1 Add inline code comments for complex logic
- [ ] 8.2 Update README if needed with admin setup instructions
- [ ] 8.3 Document Phase 2 upgrade path in middleware comments

## 9. Code Review and Cleanup

- [x] 9.1 Run linter and fix any issues
- [x] 9.2 Run type checker and fix any TypeScript errors
- [x] 9.3 Remove console.log statements
- [x] 9.4 Verify no magic numbers or strings (use constants)
- [x] 9.5 Ensure consistent code formatting
- [x] 9.6 Review error messages for clarity

## 10. Deployment Preparation

- [ ] 10.1 Verify environment variables are documented
- [ ] 10.2 Test build process (npm run build)
- [ ] 10.3 Verify no build warnings or errors
- [ ] 10.4 Test production build locally
- [ ] 10.5 Prepare deployment notes for Phase 2 upgrade

## Notes

- All tasks should be completed in order within each section
- Each task should be tested before moving to the next
- Commit frequently with descriptive messages
- Follow conventional commit format
- Include tests in the same commit as the feature code
