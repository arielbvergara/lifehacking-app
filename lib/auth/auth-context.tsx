'use client';

/**
 * Authentication Context Provider
 * 
 * Provides centralized authentication state management for the application.
 * Listens to Firebase auth state changes and provides auth methods to all components.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInWithGoogle as firebaseSignInWithGoogle, signInWithEmail as firebaseSignInWithEmail, signOut as firebaseSignOut, getIdToken as firebaseGetIdToken, signUpWithGoogle as firebaseSignUpWithGoogle, signUpWithEmail as firebaseSignUpWithEmail, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from '@/lib/auth/firebase-auth';
import { formatAuthError } from '@/lib/auth/auth-utils';
import { handleUserSync, createUserInBackend } from '@/lib/api/user';

/**
 * Authentication context state interface
 */
interface AuthContextState {
  /** Current Firebase user (null if not authenticated) */
  user: FirebaseUser | null;
  /** Firebase ID token for API authentication (null if not authenticated) */
  idToken: string | null;
  /** Loading state during authentication operations */
  loading: boolean;
  /** Error message from authentication operations (null if no error) */
  error: string | null;
  /** Sign in with Google OAuth */
  signInWithGoogle: () => Promise<void>;
  /** Sign in with email and password */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
  /** Sign up with Google OAuth */
  signUpWithGoogle: () => Promise<void>;
  /** Sign up with email and password */
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  /** Send password reset email */
  resetPassword: (email: string) => Promise<void>;
}

