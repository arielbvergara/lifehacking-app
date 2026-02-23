/**
 * User API Functions
 * 
 * This module provides functions for interacting with the backend User API.
 * These functions handle user profile management and synchronization with Firebase auth.
 */

import { handleFavoritesMerge } from '@/lib/favorites/merge-handler';
import { API_BASE_URL } from '@/lib/config/api';

/**
 * User profile data structure from backend API
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
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

  const profile = await response.json();
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
  let profile: UserProfile;
  
  try {
    // Try to fetch existing user profile
    profile = await getUserProfile(idToken);
  } catch (error) {
    // If user doesn't exist (404), create new profile
    if (error instanceof Error && error.message === 'User profile not found') {
      profile = await createUser(idToken);
    } else {
      // Re-throw other errors
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
 * Update user's display name
 * 
 * Sends a PUT request to update the user's display name in the backend.
 * 
 * @param idToken - Firebase ID token for authentication
 * @param name - New display name (should be alphanumeric, 2-100 characters)
 * @returns Promise resolving when display name is updated
 * @throws Error if API request fails or network error occurs
 * 
 * @example
 * try {
 *   await updateDisplayName(idToken, 'JohnDoe123');
 *   console.log('Display name updated successfully');
 * } catch (error) {
 *   console.error('Failed to update display name:', error);
 * }
 */
export async function updateDisplayName(
  idToken: string,
  name: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/User/me/name`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newName: name }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.detail || 'Invalid display name');
      }
      throw new Error('Failed to update display name');
    }
  } catch (error) {
    // Re-throw API errors as-is
    if (error instanceof Error && error.message !== 'Failed to fetch') {
      throw error;
    }
    // Handle network errors (Requirement 7.6)
    throw new Error('Network error. Please check your connection and try again.');
  }
}

/**
 * Delete user account
 * 
 * Sends a DELETE request to permanently delete the user's account from the backend.
 * This operation is irreversible and will remove all user data.
 * 
 * @param idToken - Firebase ID token for authentication
 * @returns Promise resolving when account is deleted
 * @throws Error if API request fails or network error occurs
 * 
 * @example
 * try {
 *   await deleteAccount(idToken);
 *   console.log('Account deleted successfully');
 * } catch (error) {
 *   console.error('Failed to delete account:', error);
 * }
 */
export async function deleteAccount(idToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/User/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Account not found');
      }
      throw new Error('Failed to delete account');
    }
  } catch (error) {
    // Re-throw API errors as-is
    if (error instanceof Error && error.message !== 'Failed to fetch') {
      throw error;
    }
    // Handle network errors (Requirement 7.6)
    throw new Error('Network error. Please check your connection and try again.');
  }
}

/**
 * Get count of user's saved tips
 * 
 * Fetches the total count of favorites from the backend API.
 * Uses pageSize=1 to minimize response size while getting totalCount.
 * 
 * @param idToken - Firebase ID token for authentication
 * @returns Promise resolving to the count of saved tips
 * @throws Error if API request fails
 * 
 * @example
 * try {
 *   const count = await getSavedTipsCount(idToken);
 *   console.log('Saved tips:', count);
 * } catch (error) {
 *   console.error('Failed to fetch saved tips count:', error);
 * }
 */
export async function getSavedTipsCount(idToken: string): Promise<number> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/me/favorites?pageSize=1&pageNumber=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch saved tips count');
    }

    const data = await response.json();
    return data.metadata?.totalItems || 0;
  } catch (error) {
    // Re-throw API errors as-is
    if (error instanceof Error && error.message !== 'Failed to fetch') {
      throw error;
    }
    // Handle network errors
    throw new Error('Network error. Please check your connection and try again.');
  }
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
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const url = `${API_BASE_URL}/api/User`;

  const response = await fetch(url, {
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
      // Ignore parse errors
    }
    throw new Error(backendMessage);
  }
}
