# Requirements Document

## Introduction

This feature adds a post-signup welcome page and user profile page to the application. After successful signup, users are redirected to a welcome page that celebrates their account creation and provides navigation options. Users can then view their profile information or start exploring the application.

## Glossary

- **System**: The Next.js web application
- **User**: An authenticated person who has completed the signup process
- **Welcome_Page**: The page displayed at `/welcome` after successful signup
- **Profile_Page**: The page displayed at `/profile` showing user account information
- **Auth_Context**: The React context providing authentication state and methods
- **Backend_API**: The ASP.NET Core API that stores user profile data
- **Firebase_Auth**: The Firebase authentication service managing user sessions
- **ID_Token**: The Firebase JWT token used for API authentication

## Requirements

### Requirement 1: Welcome Page Display

**User Story:** As a user who just signed up, I want to see a celebration message, so that I feel welcomed and know my account was created successfully.

#### Acceptance Criteria

1. WHEN a user successfully completes signup, THE System SHALL redirect them to `/welcome`
2. THE Welcome_Page SHALL display a celebration illustration (high-five graphic with green checkmark)
3. THE Welcome_Page SHALL display the heading "Welcome to the Family!"
4. THE Welcome_Page SHALL display the subtext "Your account has been successfully created. Ready to make life a little easier?"
5. THE Welcome_Page SHALL use the existing design system (colors, fonts, Tailwind CSS classes)
6. THE Welcome_Page SHALL display on a white card with rounded corners on a gradient background
7. THE Welcome_Page SHALL be responsive for both mobile and desktop viewports

### Requirement 2: Welcome Page Navigation

**User Story:** As a user on the welcome page, I want clear navigation options, so that I can choose to explore tips or view my profile.

#### Acceptance Criteria

1. THE Welcome_Page SHALL display a "Start Exploring Tips" button with an arrow icon
2. WHEN a user clicks "Start Exploring Tips", THE System SHALL navigate to `/` (home page)
3. THE Welcome_Page SHALL display a "View My Profile" link with a user icon
4. WHEN a user clicks "View My Profile", THE System SHALL navigate to `/profile`
5. THE "Start Exploring Tips" button SHALL use the primary green color (#2bee2b)
6. THE "View My Profile" link SHALL use gray styling to appear as a secondary action

### Requirement 3: Profile Page Data Display

**User Story:** As a user, I want to view my account information, so that I can verify my profile details.

#### Acceptance Criteria

1. THE Profile_Page SHALL fetch user data from the Backend_API endpoint `GET /api/User/me`
2. THE Profile_Page SHALL display the user's ID
3. THE Profile_Page SHALL display the user's email address
4. THE Profile_Page SHALL display the user's display name (or indicate if not set)
5. THE Profile_Page SHALL display the account creation date
6. THE Profile_Page SHALL display the Firebase ID_Token in full
7. WHEN the Backend_API returns user data, THE System SHALL render it in a clean, readable layout
8. THE Profile_Page SHALL use the existing `getUserProfile` function from `lib/api/user.ts`

### Requirement 4: Profile Page Authentication

**User Story:** As a system, I want to protect the profile page, so that only authenticated users can view their profile.

#### Acceptance Criteria

1. THE Profile_Page SHALL require authentication to access
2. WHEN an unauthenticated user attempts to access `/profile`, THE System SHALL redirect them to `/login`
3. THE Profile_Page SHALL use the ID_Token from Auth_Context for API authentication
4. WHEN Auth_Context indicates loading state, THE Profile_Page SHALL display a loading indicator
5. WHEN the Backend_API request fails, THE Profile_Page SHALL display an error message

### Requirement 5: Profile Page Navigation

**User Story:** As a user viewing my profile, I want to navigate back to the home page, so that I can continue using the application.

#### Acceptance Criteria

1. THE Profile_Page SHALL display a navigation element to return to the home page
2. WHEN a user clicks the home navigation element, THE System SHALL navigate to `/`
3. THE Profile_Page SHALL maintain consistent styling with other authenticated pages

### Requirement 6: Signup Flow Integration

**User Story:** As a developer, I want the signup form to redirect to the welcome page, so that users see the celebration message after signup.

#### Acceptance Criteria

1. WHEN the `SignupForm` component's `onSuccess` callback is invoked, THE System SHALL navigate to `/welcome`
2. THE signup page at `/signup` SHALL pass a navigation handler to the `SignupForm` component
3. THE navigation SHALL occur after successful Firebase authentication and backend user creation
4. IF backend user creation fails, THE System SHALL display an error and NOT navigate to the welcome page

### Requirement 7: Design System Consistency

**User Story:** As a user, I want the new pages to match the existing design, so that the application feels cohesive.

#### Acceptance Criteria

1. THE Welcome_Page SHALL use the same gradient background as login and signup pages
2. THE Welcome_Page SHALL use the same card styling (white background, rounded corners, shadow)
3. THE Welcome_Page SHALL use the Plus Jakarta Sans font family
4. THE Welcome_Page SHALL use Material Icons Round for icons
5. THE Profile_Page SHALL use consistent typography and spacing with other pages
6. THE System SHALL use existing Tailwind CSS utility classes and custom classes from `globals.css`
