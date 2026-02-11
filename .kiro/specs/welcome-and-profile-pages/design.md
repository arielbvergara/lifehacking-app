# Design Document: Welcome and Profile Pages

## Overview

This feature introduces two new pages to the application: a welcome page (`/welcome`) and a profile page (`/profile`). The welcome page serves as a post-signup celebration screen that provides users with clear next steps, while the profile page displays user account information fetched from the backend API.

The implementation follows the existing Next.js App Router architecture with client-side components for authentication-dependent UI. Both pages integrate with the existing authentication context and design system to maintain visual and functional consistency.

## Architecture

### Page Structure

```
app/
├── welcome/
│   └── page.tsx          # Welcome page route
└── profile/
    └── page.tsx          # Profile page route

components/
├── welcome/
│   ├── welcome-card.tsx       # Main welcome content card
│   ├── celebration-icon.tsx   # SVG celebration illustration
│   └── welcome-actions.tsx    # Navigation buttons
└── profile/
    ├── profile-card.tsx       # Profile information display
    ├── profile-field.tsx      # Reusable field display component
    └── profile-loading.tsx    # Loading state component
```

### Navigation Flow

```
Signup Success → /welcome → /profile (optional)
                          → / (home)
```

### Authentication Integration

Both pages integrate with the existing `AuthContext` to access:
- `user`: Firebase user object
- `idToken`: JWT token for API authentication
- `loading`: Authentication loading state

The profile page implements route protection by checking authentication state and redirecting unauthenticated users to `/login`.

## Components and Interfaces

### Welcome Page Components

#### WelcomeCard Component

```typescript
// components/welcome/welcome-card.tsx
interface WelcomeCardProps {
  // No props needed - uses router for navigation
}

export function WelcomeCard(): JSX.Element
```

Renders the main welcome content including:
- Celebration icon
- Welcome heading and subtext
- Navigation actions (Start Exploring Tips, View My Profile)

#### CelebrationIcon Component

```typescript
// components/welcome/celebration-icon.tsx
export function CelebrationIcon(): JSX.Element
```

