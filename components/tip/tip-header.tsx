/**
 * TipHeaderProps Interface
 * 
 * Props for the TipHeader component.
 */
export interface TipHeaderProps {
  title: string;
  categoryName: string;
  createdAt: string; // ISO 8601 date-time
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
 * Displays tip title, category badge, and metadata (creation date).
 * Uses responsive typography that scales from 4xl to 5xl.
 * 
 * @example
 * <TipHeader
 *   title="Peel Garlic in 10 Seconds"
 *   categoryName="Kitchen"
 *   createdAt="2024-01-15T10:30:00Z"
 * />
 */
export function TipHeader({ title, categoryName, createdAt }: TipHeaderProps) {
  const formattedDate = formatDate(createdAt);

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
    </header>
  );
}
