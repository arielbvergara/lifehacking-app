'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TipSummary } from '@/lib/types/api';
import { truncateText } from '@/lib/utils/text';

export interface TipCardProps {
  tip: TipSummary;
}

/**
 * TipCard displays a tip summary with image, title, description, and category badge.
 * Clicking "Read tip >" navigates to the tip detail page.
 */
export function TipCard({ tip }: TipCardProps) {
  const router = useRouter();

  const handleReadTip = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/tip/${tip.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Non-functional placeholder for future implementation
  };

  // Truncate title to 2 lines (approximately 60 characters)
  const truncatedTitle = truncateText(tip.title, 60);
  
  // Truncate description to 3 lines (approximately 120 characters)
  const truncatedDescription = truncateText(tip.description, 120);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Tip Image */}
      <div className="relative w-full h-48 bg-gray-200">
        {tip.videoUrl ? (
          <Image
            src={tip.videoUrl}
            alt={tip.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📝</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {tip.categoryName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {truncatedTitle}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {truncatedDescription}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReadTip}
            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
          >
            Read tip &gt;
          </button>
          
          <button
            onClick={handleFavorite}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Add to favorites"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
