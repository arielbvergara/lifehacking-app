import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoEmbed } from './video-embed';
import * as videoUtils from '@/lib/utils/video';

// Mock the parseVideoUrl utility
vi.mock('@/lib/utils/video');

describe('VideoEmbed', () => {
  const mockTitle = 'How to Peel Garlic in 10 Seconds';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('YouTube Watch URLs', () => {
    it('Should_RenderIframeWithCorrectYouTubeEmbedUrl_When_ValidYouTubeUrlProvided', () => {
      const mockVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const mockParsedVideo = {
        provider: 'youtube' as const,
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.test/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
      };

      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);

      render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', mockParsedVideo.embedUrl);
    });

    it('Should_UsePrivacyEnhancedYouTubeDomain_When_RenderingYouTubeEmbed', () => {
      const mockVideoUrl = 'https://www.youtube.com/watch?v=abc123';
      const mockParsedVideo = {
        provider: 'youtube' as const,
        videoId: 'abc123',
        embedUrl: 'https://www.youtube-nocookie.test/embed/abc123?rel=0&modestbranding=1',
      };

      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);

      render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe.getAttribute('src')).toContain('youtube-nocookie');
    });
  });

  describe('YouTube Shorts URLs', () => {
    it('Should_RenderIframeWithCorrectYouTubeShortsEmbedUrl_When_ValidShortsUrlProvided', () => {
      const mockVideoUrl = 'https://www.youtube.com/shorts/xyz789';
      const mockParsedVideo = {
        provider: 'youtube-shorts' as const,
        videoId: 'xyz789',
        embedUrl: 'https://www.youtube-nocookie.test/embed/xyz789?rel=0&modestbranding=1',
      };

      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);

      render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', mockParsedVideo.embedUrl);
    });
  });

  describe('Instagram URLs', () => {
    it('Should_RenderIframeWithCorrectInstagramEmbedUrl_When_ValidInstagramUrlProvided', () => {
      const mockVideoUrl = 'https://www.instagram.com/p/ABC123def';
      const mockParsedVideo = {
        provider: 'instagram' as const,
        videoId: 'ABC123def',
        embedUrl: 'https://www.instagram.test/p/ABC123def/embed',
      };

      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);

      render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', mockParsedVideo.embedUrl);
    });
  });

  describe('Invalid URLs', () => {
    it('Should_ReturnNull_When_InvalidUrlProvided', () => {
      const mockVideoUrl = 'https://example.com/invalid-video';
      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(null);

      const { container } = render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      expect(container.firstChild).toBeNull();
    });

    it('Should_ReturnNull_When_UnsupportedVideoPlatformProvided', () => {
      const mockVideoUrl = 'https://vimeo.com/123456';
      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(null);

      const { container } = render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      expect(container.firstChild).toBeNull();
    });

    it('Should_ReturnNull_When_EmptyUrlProvided', () => {
      const mockVideoUrl = '';
      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(null);

      const { container } = render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Iframe Attributes', () => {
    beforeEach(() => {
      const mockParsedVideo = {
        provider: 'youtube' as const,
        videoId: 'test123',
        embedUrl: 'https://www.youtube-nocookie.test/embed/test123?rel=0&modestbranding=1',
      };
      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);
    });

    it('Should_IncludeProperTitleAttribute_When_RenderingIframe', () => {
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toHaveAttribute('title', `Video: ${mockTitle}`);
    });

    it('Should_IncludeProperAriaLabelAttribute_When_RenderingIframe', () => {
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toHaveAttribute('aria-label', `Video demonstration of ${mockTitle}`);
    });

    it('Should_IncludeSandboxAttributeForSecurity_When_RenderingIframe', () => {
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    });

    it('Should_IncludeAllowFullScreenAttribute_When_RenderingIframe', () => {
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toHaveAttribute('allowFullScreen');
    });

    it('Should_IncludeAllowAttributeWithRequiredPermissions_When_RenderingIframe', () => {
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      const allowAttr = iframe.getAttribute('allow');
      expect(allowAttr).toContain('accelerometer');
      expect(allowAttr).toContain('autoplay');
      expect(allowAttr).toContain('clipboard-write');
      expect(allowAttr).toContain('encrypted-media');
      expect(allowAttr).toContain('gyroscope');
      expect(allowAttr).toContain('picture-in-picture');
    });

    it('Should_IncludeLoadingLazyAttributeForPerformance_When_RenderingIframe', () => {
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Responsive Container', () => {
    beforeEach(() => {
      const mockParsedVideo = {
        provider: 'youtube' as const,
        videoId: 'test123',
        embedUrl: 'https://www.youtube-nocookie.test/embed/test123?rel=0&modestbranding=1',
      };
      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);
    });

    it('Should_ApplyAspectVideoClassFor16By9AspectRatio_When_RenderingContainer', () => {
      const { container } = render(
        <VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('aspect-video');
    });

    it('Should_ApplyResponsiveWidthClass_When_RenderingContainer', () => {
      const { container } = render(
        <VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-full');
    });

    it('Should_ApplyRoundedCornersStyling_When_RenderingContainer', () => {
      const { container } = render(
        <VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('rounded-3xl');
    });

    it('Should_ApplyShadowCardStyling_When_RenderingContainer', () => {
      const { container } = render(
        <VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('shadow-card');
    });

    it('Should_ApplyOverflowHiddenToContainer_When_RenderingContainer', () => {
      const { container } = render(
        <VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('overflow-hidden');
    });

    it('Should_FillContainerWithAbsolutePositioning_When_RenderingIframe', () => {
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={mockTitle} />);

      const iframe = screen.getByTitle(`Video: ${mockTitle}`);
      expect(iframe).toHaveClass('absolute', 'inset-0', 'w-full', 'h-full');
    });
  });

  describe('Integration with parseVideoUrl', () => {
    it('Should_CallParseVideoUrlWithProvidedUrl_When_ComponentRenders', () => {
      const mockVideoUrl = 'https://www.youtube.com/watch?v=test123';
      const mockParsedVideo = {
        provider: 'youtube' as const,
        videoId: 'test123',
        embedUrl: 'https://www.youtube-nocookie.test/embed/test123?rel=0&modestbranding=1',
      };

      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);

      render(<VideoEmbed videoUrl={mockVideoUrl} title={mockTitle} />);

      expect(videoUtils.parseVideoUrl).toHaveBeenCalledWith(mockVideoUrl);
      expect(videoUtils.parseVideoUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different Titles', () => {
    beforeEach(() => {
      const mockParsedVideo = {
        provider: 'youtube' as const,
        videoId: 'test123',
        embedUrl: 'https://www.youtube-nocookie.test/embed/test123?rel=0&modestbranding=1',
      };
      vi.mocked(videoUtils.parseVideoUrl).mockReturnValue(mockParsedVideo);
    });

    it('Should_HandleShortTitlesCorrectly_When_ShortTitleProvided', () => {
      const shortTitle = 'Quick Tip';
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={shortTitle} />);

      const iframe = screen.getByTitle(`Video: ${shortTitle}`);
      expect(iframe).toBeInTheDocument();
    });

    it('Should_HandleLongTitlesCorrectly_When_LongTitleProvided', () => {
      const longTitle = 'This is a very long tip title that describes a complex life hack in great detail';
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={longTitle} />);

      const iframe = screen.getByTitle(`Video: ${longTitle}`);
      expect(iframe).toBeInTheDocument();
    });

    it('Should_HandleTitlesWithSpecialCharacters_When_SpecialCharactersInTitle', () => {
      const specialTitle = 'How to Cook "Perfect" Pasta & More!';
      render(<VideoEmbed videoUrl="https://www.youtube.com/watch?v=test123" title={specialTitle} />);

      const iframe = screen.getByTitle(`Video: ${specialTitle}`);
      expect(iframe).toBeInTheDocument();
    });
  });
});
