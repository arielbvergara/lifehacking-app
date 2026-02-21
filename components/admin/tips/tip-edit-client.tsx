'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchTipById } from '@/lib/api/admin-tip';
import { TipForm } from '@/components/admin/tip-form';
import type { TipDetailResponse } from '@/lib/types/admin-tip';

interface TipEditClientProps {
  tipId: string;
}

/**
 * TipEditClient Component
 * 
 * Client-side component for editing an existing tip.
 * Fetches tip data on mount and displays the TipForm in edit mode.
 * Handles loading, 404 errors, and other error states gracefully.
 */
export function TipEditClient({ tipId }: TipEditClientProps) {
  const router = useRouter();
  const { idToken } = useAuth();
  const [tipData, setTipData] = useState<TipDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  /**
   * Load tip data from API
   * Handles loading state, error state, and data updates
   */
  const loadTipData = async () => {
    if (!idToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchTipById(tipId, idToken);
      setTipData(data);
    } catch (err) {
      const apiError = err as { status?: number; message?: string };
      setError({
        status: apiError.status,
        message: apiError.message || 'Failed to load tip',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tip data on mount when user is authenticated
  useEffect(() => {
    loadTipData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="animate-spin h-12 w-12 text-primary mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-gray-600">Loading tip...</p>
      </div>
    );
  }

  // 404 error state
  if (error?.status === 404) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="mb-4">
          <span className="material-icons-round text-gray-400 text-6xl">
            search_off
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tip not found
        </h3>
        <p className="text-gray-600 mb-6">
          The tip you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <button
          onClick={() => router.push('/admin/tips')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Back to Tips
        </button>
      </div>
    );
  }

  // Other error states
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="mb-4">
          <span className="material-icons-round text-red-500 text-5xl">
            error_outline
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Tip
        </h3>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={loadTipData}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  // No data loaded (e.g., user not authenticated)
  if (!tipData) {
    return null;
  }

  // Success state - render the form
  return (
    <TipForm
      mode="edit"
      initialData={tipData}
      tipId={tipId}
    />
  );
}
