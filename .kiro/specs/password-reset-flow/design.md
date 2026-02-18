# Password Reset Flow - Design Document

## Architecture Overview

This feature implements a simple password reset flow using Firebase Authentication's built-in password reset functionality. The implementation follows the existing authentication patterns in the application.

## Component Architecture

```
┌─────────────────────────────────────────┐
│   app/forgot-password/page.tsx          │
│   (Page Component)                      │
└──────────────┬──────────────────────────┘
               │
               ├─> AuthNav (existing)
               ├─> ForgotPasswordHeader (new)
               ├─> ForgotPasswordForm (new)
               └─> AuthFooter (existing)
                   │
                   ├─> useAuth() hook
                   │   └─> resetPassword()
                   │       └─> Firebase sendPasswordResetEmail
                   │
                   └─> Error handling utilities
```

## File Structure

```
app/
  forgot-password/
    page.tsx                    # Main page component
    error.tsx                   # Error boundary
    not-found.tsx              # 404 handler

components/
  auth/
    forgot-password-header.tsx  # Page header
    forgot-password-form.tsx    # Form component
    forgot-password-form.test.tsx  # Unit tests

lib/
  auth/
    firebase-auth.ts           # Add sendPasswordResetEmail
    auth-context.tsx           # Add resetPassword method
    auth-utils.ts              # Add reset error messages
```

## Component Specifications

### 1. ForgotPasswordHeader Component

**Purpose:** Display page title and description

**Props:** None

**Design:**
```tsx
interface ForgotPasswordHeaderProps {}

export function ForgotPasswordHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <span className="material-icons-round text-primary text-3xl">lock_reset</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Reset Your Password
      </h1>
      <p className="text-gray-600">
        Enter your email address and we'll send you a link to reset your password
      </p>
    </div>
  );
}
```

### 2. ForgotPasswordForm Component

**Purpose:** Handle email input and password reset request

**Props:**
```tsx
interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}
```

**State:**
- `email: string` - User's email input
- `loading: boolean` - Loading state during API call
- `error: string | null` - Error message
- `success: boolean` - Success state after email sent

**Behavior:**
1. User enters email
2. Client-side validation on submit
3. Call `resetPassword(email)` from auth context
4. Show loading state
5. On success: Show success message
6. On error: Show error message
7. User can navigate back to login

**Validation:**
- Email format validation (HTML5 + custom)
- Required field validation
- Trim whitespace

### 3. Firebase Auth Integration

**New Function in `lib/auth/firebase-auth.ts`:**

```tsx
/**
 * Send password reset email
 * 
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 * @throws FirebaseError if sending fails
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
}
```

**Auth Context Update:**

```tsx
interface AuthContextState {
  // ... existing properties
  resetPassword: (email: string) => Promise<void>;
}

const resetPassword = useCallback(async (email: string) => {
  try {
    setLoading(true);
    setError(null);
    await sendPasswordResetEmail(email);
  } catch (err) {
    const errorMessage = formatAuthError(err);
    setError(errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);
```

### 4. Error Messages

**New error codes in `lib/auth/auth-utils.ts`:**

```tsx
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // ... existing errors
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/user-not-found': 'If an account exists with this email, you will receive a password reset link',
  'auth/too-many-requests': 'Too many password reset attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Please check your connection',
};
```

**Note:** For security, we show the same success message regardless of whether the email exists.

## Page Layout

```
┌─────────────────────────────────────────┐
│  AuthNav                                │
├─────────────────────────────────────────┤
│                                         │
│  [Decorative blur circles]              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Icon]                           │ │
│  │  Reset Your Password              │ │
│  │  Enter your email address...      │ │
│  │                                   │ │
│  │  Email Address                    │ │
│  │  [email input field]              │ │
│  │                                   │ │
│  │  [Send Reset Link button]         │ │
│  │                                   │ │
│  │  [Success/Error message]          │ │
│  │                                   │ │
│  │  Back to Login                    │ │
│  └───────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│  AuthFooter                             │
└─────────────────────────────────────────┘
```

## User Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │ Click "Forgot?"
       ▼
┌─────────────────────┐
│ Forgot Password     │
│ Page                │
└──────┬──────────────┘
       │ Enter email
       │ Click "Send Reset Link"
       ▼
