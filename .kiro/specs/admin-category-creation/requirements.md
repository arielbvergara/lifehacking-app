# Admin Category Creation - Requirements

## Overview
Enable administrators to create new categories through a protected admin interface. The feature includes middleware-based access control, a form with image upload capabilities, and integration with backend APIs for category creation.

## User Stories

### US-1: Admin Access Control
**As an** administrator  
**I want** the admin pages to be protected by authentication and authorization  
**So that** only authorized admin users can access category management features

**Acceptance Criteria:**
1.1. Non-authenticated users attempting to access `/admin/category/create` are redirected to 404 page  
1.2. Authenticated non-admin users attempting to access `/admin/category/create` are redirected to 404 page  
1.3. Admin status is verified by checking Firebase custom claims for `admin: true`  
1.4. Middleware protection applies to all `/admin/*` routes  
1.5. The middleware includes comments and structure for future backend verification upgrade

### US-2: Category Name Input
**As an** administrator  
**I want** to enter a category name with validation  
**So that** I can create properly formatted categories

**Acceptance Criteria:**
2.1. Category name input field is clearly labeled  
2.2. Input validates minimum 2 characters  
2.3. Input validates maximum 100 characters  
2.4. Input shows character count (e.g., "45/100")  
2.5. Validation errors display in real-time as user types  
2.6. Input is trimmed before submission  
2.7. Empty or whitespace-only input shows validation error

### US-3: Image Upload with Drag and Drop
**As an** administrator  
**I want** to upload a category image using drag-and-drop or file picker  
**So that** I can easily add visual representation to categories

**Acceptance Criteria:**
3.1. Drag-and-drop zone is clearly visible with instructions  
3.2. Clicking the zone opens file picker dialog  
3.3. Only image files (jpeg, png, gif, webp) can be selected  
3.4. File size is validated (maximum 5MB)  
3.5. Invalid file type shows clear error message  
3.6. Oversized file shows clear error message with size limit  
3.7. Drag-and-drop zone shows visual feedback during drag-over  
3.8. Multiple file selection is prevented (only one image allowed)

### US-4: Image Preview
**As an** administrator  
**I want** to preview the uploaded image before submitting  
**So that** I can verify the image is correct

**Acceptance Criteria:**
4.1. Image preview displays immediately after file selection  
4.2. Preview shows the actual image with reasonable dimensions  
4.3. Preview includes file name and file size  
4.4. "Remove" button allows clearing the selected image  
4.5. After removal, drag-and-drop zone is shown again  
4.6. Preview is responsive and works on mobile devices

### US-5: Form Submission
**As an** administrator  
**I want** to submit the category creation form  
**So that** the new category is created in the system

**Acceptance Criteria:**
5.1. Submit button is disabled until form is valid (name + image)  
5.2. Submit button shows loading state during submission  
5.3. Form is disabled during submission to prevent double-submit  
5.4. Image is uploaded first to S3 via `POST /api/admin/categories/images`  
5.5. After successful image upload, category is created via `POST /api/admin/categories`  
5.6. Category creation includes image metadata from upload response  
5.7. On success, user sees success message  
5.8. On success, form is reset or user is redirected  
5.9. Firebase ID token is included in Authorization header for both API calls

### US-6: Error Handling
**As an** administrator  
**I want** to see clear error messages when something goes wrong  
**So that** I can understand and fix the issue

**Acceptance Criteria:**
6.1. Network errors show user-friendly message  
6.2. 400 Bad Request shows specific validation errors from API  
6.3. 403 Forbidden redirects to 404 page (not admin)  
6.4. 409 Conflict shows "Category name already exists" message  
6.5. 500 Internal Server Error shows generic error message  
6.6. Image upload errors don't prevent form reset  
6.7. Errors are displayed prominently near the relevant field  
6.8. Error messages are accessible to screen readers

### US-7: Page Layout and Navigation
**As an** administrator  
**I want** a consistent page layout with navigation  
**So that** I can easily navigate the admin interface

**Acceptance Criteria:**
7.1. Page includes standard Header component  
7.2. Page includes standard Footer component  
7.3. Breadcrumb shows: Home > Categories > Create category  
7.4. Page title is "Create category"  
7.5. Page has proper metadata for SEO  
7.6. Layout is responsive on mobile, tablet, and desktop

