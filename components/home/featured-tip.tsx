'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TipSummary } from '@/lib/types/api';
import { truncateText } from '@/lib/utils/text';
import { generateTipImageAlt } from '@/lib/utils/seo';
import { generateTipStructuredData } from '@/lib/seo/structured-data';

export interface FeaturedTipProps {
  tip: TipSummary | null;
}

const DESCRIPTION_MAX_LENGTH = 200;
const TIP_OF_THE_DAY_BADGE_TEXT = 'TIP OF THE DAY';
const WATCH_VIDEO_TEXT = 'Watch Video';
const READ_GUIDE_TEXT = 'Read Guide';

/**
 * FeaturedTip Component
 * 
 * Displays the most recent tip in a prominent card format with image,
 * badge, title, description, and action buttons.
 * 
 * Server-rendered with cached data for optimal performance.
 * Implements semantic HTML with <article> tag and includes structured data (JSON-LD).
 */
export function FeaturedTip({ tip }: FeaturedTipProps) {
  const router = useRouter();

  const handleWatchVideo = () => {
    if (tip) {
      router.push(`/tip/${tip.id}`);
    }
  };

  const handleReadGuide = () => {
    // Placeholder for future implementation
    // This button is intentionally non-functional
  };

  if (!tip) {
    return null;
  }

  const truncatedDescription = truncateText(tip.description, DESCRIPTION_MAX_LENGTH);
  const structuredData = generateTipStructuredData(tip);
  const imageAlt = generateTipImageAlt(tip);

  return (
    <section className="px-4 py-16 sm:p-16 md:py-16 bg-gradient-to-r from-[#e8f5e8] via-[#f0f9f0] to-[#FCFCFC]" aria-label="Featured tip of the day">
      <div className="container mx-auto px-4 max-w-6xl">
        <article>
          {/* Structured Data (JSON-LD) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            {/* Content Section */}
            <div className="flex-1">
              <div className="inline-block px-4 py-2 bg-[#2BEE2B] text-black text-xs font-bold rounded-full mb-6">
                {TIP_OF_THE_DAY_BADGE_TEXT}
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {tip.title}
              </h2>
              
              <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
                {truncatedDescription}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleWatchVideo}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-md hover:shadow-lg"
                  aria-label={`Watch video for ${tip.title}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="white" />
                    <path d="M10 8.5v7l6-3.5-6-3.5z" fill="black" />
                  </svg>
                  {WATCH_VIDEO_TEXT}
                </button>
                
                <button
                  onClick={handleReadGuide}
                  className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 shadow-sm hover:shadow-md"
                  aria-label={`Read guide for ${tip.title}`}
                >
                  {READ_GUIDE_TEXT}
                </button>
              </div>
            </div>

            {/* Image Section */}
            {tip.image?.imageUrl && (
              <div className="lg:w-1/2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md aspect-[4/5]">
                  <Image
                    src={tip.image.imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transform rotate-[-6deg] hover:rotate-[-3deg] transition-transform duration-300"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
