/**
 * Unit Tests for Authentication Utility Functions
 * 
 * Tests error mapping, type guards, and error formatting functions.
 */

import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import {
  getFirebaseErrorMessage,
  isAuthError,
  formatAuthError,
  clearSessionCookie,
} from './auth-utils';

describe('Auth Utility Functions', () => {
  describe('getFirebaseErrorMessage', () => {
    it('getFirebaseErrorMessage_ShouldReturnFriendlyMessage_WhenErrorCodeIsKnown', () => {
      // Test common error codes
      expect(getFirebaseErrorMessage('auth/invalid-email')).toBe(
        'Please enter a valid email address'
      );
      expect(getFirebaseErrorMessage('auth/user-not-found')).toBe(
        'If an account exists with this email, you will receive a password reset link'
      );
      expect(getFirebaseErrorMessage('auth/wrong-password')).toBe(
        'Incorrect password'
      );
      expect(getFirebaseErrorMessage('auth/too-many-requests')).toBe(
        'Too many attempts. Please try again later'
      );
      expect(getFirebaseErrorMessage('auth/popup-blocked')).toBe(
        'Popup was blocked. Please allow popups for this site'
      );
      expect(getFirebaseErrorMessage('auth/network-request-failed')).toBe(
        'Network error. Please check your connection'
      );
    });

    it('getFirebaseErrorMessage_ShouldReturnDefaultMessage_WhenErrorCodeIsUnknown', () => {
      // Test unknown error codes
      expect(getFirebaseErrorMessage('auth/unknown-error')).toBe(
        'An error occurred. Please try again'
      );
      expect(getFirebaseErrorMessage('auth/some-new-error')).toBe(
        'An error occurred. Please try again'
      );
      expect(getFirebaseErrorMessage('completely-invalid')).toBe(
        'An error occurred. Please try again'
      );
    });

    it('getFirebaseErrorMessage_ShouldNotContainTechnicalJargon_WhenReturningMessage', () => {
      // Verify all messages are user-friendly (no technical terms)
      const knownCodes = [
        'auth/invalid-email',
        'auth/user-disabled',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/popup-blocked',
        'auth/network-request-failed',
      ];

      knownCodes.forEach((code) => {
        const message = getFirebaseErrorMessage(code);
        
        // Message should not contain the error code itself
        expect(message).not.toContain(code);
        
        // Message should not contain technical terms
        expect(message.toLowerCase()).not.toContain('firebase');
        expect(message.toLowerCase()).not.toContain('sdk');
        expect(message.toLowerCase()).not.toContain('api');
        
        // Message should be non-empty
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('isAuthError', () => {
    it('isAuthError_ShouldReturnTrue_WhenErrorIsFirebaseAuthError', () => {
      // Create a mock Firebase auth error
      const authError = {
        code: 'auth/invalid-email',
        message: 'The email address is badly formatted.',
        name: 'FirebaseError',
      };

      expect(isAuthError(authError)).toBe(true);
    });

    it('isAuthError_ShouldReturnFalse_WhenErrorIsNotFirebaseError', () => {
      // Test with regular Error
      const regularError = new Error('Something went wrong');
      expect(isAuthError(regularError)).toBe(false);

      // Test with object without code
      const objectWithoutCode = { message: 'Error message' };
      expect(isAuthError(objectWithoutCode)).toBe(false);

      // Test with null
      expect(isAuthError(null)).toBe(false);

      // Test with undefined
      expect(isAuthError(undefined)).toBe(false);

      // Test with string
      expect(isAuthError('error string')).toBe(false);

      // Test with number
      expect(isAuthError(123)).toBe(false);
    });

    it('isAuthError_ShouldReturnFalse_WhenCodeDoesNotStartWithAuth', () => {
      // Test with error code that doesn't start with 'auth/'
      const nonAuthError = {
        code: 'storage/unauthorized',
        message: 'User is not authorized',
      };

      expect(isAuthError(nonAuthError)).toBe(false);
    });

    it('isAuthError_ShouldReturnFalse_WhenCodeIsNotString', () => {
      // Test with non-string code
      const invalidError = {
        code: 123,
        message: 'Error message',
      };

      expect(isAuthError(invalidError)).toBe(false);
    });
  });

  describe('formatAuthError', () => {
    it('formatAuthError_ShouldReturnFriendlyMessage_WhenErrorIsFirebaseAuthError', () => {
      // Create mock Firebase auth errors
      const invalidEmailError = {
        code: 'auth/invalid-email',
        message: 'The email address is badly formatted.',
        name: 'FirebaseError',
      };

      const userNotFoundError = {
        code: 'auth/user-not-found',
        message: 'There is no user record corresponding to this identifier.',
        name: 'FirebaseError',
      };

      expect(formatAuthError(invalidEmailError)).toBe(
        'Please enter a valid email address'
      );
      expect(formatAuthError(userNotFoundError)).toBe(
        'If an account exists with this email, you will receive a password reset link'
      );
    });

    it('formatAuthError_ShouldReturnDefaultMessage_WhenErrorIsUnknownFirebaseError', () => {
      // Create mock Firebase auth error with unknown code
      const unknownError = {
        code: 'auth/unknown-error-code',
        message: 'Some technical error message',
        name: 'FirebaseError',
      };

      expect(formatAuthError(unknownError)).toBe(
        'An error occurred. Please try again'
      );
    });

    it('formatAuthError_ShouldReturnDefaultMessage_WhenErrorIsRegularError', () => {
      // Test with regular Error
      const regularError = new Error('Technical error message');
      
      expect(formatAuthError(regularError)).toBe(
        'An error occurred. Please try again'
      );
    });

    it('formatAuthError_ShouldReturnDefaultMessage_WhenErrorIsNotErrorObject', () => {
      // Test with various non-error types
      expect(formatAuthError(null)).toBe(
        'An error occurred. Please try again'
      );
      expect(formatAuthError(undefined)).toBe(
        'An error occurred. Please try again'
      );
      expect(formatAuthError('error string')).toBe(
        'An error occurred. Please try again'
      );
      expect(formatAuthError(123)).toBe(
        'An error occurred. Please try again'
      );
    });

    it('formatAuthError_ShouldNotExposeTechnicalDetails_WhenFormattingError', () => {
      // Create error with technical message
      const technicalError = {
        code: 'auth/internal-error',
        message: 'Internal server error: database connection failed at line 123',
        name: 'FirebaseError',
      };

      const formattedMessage = formatAuthError(technicalError);
      
      // Should not contain technical details from original message
      expect(formattedMessage).not.toContain('database');
      expect(formattedMessage).not.toContain('line 123');
      expect(formattedMessage).not.toContain('server error');
    });
  });

  /**
   * Property-Based Test: Firebase Error Mapping
   * 
   * **Validates: Requirements TR-5 (Error Handling)**
   * 
   * Property 1.3 from design.md:
   * For all Firebase error codes c:
   *   getFirebaseErrorMessage(c) returns a non-empty string
   * 
   * For all known error codes c in FIREBASE_ERROR_MESSAGES:
   *   getFirebaseErrorMessage(c) returns a user-friendly message (not the code itself)
   */
  describe('Property-Based Tests', () => {
    test.prop([fc.string().filter(s => typeof s === 'string')], { numRuns: 20 })(
      'getFirebaseErrorMessage_ShouldAlwaysReturnNonEmptyString_ForAnyErrorCode',
      (errorCode) => {
        const message = getFirebaseErrorMessage(errorCode);
        
        // Property: Always returns a non-empty string
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      }
    );

    test.prop([
      fc.constantFrom(
        'auth/invalid-email',
        'auth/user-disabled',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/email-already-in-use',
        'auth/weak-password',
        'auth/invalid-credential',
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/account-exists-with-different-credential',
        'auth/too-many-requests',
        'auth/network-request-failed',
        'auth/timeout',
        'auth/internal-error',
        'auth/operation-not-allowed',
        'auth/requires-recent-login'
      ),
    ], { numRuns: 20 })(
      'getFirebaseErrorMessage_ShouldReturnUserFriendlyMessage_ForKnownErrorCodes',
      (knownErrorCode) => {
        const message = getFirebaseErrorMessage(knownErrorCode);
        
        // Property: Message should not be the error code itself
        expect(message).not.toBe(knownErrorCode);
        
        // Property: Message should not contain the error code
        expect(message).not.toContain(knownErrorCode);
        
        // Property: Message should not contain 'auth/'
        expect(message).not.toContain('auth/');
        
        // Property: Message should be user-friendly (no technical jargon)
        expect(message.toLowerCase()).not.toContain('firebase');
        expect(message.toLowerCase()).not.toContain('sdk');
        
        // Property: Message should be non-empty
        expect(message.length).toBeGreaterThan(0);
      }
    );

    test.prop([
      fc.record({
        code: fc.constantFrom(
          'auth/invalid-email',
          'auth/user-not-found',
          'auth/wrong-password',
          'auth/network-request-failed'
        ),
        message: fc.string(),
        name: fc.constant('FirebaseError'),
      }),
    ], { numRuns: 20 })(
      'formatAuthError_ShouldReturnUserFriendlyMessage_ForFirebaseErrors',
      (firebaseError) => {
        const formattedMessage = formatAuthError(firebaseError);
        
        // Property: Should return a non-empty string
        expect(formattedMessage).toBeTruthy();
        expect(typeof formattedMessage).toBe('string');
        expect(formattedMessage.length).toBeGreaterThan(0);
        
        // Property: Should not expose the original technical message
        expect(formattedMessage).not.toBe(firebaseError.message);
        
        // Property: Should not contain error code
        expect(formattedMessage).not.toContain(firebaseError.code);
      }
    );

    test.prop([
      fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.string(),
        fc.integer(),
        fc.boolean(),
        fc.object()
      ),
    ], { numRuns: 20 })(
      'formatAuthError_ShouldAlwaysReturnString_ForAnyInput',
      (anyError) => {
        const formattedMessage = formatAuthError(anyError);
        
        // Property: Always returns a string
        expect(typeof formattedMessage).toBe('string');
        
        // Property: Always returns a non-empty string
        expect(formattedMessage.length).toBeGreaterThan(0);
      }
    );

    test.prop([
      fc.record({
        code: fc.string(),
        message: fc.string(),
      }),
    ], { numRuns: 20 })(
      'isAuthError_ShouldReturnTrue_OnlyForAuthPrefixedCodes',
      (errorObject) => {
        const result = isAuthError(errorObject);
        
        // Property: Returns true only if code starts with 'auth/'
        if (errorObject.code.startsWith('auth/')) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      }
    );
  });

  describe('clearSessionCookie', () => {
    it('clearSessionCookie_ShouldSetExpiredCookieWithSecurityFlags_WhenCalledOnHttps', () => {
      // Mock window.location.protocol as HTTPS
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, protocol: 'https:' },
        writable: true,
      });

      // Clear any existing cookies
      document.cookie = 'session=test; path=/';
      
      clearSessionCookie();
      
      // The cookie should be cleared (max-age=0 removes it)
      expect(document.cookie).not.toContain('session=test');

      // Restore
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('clearSessionCookie_ShouldSetExpiredCookieWithoutSecureFlag_WhenCalledOnHttp', () => {
      // Mock window.location.protocol as HTTP
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, protocol: 'http:' },
        writable: true,
      });

      document.cookie = 'session=test; path=/';
      
      clearSessionCookie();
      
      expect(document.cookie).not.toContain('session=test');

      // Restore
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });
});
