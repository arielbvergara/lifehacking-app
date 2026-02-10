/**
 * Unit Tests for Firebase Authentication Functions
 * 
 * Tests all authentication wrapper functions with mocked Firebase SDK.
 * Covers both success and error scenarios.
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import {
  signInWithGoogle,
  signInWithEmail,
  signOut,
  getIdToken,
  signUpWithGoogle,
  signUpWithEmail,
} from './firebase-auth';
import * as firebaseAuth from 'firebase/auth';

// Mock the Firebase auth module
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    signInWithPopup: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn(),
  };
});

// Mock the firebase config module
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('Firebase Auth Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('signInWithGoogle_ShouldReturnUser_WhenAuthenticationSucceeds', async () => {
      // Arrange
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
      };

      const mockUserCredential = {
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn',
      };

      (firebaseAuth.signInWithPopup as Mock).mockResolvedValue(mockUserCredential);

      // Act
      const result = await signInWithGoogle();

      // Assert
      expect(result).toEqual(mockUser);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
      expect(firebaseAuth.GoogleAuthProvider).toHaveBeenCalledTimes(1);
    });

    it('signInWithGoogle_ShouldThrowError_WhenPopupIsBlocked', async () => {
      // Arrange
      const mockError = {
        code: 'auth/popup-blocked',
        message: 'The popup has been blocked by the browser.',
      };

      (firebaseAuth.signInWithPopup as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
    });

    it('signInWithGoogle_ShouldThrowError_WhenPopupIsClosedByUser', async () => {
      // Arrange
      const mockError = {
        code: 'auth/popup-closed-by-user',
        message: 'The popup has been closed by the user before finalizing the operation.',
      };

      (firebaseAuth.signInWithPopup as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
    });

    it('signInWithGoogle_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'A network error has occurred.',
      };

      (firebaseAuth.signInWithPopup as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
    });
  });

  describe('signInWithEmail', () => {
    it('signInWithEmail_ShouldReturnUser_WhenCredentialsAreValid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'validPassword123';
      const mockUser = {
        uid: 'test-uid-456',
        email: email,
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
      };

      const mockUserCredential = {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn',
      };

      (firebaseAuth.signInWithEmailAndPassword as Mock).mockResolvedValue(mockUserCredential);

      // Act
      const result = await signInWithEmail(email, password);

      // Assert
      expect(result).toEqual(mockUser);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        email,
        password
      );
    });

    it('signInWithEmail_ShouldThrowError_WhenEmailIsInvalid', async () => {
      // Arrange
      const email = 'invalid-email';
      const password = 'password123';
      const mockError = {
        code: 'auth/invalid-email',
        message: 'The email address is badly formatted.',
      };

      (firebaseAuth.signInWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signInWithEmail_ShouldThrowError_WhenUserNotFound', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';
      const mockError = {
        code: 'auth/user-not-found',
        message: 'There is no user record corresponding to this identifier.',
      };

      (firebaseAuth.signInWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signInWithEmail_ShouldThrowError_WhenPasswordIsWrong', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const mockError = {
        code: 'auth/wrong-password',
        message: 'The password is invalid or the user does not have a password.',
      };

      (firebaseAuth.signInWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signInWithEmail_ShouldThrowError_WhenTooManyAttempts', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = {
        code: 'auth/too-many-requests',
        message: 'Access to this account has been temporarily disabled due to many failed login attempts.',
      };

      (firebaseAuth.signInWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signInWithEmail_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'A network error has occurred.',
      };

      (firebaseAuth.signInWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signInWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('signOut', () => {
    it('signOut_ShouldComplete_WhenSignOutSucceeds', async () => {
      // Arrange
      (firebaseAuth.signOut as Mock).mockResolvedValue(undefined);

      // Act
      await signOut();

      // Assert
      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
      expect(firebaseAuth.signOut).toHaveBeenCalledWith(expect.anything()); // auth instance
    });

    it('signOut_ShouldThrowError_WhenSignOutFails', async () => {
      // Arrange
      const mockError = {
        code: 'auth/internal-error',
        message: 'An internal error has occurred.',
      };

      (firebaseAuth.signOut as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signOut()).rejects.toEqual(mockError);
      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
    });

    it('signOut_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'A network error has occurred.',
      };

      (firebaseAuth.signOut as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signOut()).rejects.toEqual(mockError);
      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('getIdToken', () => {
    it('getIdToken_ShouldReturnToken_WhenUserIsAuthenticated', async () => {
      // Arrange
      const mockToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const mockUser = {
        uid: 'test-uid-789',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        getIdToken: vi.fn().mockResolvedValue(mockToken),
      } as any;

      // Act
      const result = await getIdToken(mockUser);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
    });

    it('getIdToken_ShouldReturnRefreshedToken_WhenTokenIsExpired', async () => {
      // Arrange
      const mockRefreshedToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.refreshed.token';
      const mockUser = {
        uid: 'test-uid-789',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        getIdToken: vi.fn().mockResolvedValue(mockRefreshedToken),
      } as any;

      // Act
      const result = await getIdToken(mockUser);

      // Assert
      expect(result).toBe(mockRefreshedToken);
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
    });

    it('getIdToken_ShouldThrowError_WhenTokenRetrievalFails', async () => {
      // Arrange
      const mockError = {
        code: 'auth/internal-error',
        message: 'An internal error has occurred.',
      };

      const mockUser = {
        uid: 'test-uid-789',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        getIdToken: vi.fn().mockRejectedValue(mockError),
      } as any;

      // Act & Assert
      await expect(getIdToken(mockUser)).rejects.toEqual(mockError);
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
    });

    it('getIdToken_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'A network error has occurred.',
      };

      const mockUser = {
        uid: 'test-uid-789',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        getIdToken: vi.fn().mockRejectedValue(mockError),
      } as any;

      // Act & Assert
      await expect(getIdToken(mockUser)).rejects.toEqual(mockError);
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('signUpWithGoogle', () => {
    it('signUpWithGoogle_ShouldReturnUser_WhenSignupSucceeds', async () => {
      // Arrange
      const mockUser = {
        uid: 'new-user-uid-123',
        email: 'newuser@example.com',
        displayName: 'New User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
      };

      const mockUserCredential = {
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn',
      };

      (firebaseAuth.signInWithPopup as Mock).mockResolvedValue(mockUserCredential);

      // Act
      const result = await signUpWithGoogle();

      // Assert
      expect(result).toEqual(mockUser);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
      expect(firebaseAuth.GoogleAuthProvider).toHaveBeenCalledTimes(1);
    });

    it('signUpWithGoogle_ShouldIncludeDisplayName_WhenGoogleAccountHasName', async () => {
      // Arrange
      const mockUser = {
        uid: 'new-user-uid-456',
        email: 'user@gmail.com',
        displayName: 'John Doe',
        photoURL: 'https://example.com/john.jpg',
        emailVerified: true,
      };

      const mockUserCredential = {
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn',
      };

      (firebaseAuth.signInWithPopup as Mock).mockResolvedValue(mockUserCredential);

      // Act
      const result = await signUpWithGoogle();

      // Assert
      expect(result.displayName).toBe('John Doe');
      expect(result.email).toBe('user@gmail.com');
    });

    it('signUpWithGoogle_ShouldThrowError_WhenPopupIsBlocked', async () => {
      // Arrange
      const mockError = {
        code: 'auth/popup-blocked',
        message: 'The popup has been blocked by the browser.',
      };

      (firebaseAuth.signInWithPopup as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithGoogle()).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
    });

    it('signUpWithGoogle_ShouldThrowError_WhenPopupIsClosedByUser', async () => {
      // Arrange
      const mockError = {
        code: 'auth/popup-closed-by-user',
        message: 'The popup has been closed by the user before finalizing the operation.',
      };

      (firebaseAuth.signInWithPopup as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithGoogle()).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
    });

    it('signUpWithGoogle_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'A network error has occurred.',
      };

      (firebaseAuth.signInWithPopup as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithGoogle()).rejects.toEqual(mockError);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
    });
  });

  describe('signUpWithEmail', () => {
    it('signUpWithEmail_ShouldReturnUser_WhenSignupSucceeds', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const password = 'securePassword123';
      const mockUser = {
        uid: 'new-user-uid-789',
        email: email,
        displayName: null,
        photoURL: null,
        emailVerified: false,
      };

      const mockUserCredential = {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn',
      };

      (firebaseAuth.createUserWithEmailAndPassword as Mock).mockResolvedValue(mockUserCredential);

      // Act
      const result = await signUpWithEmail(email, password);

      // Assert
      expect(result).toEqual(mockUser);
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        email,
        password
      );
    });

    it('signUpWithEmail_ShouldThrowError_WhenEmailAlreadyInUse', async () => {
      // Arrange
      const email = 'existing@example.com';
      const password = 'password123';
      const mockError = {
        code: 'auth/email-already-in-use',
        message: 'The email address is already in use by another account.',
      };

      (firebaseAuth.createUserWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signUpWithEmail_ShouldThrowError_WhenEmailIsInvalid', async () => {
      // Arrange
      const email = 'invalid-email';
      const password = 'password123';
      const mockError = {
        code: 'auth/invalid-email',
        message: 'The email address is badly formatted.',
      };

      (firebaseAuth.createUserWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signUpWithEmail_ShouldThrowError_WhenPasswordIsWeak', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = '123'; // Too weak
      const mockError = {
        code: 'auth/weak-password',
        message: 'Password should be at least 6 characters.',
      };

      (firebaseAuth.createUserWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signUpWithEmail_ShouldThrowError_WhenOperationNotAllowed', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = {
        code: 'auth/operation-not-allowed',
        message: 'Email/password accounts are not enabled.',
      };

      (firebaseAuth.createUserWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('signUpWithEmail_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'A network error has occurred.',
      };

      (firebaseAuth.createUserWithEmailAndPassword as Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(signUpWithEmail(email, password)).rejects.toEqual(mockError);
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });
  });
});
