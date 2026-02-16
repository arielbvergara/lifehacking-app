/**
 * Loading UI for Home Page
 * 
 * Displayed while the page is loading data from the server.
 * Shows skeleton loaders for a better user experience.
 */

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header Skeleton */}
      <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-10 w-64 bg-gray-200 rounded-full animate-pulse hidden md:block" />
              <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section Skeleton */}
        <div className="bg-gradient-to-br from-primary-light via-white to-primary-light/50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <div className="h-12 w-3/4 mx-auto bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-6 w-1/2 mx-auto bg-gray-200 rounded animate-pulse mb-8" />
            <div className="h-12 w-full max-w-2xl mx-auto bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Categories Section Skeleton */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Featured Tip Skeleton */}
        <div className="py-16 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Latest Tips Skeleton */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="h-6 w-48 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
