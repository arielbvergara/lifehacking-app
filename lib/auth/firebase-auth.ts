/**
 * Firebase Authentication Functions
 * 
 * This module provides wrapper functions around Firebase Auth SDK
 * for use throughout the application. All functions reuse the existing
 * auth instance from lib/firebase.ts.
 */

import { auth } from '@/lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User,
  UserCredential,
} from 'firebase/auth';

/**
 * Sign in with Google OAuth using popup authentication
 * 
 * @returns Promise resolving to the authenticated Firebase User
 * @throws FirebaseError if authentication fails
 * 
 * @example
 * try {
 *   const user = await signInWithGoogle();
 *   console.log('Signed in:', user.email);
 * } catch (error) {
 *   console.error('Google sign-in failed:', error);
 * }
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result: UserCredential = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    // Re-throw with context for better error handling upstream
    throw error;
  }
}

/**
 * Sign in with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated Firebase User
 * @throws FirebaseError if authentication fails
 * 
 * @example
 * try {
 *   const user = await signInWithEmail('user@example.com', 'password123');
 *   console.log('Signed in:', user.email);
 * } catch (error) {
 *   console.error('Email sign-in failed:', error);
 * }
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const result: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return result.user;
  } catch (error) {
    // Re-throw with context for better error handling upstream
    throw error;
  }
}

/**
 * Sign out the current user
 * 
 * @returns Promise that resolves when sign out is complete
 * @throws FirebaseError if sign out fails
 * 
 * @example
 * try {
 *   await signOut();
 *   console.log('Signed out successfully');
 * } catch (error) {
 *   console.error('Sign out failed:', error);
 * }
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    // Re-throw with context for better error handling upstream
    throw error;
  }
}

/**
 * Get Firebase ID token for the current user
 * 
 * This token can be used to authenticate API requests to the backend.
 * The token is automatically refreshed by Firebase if it's expired.
 * 
 * @param user - Firebase User object
 * @returns Promise resolving to the ID token string
 * @throws FirebaseError if token retrieval fails
 * 
 * @example
 * try {
 *   const token = await getIdToken(user);
 *   // Use token in API requests
 *   fetch('/api/user', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 * } catch (error) {
 *   console.error('Failed to get ID token:', error);
 * }
 */
export async function getIdToken(user: User): Promise<string> {
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    // Re-throw with context for better error handling upstream
    throw error;
  }
}

/**
 * Sign up with Google OAuth using popup authentication
 * 
 * Creates a new user account or signs in if account already exists.
 * Uses the same Google OAuth flow as signInWithGoogle.
 * 
 * @returns Promise resolving to the authenticated Firebase User
 * @throws FirebaseError if authentication fails
 * 
 * @example
 * try {
 *   const user = await signUpWithGoogle();
 *   console.log('Signed up:', user.email);
 *   console.log('Display name:', user.displayName);
 * } catch (error) {
 *   console.error('Google sign-up failed:', error);
 * }
 */
export async function signUpWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result: UserCredential = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    // Re-throw with context for better error handling upstream
    throw error;
  }
}

/**
 * Sign up with email and password
 * 
 * Creates a new user account with the provided email and password.
 * 
 * @param email - User's email address
 * @param password - User's password (must meet Firebase requirements)
 * @returns Promise resolving to the authenticated Firebase User
 * @throws FirebaseError if account creation fails (e.g., email already in use)
 * 
 * @example
 * try {
 *   const user = await signUpWithEmail('user@example.com', 'password123');
 *   console.log('Account created:', user.email);
 * } catch (error) {
 *   console.error('Email sign-up failed:', error);
 * }
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const result: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return result.user;
  } catch (error) {
    // Re-throw with context for better error handling upstream
    throw error;
  }
}

/**
 * Send password reset email
 * 
 * Sends a password reset email to the specified email address.
 * The email contains a link to Firebase's hosted password reset page.
 * For security, this function does not reveal whether the email exists.
 * 
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 * @throws FirebaseError if sending fails (network error, rate limiting, etc.)
 * 
 * @example
 * try {
 *   await sendPasswordResetEmail('user@example.com');
 *   console.log('Password reset email sent');
 * } catch (error) {
 *   console.error('Failed to send reset email:', error);
 * }
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error) {
    // Re-throw with context for better error handling upstream
    throw error;
  }
}
