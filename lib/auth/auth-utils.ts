/**
 * Authentication Utility Functions
 * 
 * Provides utility functions for handling Firebase authentication errors
 * and formatting them for user-friendly display.
 */

import { FirebaseError } from 'firebase/app';

/**
 * Map of Firebase error codes to user-friendly messages
 * Covers all common Firebase authentication errors
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Email/Password errors
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'If an account exists with this email, you will receive a password reset link',
  'auth/wrong-password': 'Incorrect password',
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password': 'Password is too weak. Please use a stronger password',
  'auth/invalid-credential': 'Invalid email or password',
  
  // Google OAuth errors
  'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site',
  'auth/popup-closed-by-user': 'Sign-in was cancelled',
  'auth/cancelled-popup-request': 'Sign-in was cancelled',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method',
  
  // Rate limiting
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  
  // Network errors
  'auth/network-request-failed': 'Network error. Please check your connection',
  'auth/timeout': 'Request timed out. Please try again',
  
  // Password reset errors
  'auth/expired-action-code': 'This password reset link has expired. Please request a new one',
  'auth/invalid-action-code': 'This password reset link is invalid. Please request a new one',
  'auth/missing-email': 'Please enter your email address',
  
  // General errors
  'auth/internal-error': 'An unexpected error occurred. Please try again',
  'auth/operation-not-allowed': 'This sign-in method is not enabled',
  'auth/requires-recent-login': 'Please sign in again to continue',
};

/**
 * Get user-friendly error message for Firebase error code
 * 
 * Maps Firebase authentication error codes to user-friendly messages
 * that can be displayed to end users. Returns a default fallback
 * message for unknown error codes.
 * 
 * @param code - Firebase error code (e.g., 'auth/invalid-email')
 * @returns User-friendly error message
 * 
 * @example
 * const message = getFirebaseErrorMessage('auth/invalid-email');
 * // Returns: "Please enter a valid email address"
 * 
 * @example
 * const message = getFirebaseErrorMessage('auth/unknown-error');
 * // Returns: "An error occurred. Please try again"
 */
export function getFirebaseErrorMessage(code: string): string {
  return Object.prototype.hasOwnProperty.call(FIREBASE_ERROR_MESSAGES, code)
    ? FIREBASE_ERROR_MESSAGES[code]
    : 'An error occurred. Please try again';
}

/**
 * Type guard to check if an error is a Firebase authentication error
 * 
 * @param error - Error object to check
 * @returns True if error is a FirebaseError, false otherwise
 * 
 * @example
 * try {
 *   await signInWithEmail(email, password);
 * } catch (error) {
 *   if (isAuthError(error)) {
 *     console.log('Firebase error:', error.code);
 *   }
 * }
 */
export function isAuthError(error: unknown): error is FirebaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    typeof (error as { code: string }).code === "string" &&
    (error as { code: string }).code.startsWith("auth/")
  );
}

/**
 * Format authentication error for display to user
 * 
 * Takes any error object and formats it into a user-friendly message.
 * If the error is a Firebase auth error, returns the mapped message.
 * Otherwise, returns a generic error message.
 * 
 * @param error - Error object to format
 * @returns User-friendly error message
 * 
 * @example
 * try {
 *   await signInWithEmail(email, password);
 * } catch (error) {
 *   const message = formatAuthError(error);
 *   setErrorMessage(message);
 * }
 */
export function formatAuthError(error: unknown): string {
  if (isAuthError(error)) {
    return getFirebaseErrorMessage(error.code);
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose technical error messages to users
    return 'An error occurred. Please try again';
  }
  
  // Fallback for unknown error types
  return 'An error occurred. Please try again';
}
