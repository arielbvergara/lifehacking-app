'use client';

import { useRouter } from 'next/navigation';

/**
 * TipHeaderProps Interface
 * 
 * Props for the TipHeader component.
 */
export interface TipHeaderProps {
  title: string;
  categoryName: string;
  createdAt: string; // ISO 8601 date-time
  tags?: string[];
}

/**
 * Formats an ISO 8601 date string to a readable format
 * @param isoDate - ISO 8601 date string
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * TipHeader Component
 * 
 * Displays tip title, category badge, and metadata (creation date, tags).
 * Uses responsive typography that scales from 4xl to 5xl.
 * 
 * @example
 * <TipHeader
 *   title="Peel Garlic in 10 Seconds"
 *   categoryName="Kitchen"
 *   createdAt="2024-01-15T10:30:00Z"
 *   tags={['quick', 'easy', 'kitchen']}
 * />
 */
export function TipHeader({ title, categoryName, createdAt, tags }: TipHeaderProps) {
  const router = useRouter();
  const formattedDate = formatDate(createdAt);

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <header className="mb-8">
      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold uppercase tracking-wide rounded-full">
          {categoryName}
        </span>
      </div>

      {/* Tip Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        {title}
      </h1>

      {/* Metadata Row */}
      <div className="flex items-center gap-2 text-gray-600">
        <span className="material-icons-round text-lg" aria-hidden="true">
          schedule
        </span>
        <time dateTime={createdAt} className="text-sm">
          {formattedDate}
        </time>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {tags.map((tag, index) => (
            <button
              key={`${tag}-${index}`}
              onClick={() => handleTagClick(tag)}
              className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              type="button"
            >
              #{tag.toLowerCase().replace(/\s+/g, '')}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