## API Integration

### Image Upload Endpoint
**Endpoint:** `POST /api/admin/categories/images`  
**Content-Type:** `multipart/form-data`  
**Authorization:** Bearer token (Firebase ID token)

**Request:**
```
file: binary (image file)
```

**Response (201 Created):**
```json
{
  "imageUrl": "https://cdn.example.com/categories/abc123.jpg",
  "imageStoragePath": "categories/abc123.jpg",
  "originalFileName": "my-image.jpg",
  "contentType": "image/jpeg",
  "fileSizeBytes": 245678,
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- 400: Validation error (file too large, invalid type)
- 403: Forbidden (not admin)
- 500: Server error

### Category Creation Endpoint
**Endpoint:** `POST /api/admin/categories`  
**Content-Type:** `application/json`  
**Authorization:** Bearer token (Firebase ID token)

**Request:**
```json
{
  "name": "Productivity",
  "image": {
    "imageUrl": "https://cdn.example.com/categories/abc123.jpg",
    "imageStoragePath": "categories/abc123.jpg",
    "originalFileName": "my-image.jpg",
    "contentType": "image/jpeg",
    "fileSizeBytes": 245678,
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Productivity",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": null,
  "image": {
    "imageUrl": "https://cdn.example.com/categories/abc123.jpg",
    "imageStoragePath": "categories/abc123.jpg",
    "originalFileName": "my-image.jpg",
    "contentType": "image/jpeg",
    "fileSizeBytes": 245678,
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: Validation error (name too short/long, missing fields)
- 403: Forbidden (not admin)
- 409: Conflict (category name already exists)
- 500: Server error

## Technical Constraints

1. **Framework:** Next.js 14+ with App Router
2. **Authentication:** Firebase Authentication with custom claims
3. **Styling:** Tailwind CSS (consistent with existing components)
4. **File Upload:** Browser File API with FormData
5. **Image Validation:** Client-side only (backend validates magic bytes)
6. **State Management:** React hooks (useState, useCallback)
7. **API Client:** Fetch API with proper error handling
8. **Accessibility:** WCAG 2.1 Level AA compliance

## Security Considerations

### OWASP Top 10 2025 Mitigations

**A01:2021 - Broken Access Control**
- Middleware checks authentication before allowing access to admin routes
- Firebase custom claims verify admin status
- Backend APIs independently verify admin status (defense in depth)
- No client-side admin status storage that could be manipulated

**A03:2021 - Injection**
- Category name is validated and trimmed
- No direct HTML rendering of user input
- Backend performs additional validation

**A04:2021 - Insecure Design**
- Two-step upload process (image first, then category)
- Proper error handling without exposing sensitive information
- Failed image upload doesn't leave orphaned data

**A05:2021 - Security Misconfiguration**
- Authorization header properly set with Bearer token
- CORS handled by backend
- No sensitive data in error messages

**A08:2021 - Software and Data Integrity Failures**
- File type validation on client (UX)
- Backend validates file magic bytes (security)
- File size limits enforced

## Future Enhancements

1. **Backend Verification (Phase 2):**
   - Replace Firebase custom claims check with `GET /api/user/me` API call
   - Middleware calls backend to verify admin status
   - More secure and centralized authorization

2. **Additional Features:**
   - Category list/management page
   - Category edit functionality
   - Category deletion with confirmation
   - Bulk category operations
   - Image cropping/editing before upload

## Non-Functional Requirements

1. **Performance:**
   - Image preview renders within 100ms
   - Form validation feedback within 50ms
   - Page load time under 2 seconds

2. **Accessibility:**
   - All form inputs have proper labels
   - Error messages announced to screen readers
   - Keyboard navigation fully supported
   - Focus management during form submission

3. **Usability:**
   - Clear visual feedback for all interactions
   - Intuitive drag-and-drop interface
   - Mobile-friendly touch targets (minimum 44x44px)
   - Consistent with existing admin UI patterns

4. **Browser Support:**
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - Last 2 versions
   - Mobile browsers (iOS Safari, Chrome Mobile)

## Reference Documentation

- API Schema: `#[[file:docs/api-schema.json]]`
- Firebase Custom Claims: https://firebase.google.com/docs/auth/admin/custom-claims
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- OWASP Top 10 2025: https://owasp.org/Top10/
