export type VideoProvider = 'youtube' | 'youtube-shorts' | 'instagram' | 'unknown';

export interface ParsedVideo {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
}

/**
 * Parses video URL and returns embed information
 * @param url - Video URL from API
 * @returns Parsed video data or null if unsupported
 */
export function parseVideoUrl(url: string): ParsedVideo | null {
  // YouTube Watch: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeWatchRegex = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/;
  const youtubeWatchMatch = url.match(youtubeWatchRegex);
  if (youtubeWatchMatch) {
    return {
      provider: 'youtube',
      videoId: youtubeWatchMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeWatchMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const youtubeShortsRegex = /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/;
  const youtubeShortsMatch = url.match(youtubeShortsRegex);
  if (youtubeShortsMatch) {
    return {
      provider: 'youtube-shorts',
      videoId: youtubeShortsMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeShortsMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Instagram: https://www.instagram.com/p/POST_ID
  const instagramRegex = /(?:instagram\.com\/p\/)([a-zA-Z0-9_-]+)/;
  const instagramMatch = url.match(instagramRegex);
  if (instagramMatch) {
    return {
      provider: 'instagram',
      videoId: instagramMatch[1],
      embedUrl: `https://www.instagram.com/p/${instagramMatch[1]}/embed`,
    };
  }

  return null;
}
