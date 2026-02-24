import Image from 'next/image';
import { VideoEmbed } from './video-embed';
import { TipImage } from '@/lib/types/api';

/**
 * TipHeroProps Interface
 * 
 * Props for the TipHero component.
 */
export interface TipHeroProps {
  videoUrl?: string | null;
  image?: TipImage | null;
  title: string; // Used for alt text
}

/**
 * TipHero Component
 * 
 * Displays the main visual content for a tip (video or image).
 * 
 * Rendering Priority:
 * 1. If videoUrl exists → render VideoEmbed component
 * 2. Else if image exists → render Next.js Image with optimization
 * 3. Else → render default.png fallback image
 * 
 * Features:
 * - Responsive 16:9 aspect ratio
 * - Next.js Image optimization with priority loading (above fold)
 * - Rounded corners (rounded-3xl) and shadow (shadow-card)
 * - Descriptive alt text for accessibility
 * 
 * @example
 * // With video
 * <TipHero
 *   videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   title="How to Peel Garlic in 10 Seconds"
 * />
 * 
 * @example
 * // With image
 * <TipHero
 *   image={{
 *     imageUrl: "https://example.com/image.jpg",
 *     imageStoragePath: "/tips/image.jpg",
 *     originalFileName: "garlic.jpg",
 *     contentType: "image/jpeg",
 *     fileSizeBytes: 102400,
 *     uploadedAt: "2024-01-15T10:30:00Z"
 *   }}
 *   title="How to Peel Garlic in 10 Seconds"
 * />
 * 
 * @example
 * // With default fallback
 * <TipHero title="How to Peel Garlic in 10 Seconds" />
 */
export function TipHero({ videoUrl, image, title }: TipHeroProps) {
  // Priority 1: Render video if videoUrl exists
  if (videoUrl) {
    return (
      <div className="mb-12">
        <VideoEmbed videoUrl={videoUrl} title={title} />
      </div>
    );
  }

  // Priority 2: Render image if available
  const imageUrl = image?.imageUrl || '/default.png';
  const altText = image?.imageUrl 
    ? `${title} - Life hack demonstration` 
    : 'Life hack illustration';

  return (
    <div className="mb-12">
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-card">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          priority
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1280px) 80vw, 1200px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
