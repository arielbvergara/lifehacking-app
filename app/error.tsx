'use client';

/**
 * Error Boundary for Home Page
 * 
 * Catches and handles errors that occur during server-side rendering
 * or client-side execution. Provides a user-friendly error message
 * and retry mechanism.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="material-icons-round text-6xl text-red-500">error_outline</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h2>
        
        <p className="text-gray-600 mb-6">
          We encountered an error while loading the page. Please try again.
        </p>
        
        {error.message && (
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 p-3 rounded">
            {error.message}
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
