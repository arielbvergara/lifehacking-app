'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { getUserProfile, type UserProfile } from '@/lib/api/user';

/**
 * Hook to fetch and manage user profile data
 * 
 * Fetches the user profile from the backend API when the user is authenticated.
 * Provides loading state and error handling.
 * 
 * @returns Object containing user profile, loading state, error, and isAdmin flag
 */
export function useUserProfile() {
  const { user, idToken } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user || !idToken) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userProfile = await getUserProfile(idToken);
        setProfile(userProfile);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, idToken]);

  return {
    profile,
    loading,
    error,
    isAdmin: profile?.role === 'Admin',
  };
}