/**
 * Create authentication context with undefined default
 * This ensures useAuth() throws an error if used outside AuthProvider
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state and methods.
 * Listens to Firebase auth state changes and manages loading/error states.
 * 
 * @example
 * // In app/layout.tsx
 * <AuthProvider>
 *   <YourApp />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  /**
   * Listen to Firebase auth state changes
   * Automatically updates user and idToken when auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthProvider] Auth state changed');
      console.log('[AuthProvider] User:', firebaseUser ? firebaseUser.uid : 'null');
      console.log('[AuthProvider] isSigningUp:', isSigningUp);
      
      try {
        if (firebaseUser) {
          // User is signed in, get ID token
          console.log('[AuthProvider] Getting ID token...');
          const token = await firebaseGetIdToken(firebaseUser);
          console.log('[AuthProvider] Token obtained (first 20 chars):', token.substring(0, 20) + '...');
          
          // Store token in cookie for middleware access
          document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Lax`;
          
          setUser(firebaseUser);
          setIdToken(token);
          
          // Skip backend sync if we're in the middle of a signup flow
          // The signup function will handle backend user creation
          if (isSigningUp) {
            console.log('[AuthProvider] Skipping sync - signup in progress');
            return;
          }
          
          // Sync user with backend (create if doesn't exist)
          try {
            console.log('[AuthProvider] Syncing user with backend...');
            await handleUserSync(token);
            console.log('[AuthProvider] User sync completed');
          } catch (syncError) {
            console.error('[AuthProvider] Failed to sync user with backend:', syncError);
            // Don't set error state here - user is still authenticated with Firebase
            // Backend sync can be retried later
          }
        } else {
          // User is signed out
          console.log('[AuthProvider] User signed out');
          
          // Clear session cookie
          document.cookie = 'session=; path=/; max-age=0';
          
          setUser(null);
          setIdToken(null);
        }
      } catch (err) {
        console.error('[AuthProvider] Error in auth state change:', err);
        setError(formatAuthError(err));
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isSigningUp]);

  /**
   * Sign in with Google OAuth
   * Opens popup for Google authentication
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await firebaseSignInWithGoogle();
      const token = await firebaseGetIdToken(firebaseUser);
      
      // Sync user with backend
      await handleUserSync(token);
      
      // State will be updated by onAuthStateChanged listener
    } catch (err) {
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle (e.g., for redirect logic)
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   */
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await firebaseSignInWithEmail(email, password);
      const token = await firebaseGetIdToken(firebaseUser);
      
      // Sync user with backend
      await handleUserSync(token);
      
      // State will be updated by onAuthStateChanged listener
    } catch (err) {
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle (e.g., for redirect logic)
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await firebaseSignOut();
      
      // State will be updated by onAuthStateChanged listener
    } catch (err) {
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with Google OAuth
   * Opens popup for Google authentication and creates backend user
   */
  const signUpWithGoogle = useCallback(async () => {
    console.log('[signUpWithGoogle] Starting signup process');
    
    try {
      setLoading(true);
      setError(null);
      setIsSigningUp(true);
      
      console.log('[signUpWithGoogle] Opening Google popup...');
      const firebaseUser = await firebaseSignUpWithGoogle();
      console.log('[signUpWithGoogle] Firebase user created:', firebaseUser.uid);
      
      console.log('[signUpWithGoogle] Getting ID token...');
      const token = await firebaseGetIdToken(firebaseUser);
      console.log('[signUpWithGoogle] Token obtained (first 20 chars):', token.substring(0, 20) + '...');
      
      // Create user in backend with Google account data
      // Note: externalAuthId is extracted from the token by the backend
      console.log('[signUpWithGoogle] Creating user in backend...');
      await createUserInBackend(token, {
        email: firebaseUser.email!,
        name: firebaseUser.displayName || undefined,
      });
      console.log('[signUpWithGoogle] Backend user created successfully');
      
      // State will be updated by onAuthStateChanged listener
    } catch (err) {
      console.error('[signUpWithGoogle] Error during signup:', err);
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle (e.g., for redirect logic)
    } finally {
      setIsSigningUp(false);
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with email and password
   * Creates new Firebase account and backend user profile
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param name - Optional display name
   */
  const signUpWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    console.log('[signUpWithEmail] Starting signup process');
    console.log('[signUpWithEmail] Email:', email);
    console.log('[signUpWithEmail] Name:', name);
    
    try {
      setLoading(true);
      setError(null);
      setIsSigningUp(true);
      
      console.log('[signUpWithEmail] Creating Firebase user...');
      const firebaseUser = await firebaseSignUpWithEmail(email, password);
      console.log('[signUpWithEmail] Firebase user created:', firebaseUser.uid);
      
      console.log('[signUpWithEmail] Getting ID token...');
      const token = await firebaseGetIdToken(firebaseUser);
      console.log('[signUpWithEmail] Token obtained (first 20 chars):', token.substring(0, 20) + '...');
      
      // Create user in backend with form data
      // Note: externalAuthId is extracted from the token by the backend
      console.log('[signUpWithEmail] Creating user in backend...');
      await createUserInBackend(token, {
        email,
        name,
      });
      console.log('[signUpWithEmail] Backend user created successfully');
      
      // State will be updated by onAuthStateChanged listener
    } catch (err) {
      console.error('[signUpWithEmail] Error during signup:', err);
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle (e.g., for redirect logic)
    } finally {
      setIsSigningUp(false);
      setLoading(false);
    }
  }, []);

  /**
   * Send password reset email
   * 
   * Sends a password reset email to the specified email address.
   * For security, always shows success message regardless of whether email exists.
   * 
   * @param email - User's email address
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await firebaseSendPasswordResetEmail(email);
      
      // Success - email sent (or email doesn't exist, but we don't reveal that)
    } catch (err) {
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextState = {
    user,
    idToken,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    signUpWithGoogle,
    signUpWithEmail,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * 
 * Must be used within an AuthProvider component.
 * Throws an error if used outside of AuthProvider.
 * 
 * @returns Authentication context state and methods
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * function MyComponent() {
 *   const { user, signInWithGoogle, loading } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <button onClick={signInWithGoogle}>Sign In</button>;
 *   return <div>Welcome, {user.email}</div>;
 * }
 */
export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
