/**
 * Loading UI for Search Page
 * 
 * Displayed while the search page is loading data from the server.
 */

export default function SearchLoading() {
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
        
        {/* Category Filter Skeleton */}
        <div className="border-t border-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex gap-2 overflow-x-auto">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Search Results Skeleton */}
          <div className="mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
            ))}
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
