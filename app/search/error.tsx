'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Error Boundary for Search Page
 * 
 * Catches and handles errors that occur during server-side rendering
 * or client-side execution on the search page.
 */

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture the error in Sentry
    Sentry.captureException(error);
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="material-icons-round text-6xl text-red-500">search_off</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Search Error
        </h2>
        
        <p className="text-gray-600 mb-6">
          We encountered an error while searching. Please try again.
        </p>
        
        {error.digest && (
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 p-3 rounded">
            Error ID: {error.digest}
          </p>
        )}
        
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
