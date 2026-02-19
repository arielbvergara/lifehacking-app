'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth/firebase-auth';
import { addToast } from '@/lib/hooks/use-toast';

/**
 * LogOutButton Component
 * 
 * Provides a centered button for users to sign out of their account.
 * Handles sign out process and redirects to home page.
 * 
 * @example
 * <LogOutButton />
 */
export function LogOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogOut = async () => {
    setIsLoading(true);
    
    try {
      await signOut();
      
      // Clear session cookie
      document.cookie = 'session=; path=/; max-age=0';
      
      // Show success toast
      addToast({
        type: 'success',
        message: 'Signed out successfully',
      });
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('[LogOutButton] Sign out failed:', error);
      
      addToast({
        type: 'error',
        message: 'Failed to sign out. Please try again.',
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleLogOut}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
      >
        <span className="material-icons-round text-xl">logout</span>
        <span>{isLoading ? 'Signing out...' : 'Log Out'}</span>
      </button>
    </div>
  );
}
