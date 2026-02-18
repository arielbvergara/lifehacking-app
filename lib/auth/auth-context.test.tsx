/**
 * Authentication Context Tests
 * 
 * Tests for the AuthProvider and useAuth hook.
 * Includes unit tests, integration tests, and one simple property test.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseAuthFunctions from './firebase-auth';
import * as userApi from '@/lib/api/user';
import { fc, test } from '@fast-check/vitest';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  User: vi.fn(),
}));

// Mock Firebase auth functions
vi.mock('./firebase-auth', () => ({
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signOut: vi.fn(),
  getIdToken: vi.fn(),
}));

// Mock user API
vi.mock('@/lib/api/user', () => ({
  handleUserSync: vi.fn(),
}));

// Mock Firebase instance
vi.mock('@/lib/firebase', () => ({
  auth: {},
}));

describe('AuthProvider', () => {
  let unsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubscribe = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });

    it('should provide auth context when used inside AuthProvider', () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.idToken).toBeNull();
      expect(result.current.signInWithGoogle).toBeInstanceOf(Function);
      expect(result.current.signInWithEmail).toBeInstanceOf(Function);
      expect(result.current.signOut).toBeInstanceOf(Function);
    });
  });

  describe('Initial state', () => {
    it('should start with loading=true and user=null', () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(() => {
        // Don't call callback immediately to keep loading state
        return unsubscribe;
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.idToken).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should set loading=false when auth state is determined', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Auth state changes', () => {
    it('should update user and idToken when user signs in', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as unknown;

      const mockToken = 'mock-id-token';

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(mockUser);
        return unsubscribe;
      });

      vi.mocked(firebaseAuthFunctions.getIdToken).mockResolvedValue(mockToken);
      vi.mocked(userApi.handleUserSync).mockResolvedValue({
        id: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.idToken).toBe(mockToken);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear user and idToken when user signs out', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.idToken).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });

    it('should sync user with backend after sign in', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      } as unknown;

      const mockToken = 'mock-id-token';

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(mockUser);
        return unsubscribe;
      });

      vi.mocked(firebaseAuthFunctions.getIdToken).mockResolvedValue(mockToken);
      vi.mocked(userApi.handleUserSync).mockResolvedValue({
        id: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        createdAt: new Date().toISOString(),
      });

      renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(userApi.handleUserSync).toHaveBeenCalledWith(mockToken);
      });
    });

    it('should not set error if backend sync fails', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      } as unknown;

      const mockToken = 'mock-id-token';

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(mockUser);
        return unsubscribe;
      });

      vi.mocked(firebaseAuthFunctions.getIdToken).mockResolvedValue(mockToken);
      vi.mocked(userApi.handleUserSync).mockRejectedValue(new Error('Backend error'));

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.error).toBeNull(); // Error should not be set
        expect(result.current.loading).toBe(false);
      });

      consoleError.mockRestore();
    });
  });

  describe('signInWithGoogle', () => {
    it('should call Firebase signInWithGoogle and sync user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      } as unknown;

      const mockToken = 'mock-id-token';

      let authCallback: ((user: unknown) => void) | null = null;
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        authCallback = callback;
        callback(null); // Initial state
        return unsubscribe;
      });

      vi.mocked(firebaseAuthFunctions.signInWithGoogle).mockImplementation(async () => {
        // Simulate auth state change after sign in
        if (authCallback) {
          authCallback(mockUser);
        }
        return mockUser;
      });
      vi.mocked(firebaseAuthFunctions.getIdToken).mockResolvedValue(mockToken);
      vi.mocked(userApi.handleUserSync).mockResolvedValue({
        id: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        createdAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(firebaseAuthFunctions.signInWithGoogle).toHaveBeenCalled();
      
      // Wait for auth state change to trigger sync
      await waitFor(() => {
        expect(userApi.handleUserSync).toHaveBeenCalledWith(mockToken);
      });
    });

    it('should set error state if Google sign in fails', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const mockError = { code: 'auth/popup-blocked', message: 'Popup blocked' };
      vi.mocked(firebaseAuthFunctions.signInWithGoogle).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signInWithGoogle();
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Popup was blocked. Please allow popups for this site');
      });
    });
  });

  describe('signInWithEmail', () => {
    it('should call Firebase signInWithEmail and sync user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      } as unknown;

      const mockToken = 'mock-id-token';

      let authCallback: ((user: unknown) => void) | null = null;
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        authCallback = callback;
        callback(null); // Initial state
        return unsubscribe;
      });

      vi.mocked(firebaseAuthFunctions.signInWithEmail).mockImplementation(async () => {
        // Simulate auth state change after sign in
        if (authCallback) {
          authCallback(mockUser);
        }
        return mockUser;
      });
      vi.mocked(firebaseAuthFunctions.getIdToken).mockResolvedValue(mockToken);
      vi.mocked(userApi.handleUserSync).mockResolvedValue({
        id: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        createdAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithEmail('test@example.com', 'password123');
      });

      expect(firebaseAuthFunctions.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
      
      // Wait for auth state change to trigger sync
      await waitFor(() => {
        expect(userApi.handleUserSync).toHaveBeenCalledWith(mockToken);
      });
    });

    it('should set error state if email sign in fails', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const mockError = { code: 'auth/wrong-password', message: 'Wrong password' };
      vi.mocked(firebaseAuthFunctions.signInWithEmail).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signInWithEmail('test@example.com', 'wrongpassword');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Incorrect password');
      });
    });
  });

  describe('signOut', () => {
    it('should call Firebase signOut', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      vi.mocked(firebaseAuthFunctions.signOut).mockResolvedValue();

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(firebaseAuthFunctions.signOut).toHaveBeenCalled();
    });

    it('should set error state if sign out fails', async () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const mockError = new Error('Sign out failed');
      vi.mocked(firebaseAuthFunctions.signOut).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signOut();
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('An error occurred. Please try again');
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});

/**
 * Property-Based Tests
 * 
 * Simple property test for loading state consistency as requested.
 * Comprehensive property tests will be implemented in task 6.1.
 */
describe('AuthProvider - Property Tests', () => {
  test.prop([fc.boolean()], { numRuns: 20 })('Property 2.1: Loading state consistency - loading never remains true indefinitely', async (shouldSucceed) => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    } as unknown;

    const mockToken = 'mock-id-token';

    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });

    if (shouldSucceed) {
      vi.mocked(firebaseAuthFunctions.signInWithGoogle).mockResolvedValue(mockUser);
      vi.mocked(firebaseAuthFunctions.getIdToken).mockResolvedValue(mockToken);
      vi.mocked(userApi.handleUserSync).mockResolvedValue({
        id: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        createdAt: new Date().toISOString(),
      });
    } else {
      vi.mocked(firebaseAuthFunctions.signInWithGoogle).mockRejectedValue(
        { code: 'auth/popup-blocked', message: 'Popup blocked' }
      );
    }

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Start auth operation
    const initialLoading = result.current.loading;
    expect(initialLoading).toBe(false);

    // Trigger sign in
    await act(async () => {
      try {
        await result.current.signInWithGoogle();
      } catch {
        // May throw on failure, which is expected
      }
    });

    // After operation completes (success or error), loading should be false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 1000 });

    // Verify loading state is consistent
    expect(result.current.loading).toBe(false);
  });
});