Renders an SVG illustration of a high-five gesture with a green checkmark. The icon uses the primary green color (#2bee2b) and is sized appropriately for the card layout.

#### WelcomeActions Component

```typescript
// components/welcome/welcome-actions.tsx
interface WelcomeActionsProps {
  onExplore: () => void;
  onViewProfile: () => void;
}

export function WelcomeActions({ onExplore, onViewProfile }: WelcomeActionsProps): JSX.Element
```

Renders the two navigation options:
- Primary button: "Start Exploring Tips" with arrow icon
- Secondary link: "View My Profile" with user icon

### Profile Page Components

#### ProfileCard Component

```typescript
// components/profile/profile-card.tsx
interface ProfileCardProps {
  profile: UserProfile;
  idToken: string;
}

export function ProfileCard({ profile, idToken }: ProfileCardProps): JSX.Element
```

Displays user profile information in a structured layout with labeled fields.

#### ProfileField Component

```typescript
// components/profile/profile-field.tsx
interface ProfileFieldProps {
  label: string;
  value: string | null;
  multiline?: boolean;
}

export function ProfileField({ label, value, multiline }: ProfileFieldProps): JSX.Element
```

Reusable component for displaying a single profile field with a label and value. The `multiline` prop enables text wrapping for long values like tokens.

#### ProfileLoading Component

```typescript
// components/profile/profile-loading.tsx
export function ProfileLoading(): JSX.Element
```

Displays a loading skeleton or spinner while profile data is being fetched.

### Page Components

#### Welcome Page

```typescript
// app/welcome/page.tsx
export default function WelcomePage(): JSX.Element
```

Client component that:
1. Renders the welcome card on the gradient background
2. Uses Next.js router for navigation
3. Maintains consistent layout with auth pages (nav, footer, decorative elements)

#### Profile Page

```typescript
// app/profile/page.tsx
export default function ProfilePage(): JSX.Element
```

Client component that:
1. Checks authentication state from AuthContext
2. Redirects to `/login` if not authenticated
3. Fetches user profile data using `getUserProfile(idToken)`
4. Displays loading state while fetching
5. Displays error state if fetch fails
6. Renders ProfileCard with fetched data

## Data Models

### UserProfile Interface

Already defined in `lib/api/user.ts`:

```typescript
interface UserProfile {
  id: string;              // Backend user ID (GUID)
  email: string;           // User's email address
  displayName: string | null;  // Optional display name
  createdAt: string;       // ISO 8601 timestamp
}
```

### Profile Display Data

Extended data structure for profile page display:

```typescript
interface ProfileDisplayData extends UserProfile {
  idToken: string;  // Firebase JWT token from AuthContext
}
```

The profile page combines data from two sources:
1. Backend API (`UserProfile` from `GET /api/User/me`)
2. Auth Context (`idToken` for display purposes)

## Data Flow

### Welcome Page Flow

```
User completes signup
  → SignupForm.onSuccess() called
  → router.push('/welcome')
  → WelcomePage renders
  → User clicks navigation button
  → router.push('/') or router.push('/profile')
```

### Profile Page Flow

```
User navigates to /profile
  → ProfilePage component mounts
  → Check AuthContext.loading
    → If true: show loading state
  → Check AuthContext.user
    → If null: redirect to /login
  → Fetch getUserProfile(idToken)
    → If loading: show ProfileLoading
    → If error: show error message
    → If success: render ProfileCard with data
```

### API Integration

The profile page uses the existing `getUserProfile` function:

```typescript
// lib/api/user.ts
async function getUserProfile(idToken: string): Promise<UserProfile>
```

Request:
```
GET /api/User/me
Headers:
  Authorization: Bearer {idToken}
```

Response (200 OK):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

Error Responses:
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: User profile doesn't exist in backend
- 500 Internal Server Error: Backend error


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Navigation Properties

**Property 1: Signup Success Navigation**

*For any* successful signup completion, the system should navigate to `/welcome`.

**Validates: Requirements 1.1**

**Property 2: Explore Button Navigation**

*For any* click on the "Start Exploring Tips" button, the system should navigate to `/` (home page).

**Validates: Requirements 2.2**

**Property 3: Profile Link Navigation**

*For any* click on the "View My Profile" link, the system should navigate to `/profile`.

**Validates: Requirements 2.4**

**Property 4: Profile Home Navigation**

*For any* click on the home navigation element from the profile page, the system should navigate to `/`.

**Validates: Requirements 5.2**

**Property 5: Signup Success Callback Navigation**

*For any* invocation of the SignupForm's onSuccess callback, the system should navigate to `/welcome`.

**Validates: Requirements 6.1**

### Data Display Properties

**Property 6: Profile Data Rendering**

*For any* user profile data returned from the API (including id, email, displayName, createdAt) and any ID token, all fields should be rendered in the profile page UI.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

### Authentication Properties

**Property 7: Unauthenticated Profile Access**

*For any* unauthenticated user attempting to access `/profile`, the system should redirect to `/login`.

**Validates: Requirements 4.1, 4.2**

**Property 8: Loading State Display**

*For any* authentication loading state, the profile page should display a loading indicator.

**Validates: Requirements 4.4**

**Property 9: API Error Display**

*For any* backend API request failure, the profile page should display an error message.

**Validates: Requirements 4.5**

**Property 10: Backend Creation Failure Handling**

*For any* backend user creation failure during signup, the system should display an error and NOT navigate to the welcome page.

**Validates: Requirements 6.4**

## Error Handling

### Welcome Page Error Handling

The welcome page is a static presentation page with no data fetching, so error handling is minimal:

1. **Navigation Errors**: If navigation fails (router errors), the error will be caught by Next.js error boundaries
2. **Missing Auth Context**: If AuthContext is not available, the app will throw an error at the provider level (handled by existing error boundaries)

### Profile Page Error Handling

The profile page implements comprehensive error handling for authentication and data fetching:

#### Authentication Errors

1. **Unauthenticated Access**
   - Check: `if (!user && !loading)`
   - Action: Redirect to `/login` using `router.push('/login')`
   - User Experience: Seamless redirect, no error message shown

2. **Token Unavailable**
   - Check: `if (!idToken && !loading)`
   - Action: Redirect to `/login`
   - User Experience: Seamless redirect

#### API Errors

1. **Network Errors**
   - Scenario: Network request fails (no internet, server down)
   - Handling: Catch error in try-catch block
   - Display: Error message with retry option
   - Message: "Failed to load profile. Please check your connection and try again."

2. **401 Unauthorized**
   - Scenario: Token expired or invalid
   - Handling: Catch error, check response status
   - Action: Redirect to `/login` (token refresh not implemented yet)
   - Message: "Your session has expired. Please sign in again."

3. **404 Not Found**
   - Scenario: User profile doesn't exist in backend
   - Handling: Catch error with specific message check
   - Display: Error message with support contact
   - Message: "Profile not found. Please contact support."

4. **500 Server Error**
   - Scenario: Backend server error
   - Handling: Catch error, check response status
   - Display: Error message with retry option
   - Message: "Server error. Please try again later."

#### Error State Component

```typescript
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}
```

### Signup Flow Error Handling

The signup page already handles errors from the SignupForm component. The integration with the welcome page adds one additional error case:

1. **Navigation After Signup**
   - Scenario: Navigation to `/welcome` fails
   - Handling: Router error caught by Next.js
   - Fallback: User remains on signup page with success state
   - Note: This is an edge case; router.push rarely fails in Next.js

## Testing Strategy

This feature requires both unit tests and property-based tests to ensure comprehensive coverage. Unit tests validate specific examples and edge cases, while property tests verify universal properties across all inputs.

### Testing Approach

**Unit Tests**: Focus on specific examples, component rendering, and integration points
**Property Tests**: Verify universal properties that should hold for all inputs

### Unit Test Coverage

#### Welcome Page Tests

1. **Component Rendering** (Example Tests)
   - Test: Welcome card renders with celebration icon
   - Test: Heading "Welcome to the Family!" is displayed
   - Test: Subtext is displayed correctly
   - Test: "Start Exploring Tips" button is present with arrow icon
   - Test: "View My Profile" link is present with user icon
   - Test: Card has correct styling classes (bg-white, rounded-3xl)
   - Test: Page has gradient background class
   - **Validates: Requirements 1.2, 1.3, 1.4, 1.6, 2.1, 2.3, 2.5, 2.6, 7.1, 7.2**

2. **Navigation Integration** (Example Tests)
   - Test: Page uses Next.js router for navigation
   - Test: Navigation functions are called with correct paths
   - **Validates: Requirements 2.2, 2.4**

#### Profile Page Tests

1. **Component Rendering** (Example Tests)
   - Test: Profile card renders with user data
   - Test: Each ProfileField component displays label and value
   - Test: Loading component displays during fetch
   - Test: Error component displays on API failure
   - Test: Home navigation element is present
   - Test: API function `getUserProfile` is called with correct token
   - **Validates: Requirements 3.1, 3.8, 5.1, 7.3, 7.4**

2. **Authentication Integration** (Example Tests)
   - Test: Page uses AuthContext for user and token
   - Test: Token from context is passed to API function
   - **Validates: Requirements 4.3**

3. **Error Scenarios** (Example Tests)
   - Test: 401 error redirects to login
   - Test: 404 error displays "Profile not found" message
   - Test: 500 error displays "Server error" message
   - Test: Network error displays connection message
   - **Validates: Requirements 4.5**

#### Signup Integration Tests

1. **Callback Integration** (Example Tests)
   - Test: Signup page passes navigation handler to SignupForm
   - Test: Navigation occurs after successful auth and backend creation
   - Test: Error displayed and no navigation on backend failure
   - **Validates: Requirements 6.2, 6.3, 6.4**

### Property-Based Test Coverage

Property-based tests should run a minimum of 100 iterations per test to ensure comprehensive input coverage. Each test must reference its design document property using the tag format: **Feature: welcome-and-profile-pages, Property {number}: {property_text}**

#### Navigation Properties (Property Tests)

1. **Property 1: Signup Success Navigation**
   - Generator: Random signup success states
   - Test: For any successful signup, verify router.push('/welcome') is called
   - Tag: **Feature: welcome-and-profile-pages, Property 1: Signup Success Navigation**
   - **Validates: Requirements 1.1**

2. **Property 2: Explore Button Navigation**
   - Generator: Random button click events
   - Test: For any click on explore button, verify router.push('/') is called
   - Tag: **Feature: welcome-and-profile-pages, Property 2: Explore Button Navigation**
   - **Validates: Requirements 2.2**

3. **Property 3: Profile Link Navigation**
   - Generator: Random link click events
   - Test: For any click on profile link, verify router.push('/profile') is called
   - Tag: **Feature: welcome-and-profile-pages, Property 3: Profile Link Navigation**
   - **Validates: Requirements 2.4**

4. **Property 4: Profile Home Navigation**
   - Generator: Random navigation click events
   - Test: For any click on home navigation, verify router.push('/') is called
   - Tag: **Feature: welcome-and-profile-pages, Property 4: Profile Home Navigation**
   - **Validates: Requirements 5.2**

5. **Property 5: Signup Success Callback Navigation**
   - Generator: Random onSuccess callback invocations
   - Test: For any onSuccess call, verify router.push('/welcome') is called
   - Tag: **Feature: welcome-and-profile-pages, Property 5: Signup Success Callback Navigation**
   - **Validates: Requirements 6.1**

#### Data Display Properties (Property Tests)

6. **Property 6: Profile Data Rendering**
   - Generator: Random UserProfile objects with varying field values (including null displayName)
   - Test: For any profile data, verify all fields (id, email, displayName or fallback, createdAt, idToken) appear in rendered output
   - Tag: **Feature: welcome-and-profile-pages, Property 6: Profile Data Rendering**
   - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

#### Authentication Properties (Property Tests)

7. **Property 7: Unauthenticated Profile Access**
   - Generator: Random unauthenticated states (user = null, loading = false)
   - Test: For any unauthenticated state, verify router.push('/login') is called
   - Tag: **Feature: welcome-and-profile-pages, Property 7: Unauthenticated Profile Access**
   - **Validates: Requirements 4.1, 4.2**

8. **Property 8: Loading State Display**
   - Generator: Random loading states (loading = true)
   - Test: For any loading state, verify loading indicator is rendered
   - Tag: **Feature: welcome-and-profile-pages, Property 8: Loading State Display**
   - **Validates: Requirements 4.4**

9. **Property 9: API Error Display**
   - Generator: Random API error responses (network errors, 401, 404, 500)
   - Test: For any error, verify error message is displayed
   - Tag: **Feature: welcome-and-profile-pages, Property 9: API Error Display**
   - **Validates: Requirements 4.5**

10. **Property 10: Backend Creation Failure Handling**
    - Generator: Random backend creation failure scenarios
    - Test: For any backend failure, verify error is displayed and router.push is NOT called
    - Tag: **Feature: welcome-and-profile-pages, Property 10: Backend Creation Failure Handling**
    - **Validates: Requirements 6.4**

### Testing Tools

- **Unit Testing**: Jest + React Testing Library (already configured in project)
- **Property-Based Testing**: fast-check (TypeScript property-based testing library)
- **Mocking**: Jest mocks for Next.js router, AuthContext, and API functions

### Test Organization

```
__tests__/
├── components/
│   ├── welcome/
│   │   ├── welcome-card.test.tsx
│   │   ├── welcome-card.properties.test.tsx
│   │   ├── celebration-icon.test.tsx
│   │   └── welcome-actions.test.tsx
│   └── profile/
│       ├── profile-card.test.tsx
│       ├── profile-card.properties.test.tsx
│       ├── profile-field.test.tsx
│       └── profile-loading.test.tsx
└── app/
    ├── welcome/
    │   └── page.test.tsx
    └── profile/
        ├── page.test.tsx
        └── page.properties.test.tsx
```

### Property Test Configuration

Each property test file should configure fast-check with:
- Minimum 100 iterations: `fc.assert(fc.property(...), { numRuns: 100 })`
- Appropriate generators for the data being tested
- Clear property descriptions matching the design document
- Tags referencing the specific property number

Example property test structure:

```typescript
import * as fc from 'fast-check';

describe('Profile Page Properties', () => {
  it('Property 6: Profile Data Rendering', () => {
    // Feature: welcome-and-profile-pages, Property 6: Profile Data Rendering
    
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          displayName: fc.option(fc.string(), { nil: null }),
          createdAt: fc.date().map(d => d.toISOString()),
        }),
        fc.string(), // idToken
        (profile, idToken) => {
          const { container } = render(
            <ProfileCard profile={profile} idToken={idToken} />
          );
          
          // Verify all fields are rendered
          expect(container.textContent).toContain(profile.id);
          expect(container.textContent).toContain(profile.email);
          expect(container.textContent).toContain(
            profile.displayName || 'Not set'
          );
          expect(container.textContent).toContain(profile.createdAt);
          expect(container.textContent).toContain(idToken);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```
