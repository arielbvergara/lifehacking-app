import { parseVideoUrl } from '@/lib/utils/video';

/**
 * VideoEmbedProps Interface
 * 
 * Props for the VideoEmbed component.
 */
export interface VideoEmbedProps {
  videoUrl: string;
  title: string; // Used for iframe title attribute
}

/**
 * VideoEmbed Component
 * 
 * Embeds YouTube or Instagram videos with privacy-enhanced settings.
 * Supports:
 * - YouTube watch URLs (https://www.youtube.com/watch?v=*)
 * - YouTube Shorts URLs (https://www.youtube.com/shorts/*)
 * - Instagram URLs (https://www.instagram.com/p/*)
 * 
 * Features:
 * - Privacy-enhanced YouTube embeds (youtube-nocookie.com)
 * - Responsive 16:9 aspect ratio container
 * - Proper iframe sandbox attributes for security
 * - Fallback to null for invalid URLs
 * 
 * @example
 * <VideoEmbed
 *   videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   title="How to Peel Garlic in 10 Seconds"
 * />
 */
export function VideoEmbed({ videoUrl, title }: VideoEmbedProps) {
  // Parse the video URL to extract embed information
  const parsedVideo = parseVideoUrl(videoUrl);

  // If URL is invalid or unsupported, return null (fallback handled by parent)
  if (!parsedVideo) {
    return null;
  }

  const { embedUrl } = parsedVideo;

  // Generate descriptive iframe title
  const iframeTitle = `Video: ${title}`;
  const ariaLabel = `Video demonstration of ${title}`;

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-card">
      <iframe
        src={embedUrl}
        title={iframeTitle}
        aria-label={ariaLabel}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}
