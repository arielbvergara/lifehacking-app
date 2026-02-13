import { describe, it, expect } from 'vitest';
import { parseVideoUrl } from './video';

describe('parseVideoUrl', () => {
  describe('YouTube Watch URLs', () => {
    it('Should_ParseYouTubeWatchUrl_When_ValidUrlProvided', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.provider).toBe('youtube');
      expect(result?.videoId).toBe('dQw4w9WgXcQ');
      expect(result?.embedUrl).toBe(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
      );
    });

    it('Should_ParseYouTubeWatchUrl_When_VideoIdContainsUnderscores', () => {
      const url = 'https://www.youtube.com/watch?v=abc_123_xyz';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('abc_123_xyz');
    });

    it('Should_ParseYouTubeWatchUrl_When_VideoIdContainsDashes', () => {
      const url = 'https://www.youtube.com/watch?v=abc-123-xyz';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('abc-123-xyz');
    });

    it('Should_UsePrivacyEnhancedDomain_When_ParsingYouTubeUrl', () => {
      const url = 'https://www.youtube.com/watch?v=test123';
      const result = parseVideoUrl(url);

      expect(result?.embedUrl).toContain('youtube-nocookie.com');
    });

    it('Should_IncludeEmbedParameters_When_ParsingYouTubeUrl', () => {
      const url = 'https://www.youtube.com/watch?v=test123';
      const result = parseVideoUrl(url);

      expect(result?.embedUrl).toContain('rel=0');
      expect(result?.embedUrl).toContain('modestbranding=1');
    });
  });

  describe('YouTube Shorts URLs', () => {
    it('Should_ParseYouTubeShortsUrl_When_ValidUrlProvided', () => {
      const url = 'https://www.youtube.com/shorts/abc123xyz';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.provider).toBe('youtube-shorts');
      expect(result?.videoId).toBe('abc123xyz');
      expect(result?.embedUrl).toBe(
        'https://www.youtube-nocookie.com/embed/abc123xyz?rel=0&modestbranding=1'
      );
    });

    it('Should_ParseYouTubeShortsUrl_When_VideoIdContainsSpecialChars', () => {
      const url = 'https://www.youtube.com/shorts/test_123-xyz';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('test_123-xyz');
    });

    it('Should_UsePrivacyEnhancedDomain_When_ParsingShortsUrl', () => {
      const url = 'https://www.youtube.com/shorts/test123';
      const result = parseVideoUrl(url);

      expect(result?.embedUrl).toContain('youtube-nocookie.com');
    });
  });

  describe('Instagram URLs', () => {
    it('Should_ParseInstagramUrl_When_ValidUrlProvided', () => {
      const url = 'https://www.instagram.com/p/ABC123xyz';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.provider).toBe('instagram');
      expect(result?.videoId).toBe('ABC123xyz');
      expect(result?.embedUrl).toBe('https://www.instagram.com/p/ABC123xyz/embed');
    });

    it('Should_ParseInstagramUrl_When_PostIdContainsUnderscores', () => {
      const url = 'https://www.instagram.com/p/test_123_post';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('test_123_post');
    });

    it('Should_ParseInstagramUrl_When_PostIdContainsDashes', () => {
      const url = 'https://www.instagram.com/p/test-123-post';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('test-123-post');
    });

    it('Should_GenerateCorrectEmbedUrl_When_ParsingInstagramUrl', () => {
      const url = 'https://www.instagram.com/p/testpost123';
      const result = parseVideoUrl(url);

      expect(result?.embedUrl).toBe('https://www.instagram.com/p/testpost123/embed');
    });
  });

  describe('Unsupported URLs', () => {
    it('Should_ReturnNull_When_InvalidUrlProvided', () => {
      const url = 'https://example.com/video';
      const result = parseVideoUrl(url);

      expect(result).toBeNull();
    });

    it('Should_ReturnNull_When_VimeoUrlProvided', () => {
      const url = 'https://vimeo.com/123456789';
      const result = parseVideoUrl(url);

      expect(result).toBeNull();
    });

    it('Should_ReturnNull_When_TikTokUrlProvided', () => {
      const url = 'https://www.tiktok.com/@user/video/123456789';
      const result = parseVideoUrl(url);

      expect(result).toBeNull();
    });

    it('Should_ReturnNull_When_EmptyStringProvided', () => {
      const url = '';
      const result = parseVideoUrl(url);

      expect(result).toBeNull();
    });

    it('Should_ReturnNull_When_MalformedYouTubeUrlProvided', () => {
      const url = 'https://www.youtube.com/video';
      const result = parseVideoUrl(url);

      expect(result).toBeNull();
    });

    it('Should_ReturnNull_When_MalformedInstagramUrlProvided', () => {
      const url = 'https://www.instagram.com/user/profile';
      const result = parseVideoUrl(url);

      expect(result).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('Should_ParseYouTubeUrl_When_UrlHasAdditionalQueryParams', () => {
      const url = 'https://www.youtube.com/watch?v=test123&t=30s&list=PLxyz';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('test123');
    });

    it('Should_HandleCaseSensitivity_When_ParsingVideoIds', () => {
      const url = 'https://www.youtube.com/watch?v=AbC123XyZ';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('AbC123XyZ');
    });

    it('Should_ParseInstagramUrl_When_UrlHasTrailingSlash', () => {
      const url = 'https://www.instagram.com/p/ABC123xyz/';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('ABC123xyz');
    });
  });

  describe('Return Type Validation', () => {
    it('Should_ReturnCorrectInterface_When_ValidYouTubeUrlProvided', () => {
      const url = 'https://www.youtube.com/watch?v=test123';
      const result = parseVideoUrl(url);

      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('videoId');
      expect(result).toHaveProperty('embedUrl');
    });

    it('Should_ReturnCorrectProviderType_When_ValidUrlProvided', () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=test123';
      const shortsUrl = 'https://www.youtube.com/shorts/test123';
      const instagramUrl = 'https://www.instagram.com/p/test123';

      const youtubeResult = parseVideoUrl(youtubeUrl);
      const shortsResult = parseVideoUrl(shortsUrl);
      const instagramResult = parseVideoUrl(instagramUrl);

      expect(youtubeResult?.provider).toBe('youtube');
      expect(shortsResult?.provider).toBe('youtube-shorts');
      expect(instagramResult?.provider).toBe('instagram');
    });
  });
});
