/**
 * User API Functions
 * 
 * This module provides functions for interacting with the backend User API.
 * These functions handle user profile management and synchronization with Firebase auth.
 */

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
 */
export interface CreateUserPayload {
  email: string;
  name?: string;
  externalAuthId: string;
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
  const response = await fetch(`${API_BASE_URL}/api/User`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
}

/**
 * Handle user synchronization with backend
 * 
 * Checks if user exists in backend, creates if not.
 * This should be called after successful Firebase authentication.
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
  try {
    // Try to fetch existing user profile
    return await getUserProfile(idToken);
  } catch (error) {
    // If user doesn't exist (404), create new profile
    if (error instanceof Error && error.message === 'User profile not found') {
      return await createUser(idToken);
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Create user in backend with specific payload
 * 
 * This function is used during signup to create a user profile with
 * specific data (email, name, externalAuthId). It's different from
 * createUser() which relies on the backend to extract data from the token.
 * 
 * @param idToken - Firebase ID token for authentication
 * @param payload - User data to create (email, name, externalAuthId)
 * @returns Promise resolving when user is created
 * @throws Error if API request fails
 * 
 * @example
 * try {
 *   await createUserInBackend(idToken, {
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *     externalAuthId: 'firebase-uid-123'
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
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const response = await fetch(`${API_BASE_URL}/api/User`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let backendMessage = "Failed to create user in backend";
    try {
      const problem = await response.json();
      if (problem && typeof problem.detail === "string") {
        backendMessage = problem.detail;
      }
    } catch {
      // Ignore JSON parse issues and keep the generic message
    }
    throw new Error(backendMessage);
  }
}