┌─────────────────────┐
│ Loading State       │
└──────┬──────────────┘
       │
       ├─ Success ──────────┐
       │                    ▼
       │            ┌───────────────────┐
       │            │ Success Message   │
       │            │ "Check your email"│
       │            └───────┬───────────┘
       │                    │
       │                    ▼
       │            ┌───────────────────┐
       │            │ User checks email │
       │            │ Clicks reset link │
       │            └───────┬───────────┘
       │                    │
       │                    ▼
       │            ┌───────────────────┐
       │            │ Firebase Hosted   │
       │            │ Password Reset    │
       │            └───────────────────┘
       │
       └─ Error ───────────┐
                           ▼
                   ┌───────────────────┐
                   │ Error Message     │
                   │ User can retry    │
                   └───────────────────┘
```

## Security Considerations

### 1. Email Enumeration Prevention
- Always show success message, even if email doesn't exist
- Don't reveal whether an account exists
- Consistent response time regardless of email existence

### 2. Rate Limiting
- Firebase handles rate limiting automatically
- Show user-friendly message when rate limited
- Typical limit: 5 requests per hour per IP

### 3. Link Expiration
- Reset links expire after 1 hour (Firebase default)
- User must request new link if expired

### 4. HTTPS Enforcement
- All requests over HTTPS
- Secure cookie handling
- No sensitive data in URLs

## Testing Strategy

### Unit Tests

**ForgotPasswordForm Component:**
- ✓ Renders email input field
- ✓ Validates email format
- ✓ Shows loading state during submission
- ✓ Shows success message after email sent
- ✓ Shows error message on failure
- ✓ Disables form during submission
- ✓ Allows navigation back to login

**Firebase Auth Function:**
- ✓ Calls Firebase sendPasswordResetEmail
- ✓ Handles errors appropriately
- ✓ Throws errors for upstream handling

**Auth Context:**
- ✓ resetPassword method exists
- ✓ Updates loading state
- ✓ Handles errors
- ✓ Clears previous errors

### Manual Testing Checklist

- [ ] Navigate to /forgot-password from login
- [ ] Enter valid email and submit
- [ ] Verify success message displays
- [ ] Check email inbox for reset link
- [ ] Click reset link in email
- [ ] Verify Firebase hosted page loads
- [ ] Reset password successfully
- [ ] Login with new password
- [ ] Test with invalid email format
- [ ] Test with non-existent email
- [ ] Test rate limiting (5+ requests)
- [ ] Test on mobile device
- [ ] Test keyboard navigation
- [ ] Test with screen reader

## Accessibility Requirements

### Keyboard Navigation
- Tab through all interactive elements
- Enter key submits form
- Escape key clears errors (optional)

### Screen Reader Support
- Proper labels for all inputs
- ARIA live regions for success/error messages
- Descriptive button text
- Form field descriptions

### Visual Accessibility
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible
- Error messages clearly visible
- Loading states announced

## Copy Specifications

### Page Header
- **Title:** "Reset Your Password"
- **Description:** "Enter your email address and we'll send you a link to reset your password"

### Form Labels
- **Email Field:** "Email Address"
- **Email Placeholder:** "hello@example.com"
- **Submit Button:** "Send Reset Link"
- **Submit Button (Loading):** "Sending..."

### Messages
- **Success:** "Check your email! We've sent you a password reset link. If you don't see it, check your spam folder."
- **Invalid Email:** "Please enter a valid email address"
- **Rate Limited:** "Too many password reset attempts. Please try again later"
- **Network Error:** "Network error. Please check your connection and try again"
- **Generic Error:** "An error occurred. Please try again"

### Navigation
- **Back Link:** "Back to Login"

## Performance Considerations

- Lazy load page (code splitting)
- Debounce email validation (300ms)
- Optimize decorative elements
- Minimize bundle size
- Fast initial render

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Future Enhancements

1. Custom password reset page (action handler)
2. Password strength indicator
3. Custom email templates
4. SMS-based recovery
5. Account recovery options
6. Multi-factor authentication
7. Security questions
8. Biometric authentication

## References

- Firebase Auth Documentation
- Existing login/signup pages
- OWASP Authentication Guidelines
- WCAG 2.1 AA Standards
