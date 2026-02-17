'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TipSummary } from '@/lib/types/api';
import { truncateText } from '@/lib/utils/text';
import { generateTipImageAlt } from '@/lib/utils/seo';
import { generateTipStructuredData } from '@/lib/seo/structured-data';

export interface TipCardProps {
  tip: TipSummary;
}

/**
 * TipCard displays a tip summary with image, title, description, and category badge.
 * The entire card is clickable and navigates to the tip detail page.
 * The favorites button has independent functionality and doesn't trigger navigation.
 * 
 * Implements semantic HTML with <article> tag and includes structured data (JSON-LD).
 */
export function TipCard({ tip }: TipCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
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
  
  const imageAlt = generateTipImageAlt(tip);
  const structuredData = generateTipStructuredData(tip);

  return (
    <article 
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group transform hover:rotate-[-1deg] transition-transform duration-300"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View tip: ${tip.title}`}
    >
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Tip Image with Category Badge Overlay */}
      <div className="relative w-full aspect-[16/9] bg-gray-200">
        {tip.image?.imageUrl ? (
          <Image
            src={tip.image.imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl" aria-hidden="true">📝</span>
          </div>
        )}
        
        {/* Category Badge - Overlaid on top-right */}
        <div className="absolute top-3 right-3">
          <span className="inline-block px-3 py-1 bg-white text-gray-800 text-xs font-medium rounded-full shadow-sm">
            {tip.categoryName}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {truncatedTitle}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {truncatedDescription}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleFavorite}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={`Add ${tip.title} to favorites`}
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
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
    </article>
  );
}
