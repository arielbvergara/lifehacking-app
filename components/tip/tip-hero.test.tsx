import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TipHero } from './tip-hero';
import { TipImage } from '@/lib/types/api';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, priority, sizes, fill, className }: {
    src: string;
    alt: string;
    priority?: boolean;
    sizes?: string;
    fill?: boolean;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-priority={priority}
      data-sizes={sizes}
      data-fill={fill}
      className={className}
    />
  ),
}));

// Mock VideoEmbed component
vi.mock('./video-embed', () => ({
  VideoEmbed: ({ videoUrl, title }: { videoUrl: string; title: string }) => (
    <div data-testid="video-embed" data-video-url={videoUrl} data-title={title}>
      Video Embed Mock
    </div>
  ),
}));

describe('TipHero', () => {
  const mockTitle = 'How to Peel Garlic in 10 Seconds';
  const mockImage: TipImage = {
    imageUrl: 'https://example.com/garlic-tip.jpg',
    imageStoragePath: '/tips/garlic-tip.jpg',
    originalFileName: 'garlic.jpg',
    contentType: 'image/jpeg',
    fileSizeBytes: 102400,
    uploadedAt: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conditional Rendering Priority', () => {
    it('Should_RenderVideoEmbed_When_VideoUrlProvided', () => {
      const mockVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      render(
        <TipHero
          videoUrl={mockVideoUrl}
          image={mockImage}
          title={mockTitle}
        />
      );

      const videoEmbed = screen.getByTestId('video-embed');
      expect(videoEmbed).toBeInTheDocument();
      expect(videoEmbed).toHaveAttribute('data-video-url', mockVideoUrl);
      expect(videoEmbed).toHaveAttribute('data-title', mockTitle);
    });

    it('Should_RenderVideoEmbedInsteadOfImage_When_BothVideoUrlAndImageProvided', () => {
      const mockVideoUrl = 'https://www.youtube.com/watch?v=abc123';
      
      render(
        <TipHero
          videoUrl={mockVideoUrl}
          image={mockImage}
          title={mockTitle}
        />
      );

      // Video should be rendered
      expect(screen.getByTestId('video-embed')).toBeInTheDocument();
      
      // Image should NOT be rendered
      expect(screen.queryByAltText(new RegExp(mockTitle))).not.toBeInTheDocument();
    });

    it('Should_RenderImage_When_NoVideoUrlButImageProvided', () => {
      render(
        <TipHero
          videoUrl={null}
          image={mockImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockImage.imageUrl);
    });

    it('Should_RenderDefaultImage_When_NoVideoUrlAndNoImage', () => {
      render(
        <TipHero
          videoUrl={null}
          image={null}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText('Life hack illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/default.png');
    });

    it('Should_RenderDefaultImage_When_NoVideoUrlAndImageIsUndefined', () => {
      render(
        <TipHero
          title={mockTitle}
        />
      );

      const image = screen.getByAltText('Life hack illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/default.png');
    });

    it('Should_RenderDefaultImage_When_ImageUrlIsNull', () => {
      const imageWithNullUrl: TipImage = {
        ...mockImage,
        imageUrl: null,
      };

      render(
        <TipHero
          videoUrl={null}
          image={imageWithNullUrl}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText('Life hack illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/default.png');
    });
  });

  describe('Next.js Image Component Props', () => {
    it('Should_SetPriorityPropToTrue_When_RenderingImage', () => {
      render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toHaveAttribute('data-priority', 'true');
    });

    it('Should_SetFillPropToTrue_When_RenderingImage', () => {
      render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toHaveAttribute('data-fill', 'true');
    });

    it('Should_SetResponsiveSizesAttribute_When_RenderingImage', () => {
      render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      const expectedSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
      expect(image).toHaveAttribute('data-sizes', expectedSizes);
    });

    it('Should_SetObjectCoverClass_When_RenderingImage', () => {
      render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toHaveClass('object-cover');
    });
  });

  describe('Alt Text Generation', () => {
    it('Should_GenerateDescriptiveAltText_When_ImageUrlProvided', () => {
      render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toBeInTheDocument();
    });

    it('Should_UseGenericAltText_When_UsingDefaultImage', () => {
      render(
        <TipHero
          title={mockTitle}
        />
      );

      const image = screen.getByAltText('Life hack illustration');
      expect(image).toBeInTheDocument();
    });

    it('Should_HandleLongTitlesInAltText_When_LongTitleProvided', () => {
      const longTitle = 'This is a very long tip title that describes a complex life hack in great detail';
      
      render(
        <TipHero
          image={mockImage}
          title={longTitle}
        />
      );

      const image = screen.getByAltText(`${longTitle} - Life hack demonstration`);
      expect(image).toBeInTheDocument();
    });

    it('Should_HandleSpecialCharactersInAltText_When_TitleHasSpecialCharacters', () => {
      const specialTitle = 'How to Cook "Perfect" Pasta & More!';
      
      render(
        <TipHero
          image={mockImage}
          title={specialTitle}
        />
      );

      const image = screen.getByAltText(`${specialTitle} - Life hack demonstration`);
      expect(image).toBeInTheDocument();
    });
  });

  describe('Container Styling', () => {
    it('Should_ApplyMarginBottomClass_When_RenderingVideoContainer', () => {
      const mockVideoUrl = 'https://www.youtube.com/watch?v=test123';
      
      const { container } = render(
        <TipHero
          videoUrl={mockVideoUrl}
          title={mockTitle}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('mb-12');
    });

    it('Should_ApplyMarginBottomClass_When_RenderingImageContainer', () => {
      const { container } = render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('mb-12');
    });

    it('Should_ApplyAspectVideoClass_When_RenderingImageContainer', () => {
      const { container } = render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const innerContainer = container.querySelector('.aspect-video');
      expect(innerContainer).toBeInTheDocument();
    });

    it('Should_ApplyRoundedCornersClass_When_RenderingImageContainer', () => {
      const { container } = render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const innerContainer = container.querySelector('.rounded-3xl');
      expect(innerContainer).toBeInTheDocument();
    });

    it('Should_ApplyShadowCardClass_When_RenderingImageContainer', () => {
      const { container } = render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const innerContainer = container.querySelector('.shadow-card');
      expect(innerContainer).toBeInTheDocument();
    });

    it('Should_ApplyOverflowHiddenClass_When_RenderingImageContainer', () => {
      const { container } = render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const innerContainer = container.querySelector('.overflow-hidden');
      expect(innerContainer).toBeInTheDocument();
    });

    it('Should_ApplyFullWidthClass_When_RenderingImageContainer', () => {
      const { container } = render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const innerContainer = container.querySelector('.w-full');
      expect(innerContainer).toBeInTheDocument();
    });

    it('Should_ApplyRelativePositioningClass_When_RenderingImageContainer', () => {
      const { container } = render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const innerContainer = container.querySelector('.relative');
      expect(innerContainer).toBeInTheDocument();
    });
  });

  describe('VideoEmbed Integration', () => {
    it('Should_PassCorrectPropsToVideoEmbed_When_VideoUrlProvided', () => {
      const mockVideoUrl = 'https://www.youtube.com/watch?v=test123';
      
      render(
        <TipHero
          videoUrl={mockVideoUrl}
          title={mockTitle}
        />
      );

      const videoEmbed = screen.getByTestId('video-embed');
      expect(videoEmbed).toHaveAttribute('data-video-url', mockVideoUrl);
      expect(videoEmbed).toHaveAttribute('data-title', mockTitle);
    });

    it('Should_HandleYouTubeShortsUrl_When_ShortsUrlProvided', () => {
      const mockVideoUrl = 'https://www.youtube.com/shorts/abc123';
      
      render(
        <TipHero
          videoUrl={mockVideoUrl}
          title={mockTitle}
        />
      );

      const videoEmbed = screen.getByTestId('video-embed');
      expect(videoEmbed).toBeInTheDocument();
      expect(videoEmbed).toHaveAttribute('data-video-url', mockVideoUrl);
    });

    it('Should_HandleInstagramUrl_When_InstagramUrlProvided', () => {
      const mockVideoUrl = 'https://www.instagram.com/p/ABC123def';
      
      render(
        <TipHero
          videoUrl={mockVideoUrl}
          title={mockTitle}
        />
      );

      const videoEmbed = screen.getByTestId('video-embed');
      expect(videoEmbed).toBeInTheDocument();
      expect(videoEmbed).toHaveAttribute('data-video-url', mockVideoUrl);
    });
  });

  describe('Edge Cases', () => {
    it('Should_HandleEmptyStringVideoUrl_When_EmptyStringProvided', () => {
      render(
        <TipHero
          videoUrl=""
          image={mockImage}
          title={mockTitle}
        />
      );

      // Empty string is falsy, so should render image instead
      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toBeInTheDocument();
    });

    it('Should_HandleEmptyStringTitle_When_EmptyTitleProvided', () => {
      render(
        <TipHero
          image={mockImage}
          title=""
        />
      );

      // When title is empty, alt text will be " - Life hack demonstration" (with leading space)
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', ' - Life hack demonstration');
    });

    it('Should_HandleImageWithAllNullFields_When_ImageHasNullFields', () => {
      const nullImage: TipImage = {
        imageUrl: null,
        imageStoragePath: null,
        originalFileName: null,
        contentType: null,
        fileSizeBytes: 0,
        uploadedAt: '2024-01-15T10:30:00Z',
      };

      render(
        <TipHero
          image={nullImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText('Life hack illustration');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/default.png');
    });
  });

  describe('Different Image URLs', () => {
    it('Should_HandleHttpsImageUrl_When_SecureUrlProvided', () => {
      render(
        <TipHero
          image={mockImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toHaveAttribute('src', mockImage.imageUrl);
    });

    it('Should_HandleRelativeImageUrl_When_RelativePathProvided', () => {
      const relativeImage: TipImage = {
        ...mockImage,
        imageUrl: '/images/tip-123.jpg',
      };

      render(
        <TipHero
          image={relativeImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toHaveAttribute('src', '/images/tip-123.jpg');
    });

    it('Should_HandleCdnImageUrl_When_CdnUrlProvided', () => {
      const cdnImage: TipImage = {
        ...mockImage,
        imageUrl: 'https://cdn.example.com/tips/garlic-tip.jpg',
      };

      render(
        <TipHero
          image={cdnImage}
          title={mockTitle}
        />
      );

      const image = screen.getByAltText(`${mockTitle} - Life hack demonstration`);
      expect(image).toHaveAttribute('src', 'https://cdn.example.com/tips/garlic-tip.jpg');
    });
  });
});
