/**
 * User API Functions
 * 
 * This module provides functions for interacting with the backend User API.
 * These functions handle user profile management and synchronization with Firebase auth.
 */

import { handleFavoritesMerge } from '@/lib/favorites/merge-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * User profile data structure from backend API
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

/**
 * Payload for creating a new user in the backend
 * Note: externalAuthId is extracted from the JWT token by the backend, not from the request body
 */
export interface CreateUserPayload {
  email: string;
  name?: string;
}

/**
 * Fetch user profile from backend API
 * 
 * @param idToken - Firebase ID token for authentication
 * @returns Promise resolving to user profile data
 * @throws Error if API request fails
 * 
 * @example
 * try {
 *   const profile = await getUserProfile(idToken);
 *   console.log('User profile:', profile);
 * } catch (error) {
 *   console.error('Failed to fetch profile:', error);
 * }
 */
export async function getUserProfile(idToken: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/User/me`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User profile not found');
    }
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Create new user profile in backend
 * 
 * @param idToken - Firebase ID token for authentication
 * @returns Promise resolving to created user profile
 * @throws Error if API request fails
 * 
 * @example
 * try {
 *   const profile = await createUser(idToken);
 *   console.log('User created:', profile);
 * } catch (error) {
 *   console.error('Failed to create user:', error);
 * }
 */
export async function createUser(idToken: string): Promise<UserProfile> {
  console.log('[createUser] Creating user without payload');
  console.log('[createUser] API_BASE_URL:', API_BASE_URL);
  
  const response = await fetch(`${API_BASE_URL}/api/User`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('[createUser] Response status:', response.status);
  console.log('[createUser] Response ok:', response.ok);

  if (!response.ok) {
    let errorBody = 'No error body';
    try {
      errorBody = JSON.stringify(await response.json(), null, 2);
    } catch {
      // Ignore
    }
    console.log('[createUser] Error response:', errorBody);
    throw new Error('Failed to create user');
  }

  const profile = await response.json();
  console.log('[createUser] User created successfully:', profile.id);
  return profile;
}

/**
 * Handle user synchronization with backend
 * 
 * Checks if user exists in backend, creates if not.
 * This should be called after successful Firebase authentication.
 * After successful sync, triggers favorites merge to combine local favorites with server favorites.
 * 
 * @param idToken - Firebase ID token for authentication
 * @returns Promise resolving to user profile (existing or newly created)
 * @throws Error if synchronization fails
 * 
 * @example
 * try {
 *   const profile = await handleUserSync(idToken);
 *   console.log('User synced:', profile);
 * } catch (error) {
 *   console.error('Failed to sync user:', error);
 * }
 */
export async function handleUserSync(idToken: string): Promise<UserProfile> {
  console.log('[handleUserSync] Starting user sync');
  
  let profile: UserProfile;
  
  try {
    // Try to fetch existing user profile
    console.log('[handleUserSync] Checking if user exists...');
    profile = await getUserProfile(idToken);
    console.log('[handleUserSync] User exists:', profile.id);
  } catch (error) {
    console.log('[handleUserSync] Error fetching user:', error);
    
    // If user doesn't exist (404), create new profile
    if (error instanceof Error && error.message === 'User profile not found') {
      console.log('[handleUserSync] User not found, creating new user...');
      profile = await createUser(idToken);
      console.log('[handleUserSync] New user created:', profile.id);
    } else {
      // Re-throw other errors
      console.log('[handleUserSync] Re-throwing error');
      throw error;
    }
  }
  
  // Trigger favorites merge after successful sync (don't block on errors)
  // This happens only once, regardless of whether user existed or was created
  handleFavoritesMerge(idToken).catch((error) => {
    console.error('[handleUserSync] Favorites merge failed, but continuing:', error);
  });
  
  return profile;
}

/**
 * Create user in backend with specific payload
 * 
 * This function is used during signup to create a user profile with
 * specific data (email, name). The externalAuthId is automatically
 * extracted from the JWT token by the backend.
 * 
 * @param idToken - Firebase ID token for authentication
 * @param payload - User data to create (email, name)
 * @returns Promise resolving when user is created
 * @throws Error if API request fails
 * 
 * @example
 * try {
 *   await createUserInBackend(idToken, {
 *     email: 'user@example.com',
 *     name: 'John Doe'
 *   });
 *   console.log('User created successfully');
 * } catch (error) {
 *   console.error('Failed to create user:', error);
 * }
 */
export async function createUserInBackend(
  idToken: string,
  payload: CreateUserPayload
): Promise<void> {
  console.log('[createUserInBackend] Starting user creation');
  console.log('[createUserInBackend] API_BASE_URL:', API_BASE_URL);
  console.log('[createUserInBackend] Payload:', JSON.stringify(payload, null, 2));
  console.log('[createUserInBackend] Token (first 20 chars):', idToken.substring(0, 20) + '...');
  
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const url = `${API_BASE_URL}/api/User`;
  console.log('[createUserInBackend] Request URL:', url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  console.log('[createUserInBackend] Response status:', response.status);
  console.log('[createUserInBackend] Response ok:', response.ok);

  if (!response.ok) {
    let backendMessage = "Failed to create user in backend";
    try {
      const problem = await response.json();
      console.log('[createUserInBackend] Error response body:', JSON.stringify(problem, null, 2));
      if (problem && typeof problem.detail === "string") {
        backendMessage = problem.detail;
      }
    } catch (parseError) {
      console.log('[createUserInBackend] Failed to parse error response:', parseError);
    }
    console.log('[createUserInBackend] Throwing error:', backendMessage);
    throw new Error(backendMessage);
  }
  
  console.log('[createUserInBackend] User created successfully');
}
