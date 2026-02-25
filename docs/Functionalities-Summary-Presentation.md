# LifeHacking Application - Functionalities Overview

> A comprehensive guide to all features and capabilities of the LifeHacking platform, organized by user role.

---

## Table of Contents

- [1. Non-Authenticated Users (Public Access)](#1-non-authenticated-users-public-access)
- [2. Authenticated Users (Registered Users)](#2-authenticated-users-registered-users)
- [3. Admin Users (Administrative Access)](#3-admin-users-administrative-access)

---

## 1. Non-Authenticated Users (Public Access)

### Browse & Discovery

#### Home Page
- View featured tips showcasing the most recent lifehack
- Browse latest lifehacks in a grid layout
- Explore categories through an interactive carousel
- Access quick search functionality from the hero section

#### Category Browsing
- Browse all available categories with visual cards
- View tip counts for each category
- See category images delivered via CloudFront CDN
- Navigate to category-specific tip listings

#### Category-Specific Tips
- View all tips within a specific category
- Pagination support for large tip collections
- Sort tips by:
  - Creation date
  - Update date
  - Title (alphabetically)
- Sort direction control (ascending/descending)

#### Tip Detail View
- Access comprehensive tip information:
  - Title and description
  - Step-by-step instructions with numbered steps
  - Category assignment
  - Tags for easy discovery
  - Optional video embed (YouTube watch/shorts, Instagram)
  - High-quality images via CloudFront CDN
  - Creation and update timestamps
- View related tips from the same category
- Responsive layout optimized for all devices

#### Search Functionality
- Global search across all tips
- Search by keyword (matches title and description)
- Advanced filtering options:
  - Filter by category
  - Filter by multiple tags simultaneously
  - Sort by creation date, update date, or title
  - Control sort direction
- Pagination with configurable page size
- Real-time results with URL-based state management

### Content Features

#### Video Integration
- Embedded video player for supported platforms:
  - YouTube watch videos
  - YouTube shorts
  - Instagram posts
- Responsive video embeds
- Modal video player for enhanced viewing

#### Related Content
- Discover related tips based on category
- Intelligent content recommendations
- Easy navigation between similar tips

#### Responsive Design
- Mobile-first responsive interface
- Touch-friendly navigation
- Optimized layouts for all screen sizes
- Custom breakpoints for optimal viewing

#### SEO Optimization
- Structured data (JSON-LD) for search engines
- Open Graph tags for social media sharing
- Twitter cards for enhanced Twitter previews
- Canonical URLs for proper indexing
- Optimized meta descriptions and titles

### Static Pages

#### About Page
- Information about the LifeHacking platform
- Mission and vision statements
- Platform features overview

#### Contact Page
- Contact information
- Support channels
- Inquiry forms

#### Privacy Policy
- Comprehensive privacy policy
- Data collection and usage information
- User rights and protections

#### Terms of Service
- Platform terms and conditions
- User responsibilities
- Service limitations and disclaimers

---

## 2. Authenticated Users (Registered Users)

### All Public Features PLUS:

### Account Management

#### User Registration
- Sign up with email and password via Firebase Authentication
- Optional display name during registration
- Secure password requirements (minimum 8 characters)
- Email verification support
- Automatic user profile creation in backend

#### User Login
- Email/password authentication
- "Remember Me" option for persistent sessions
- Secure JWT token-based authentication
- Automatic session management
- Redirect to welcome page after first login

#### Password Recovery
- Forgot password functionality
- Email-based password reset
- Secure reset token generation
- Password strength validation

#### Profile Management
- View comprehensive profile information:
  - Email address
  - Display name
  - Account creation date
  - Total saved tips count
- Update display name
- Profile avatar display
- Account statistics dashboard
- Secure logout functionality

### Favorites System

#### Add to Favorites
- Save tips to personal favorites collection
- One-click favorite button on tip cards
- Visual feedback for favorited tips
- Server-side storage for cross-device sync

#### Remove from Favorites
- Remove tips from favorites collection
- Confirmation for accidental removals
- Instant UI updates

#### View Favorites
- Dedicated favorites page with full functionality:
  - Search within saved favorites
  - Filter by category
  - Filter by multiple tags
  - Sort by title, creation date, or update date
  - Control sort direction
  - Pagination support
- Empty state guidance when no favorites exist
- Quick access from navigation menu

#### Favorites Merge
- Automatic merge of anonymous favorites on login
- Seamless transition from local storage to server
- Deduplication of existing favorites
- Detailed merge summary with counts:
  - Successfully added favorites
  - Skipped duplicates
  - Failed additions
- Idempotent operation (safe to retry)

#### Favorites Count
- Real-time count of saved tips
- Display in profile header
- Quick reference in navigation

### Enhanced User Experience

#### Personalized Welcome
- Welcome page after successful registration
- Onboarding guidance
- Quick start tips
- Platform feature highlights

#### Profile Dashboard
- Centralized view of user information
- Activity summary
- Quick access to favorites
- Account management shortcuts

#### Persistent Favorites
- Server-side storage of favorites
- Automatic sync across devices
- No data loss on browser clear
- Backup and recovery support

---

## 3. Admin Users (Administrative Access)

### All Authenticated User Features PLUS:

### Dashboard & Analytics

#### Admin Dashboard
- Comprehensive statistics overview with visual cards
- Real-time metrics for:
  - **Users**: Total count, daily/weekly/monthly/yearly growth
  - **Categories**: Total count, daily/weekly/monthly/yearly growth
  - **Tips**: Total count, daily/weekly/monthly/yearly growth
- Trend indicators showing growth patterns
- Time period comparisons (last vs. this)
- 24-hour caching for optimal performance
- Responsive grid layout

### Category Management

#### View All Categories
- Paginated list of all categories
- Search functionality across category names
- Sort by name or creation date
- Visual category cards with images
- Tip count per category
- Quick action buttons (edit, delete)

#### Create Category
- Add new categories with validation:
  - Name: 2-100 characters (trimmed)
  - Case-insensitive uniqueness check
- Upload category images:
  - Maximum file size: 5MB
  - Supported formats: JPEG, PNG, GIF, WebP
  - Magic byte validation for security
  - Automatic upload to AWS S3
  - CloudFront CDN URL generation
- Real-time validation feedback
- Success confirmation with created category details

#### Edit Category
- Update category name with validation
- Replace category image
- Duplicate name detection
- Preview changes before saving
- Validation error handling with field-level details

#### Delete Category
- Soft-delete categories (marked as deleted, not removed)
- Cascading soft-delete of all associated tips
- Confirmation dialog for safety
- Undo capability through database
- Audit trail preservation

#### Category Image Upload
- Dedicated image upload endpoint
- File size validation (5MB limit)
- Content type verification
- Format validation via magic bytes
- S3 storage with metadata:
  - Original filename
  - Content type
  - File size
  - Upload timestamp
  - Storage path
- CloudFront CDN URL for fast delivery

### Tip Management

#### View All Tips
- Comprehensive tip management interface
- Advanced search functionality:
  - Search by title and description
  - Filter by category
  - Filter by multiple tags
  - Sort by creation date, update date, or title
  - Control sort direction
- Pagination with configurable page size
- Quick action buttons (edit, delete)
- Tip preview cards with key information

#### Create Tip
- Comprehensive tip creation form with validation:
  - **Title**: 5-200 characters (trimmed)
  - **Description**: 10-2000 characters (trimmed)
  - **Steps**: At least one step required
    - Step number: Must be >= 1
    - Step description: 10-500 characters (trimmed)
  - **Category**: Required, must exist and not be deleted
  - **Tags**: Optional, maximum 10 tags
    - Each tag: 1-50 characters (trimmed)
  - **Video URL**: Optional, validated URL from:
    - YouTube watch: `https://www.youtube.com/watch?v=*`
    - YouTube shorts: `https://www.youtube.com/shorts/*`
    - Instagram: `https://www.instagram.com/p/*`
  - **Image**: Optional upload (max 5MB)
- Real-time validation feedback
- Rich text editing support
- Preview before publishing
- Success confirmation with created tip details
- Content automatically generated from video link with Gemini AI.

#### Edit Tip
- Update all tip fields with validation
- Change category assignment
- Add/remove/modify tags
- Update video URL
- Replace tip image
- Modify step-by-step instructions
- Preview changes before saving
- Validation error handling

#### Delete Tip
- Soft-delete tips (marked as deleted, not removed)
- Confirmation dialog for safety
- Preservation of tip data for audit
- Undo capability through database
- Associated favorites remain intact

#### Tip Image Upload
- Dedicated image upload endpoint
- File size validation (5MB limit)
- Content type verification
- Format validation via magic bytes
- S3 storage with complete metadata
- CloudFront CDN URL generation

### User Management

#### View All Users
- Paginated user list with advanced features:
  - Search across email, name, and ID
  - Sort by email, name, or creation date
  - Control sort direction
  - Filter by deleted status
  - Configurable page size (default: 20)
- User information display:
  - Email address
  - Display name
  - Account creation date
  - User ID
  - Deletion status
- Quick action buttons (edit, delete)

#### Create Admin User
- Create new admin accounts with:
  - Email address (required)
  - Display name (optional)
  - Password (required, validated)
- Automatic admin role assignment
- Firebase Authentication integration
- Backend user profile creation
- Success confirmation

#### View User Details
- Access individual user profiles by:
  - Internal user ID (UUID)
  - Email address
- Comprehensive user information:
  - Email
  - Display name
  - External auth ID (Firebase UID)
  - Account creation date
  - Last update date
  - Deletion status
- User activity summary
- Favorites count

#### Update User Name
- Modify user display names
- Validation for name format
- Update confirmation
- Audit trail logging

#### Delete User
- Soft-delete user accounts
- Confirmation dialog for safety
- Preservation of user data for audit
- Associated favorites handling
- Conflict detection (e.g., active sessions)

#### User Search
- Advanced search functionality:
  - Search by email (partial match)
  - Search by name (partial match)
  - Search by user ID (exact match)
- Real-time search results
- Highlighted search terms
- Pagination support