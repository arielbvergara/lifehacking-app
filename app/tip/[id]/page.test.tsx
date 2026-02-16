import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import TipDetailPage, { generateMetadata } from './page';
import { getCachedTipById } from '@/lib/data/tip-data';
import { TipDetail } from '@/lib/types/api';

// Mock Firebase to avoid API key errors
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock auth context
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  }),
}));

// Mock Next.js navigation and server APIs
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

// Mock cached data functions
vi.mock('@/lib/data/tip-data', () => ({
  getCachedTipById: vi.fn(),
}));

// Mock components
vi.mock('@/components/layout/header', () => ({
  Header: () => (
    <header data-testid="home-header">Header</header>
  ),
}));

vi.mock('@/components/layout/home-header', () => ({
  HomeHeader: () => (
    <header data-testid="home-header">Home Header</header>
  ),
}));

vi.mock('@/components/home/home-footer', () => ({
  HomeFooter: () => <footer data-testid="home-footer">Home Footer</footer>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="home-footer">Footer</footer>,
}));

vi.mock('@/components/shared/breadcrumb', () => ({
  Breadcrumb: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav data-testid="breadcrumb">
      {items.map((item, index) => (
        <span key={index}>{item.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock('@/components/tip/tip-header', () => ({
  TipHeader: ({ title, categoryName, createdAt }: { title: string; categoryName: string; createdAt: string }) => (
    <div data-testid="tip-header">
      <h1>{title}</h1>
      <span>{categoryName}</span>
      <time>{createdAt}</time>
    </div>
  ),
}));

vi.mock('@/components/tip/tip-hero', () => ({
  TipHero: ({ videoUrl, title }: { videoUrl?: string | null; image?: unknown; title: string }) => (
    <div data-testid="tip-hero" data-video-url={videoUrl} data-title={title}>
      Tip Hero
    </div>
  ),
}));

vi.mock('@/components/tip/tip-description', () => ({
  TipDescription: ({ description }: { description: string }) => (
    <div data-testid="tip-description">{description}</div>
  ),
}));

vi.mock('@/components/tip/tip-steps', () => ({
  TipSteps: ({ steps }: { steps: Array<{ stepNumber: number; description: string }> }) => (
    <div data-testid="tip-steps">
      {steps.map((step) => (
        <div key={step.stepNumber}>Step {step.stepNumber}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/tip/related-tips', () => ({
  RelatedTips: ({ categoryId, currentTipId }: { categoryId: string; currentTipId: string }) => (
    <div data-testid="related-tips" data-category-id={categoryId} data-current-tip-id={currentTipId}>
      Related Tips
    </div>
  ),
}));

// Mock SEO utilities
vi.mock('@/lib/seo/structured-data', () => ({
  generateHowToStructuredData: vi.fn((tip) => {
    if (!tip) return {};
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: tip.title,
      description: tip.description,
    };
  }),
}));

vi.mock('@/lib/utils/text', () => ({
  truncateForBreadcrumb: vi.fn((text) => text.length > 30 ? text.slice(0, 27) + '...' : text),
}));

describe('TipDetailPage', () => {
  const mockTip: TipDetail = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'How to Peel Garlic in 10 Seconds',
    description: 'Learn this amazing trick to peel garlic quickly and easily without any mess.',
    steps: [
      { stepNumber: 1, description: 'Place garlic cloves in a jar' },
      { stepNumber: 2, description: 'Shake vigorously for 10 seconds' },
      { stepNumber: 3, description: 'Remove peeled garlic' },
    ],
    categoryId: 'cat-123',
    categoryName: 'Kitchen',
    tags: ['cooking', 'kitchen', 'garlic'],
    videoUrl: 'https://www.youtube.com/watch?v=abc123',
    videoUrlId: 'abc123',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    image: {
      imageUrl: 'https://example.com/garlic-tip.jpg',
      imageStoragePath: '/tips/garlic-tip.jpg',
      originalFileName: 'garlic.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 102400,
      uploadedAt: '2024-01-15T10:30:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('Should_FetchTipData_When_PageLoads', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      await TipDetailPage({ params: { id: mockTip.id } });

      expect(getCachedTipById).toHaveBeenCalledWith(mockTip.id);
    });

    it('Should_CallNotFound_When_TipFetchFails', async () => {
      vi.mocked(getCachedTipById).mockRejectedValue(new Error('Tip not found'));

      // notFound() should be called, which throws in Next.js but we need to catch it in tests
      try {
        await TipDetailPage({ params: { id: 'invalid-id' } });
      } catch {
        // Expected to throw or call notFound
      }

      expect(notFound).toHaveBeenCalled();
    });

    it('Should_CallNotFound_When_TipDoesNotExist', async () => {
      vi.mocked(getCachedTipById).mockRejectedValue(new Error('404'));

      // notFound() should be called, which throws in Next.js but we need to catch it in tests
      try {
        await TipDetailPage({ params: { id: 'nonexistent-id' } });
      } catch {
        // Expected to throw or call notFound
      }

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('Page Rendering', () => {
    it('Should_RenderAllPageSections_When_TipDataLoaded', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      render(page);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
      expect(screen.getByTestId('tip-header')).toBeInTheDocument();
      expect(screen.getByTestId('tip-hero')).toBeInTheDocument();
      expect(screen.getByTestId('tip-description')).toBeInTheDocument();
      expect(screen.getByTestId('tip-steps')).toBeInTheDocument();
      expect(screen.getByTestId('related-tips')).toBeInTheDocument();
      expect(screen.getByTestId('home-footer')).toBeInTheDocument();
    });

    it('Should_RenderTipTitle_When_TipDataLoaded', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      render(page);

      expect(screen.getByText(mockTip.title)).toBeInTheDocument();
    });

    it('Should_RenderTipDescription_When_TipDataLoaded', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      render(page);

      expect(screen.getByText(mockTip.description)).toBeInTheDocument();
    });

    it('Should_RenderAllSteps_When_TipDataLoaded', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      render(page);

      mockTip.steps.forEach((step) => {
        expect(screen.getByText(`Step ${step.stepNumber}`)).toBeInTheDocument();
      });
    });

    it('Should_RenderCategoryName_When_TipDataLoaded', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      render(page);

      // Category name appears in multiple places (breadcrumb, tip header, related tips)
      const categoryElements = screen.getAllByText(mockTip.categoryName);
      expect(categoryElements.length).toBeGreaterThan(0);
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('Should_RenderBreadcrumbWithCorrectItems_When_PageLoads', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      render(page);

      const breadcrumb = screen.getByTestId('breadcrumb');
      expect(breadcrumb).toHaveTextContent('Home');
      expect(breadcrumb).toHaveTextContent(mockTip.categoryName);
      // Breadcrumb shows truncated title (mocked to return same text if <= 30 chars)
      const truncatedTitle = mockTip.title.length > 30 ? mockTip.title.slice(0, 27) + '...' : mockTip.title;
      expect(breadcrumb).toHaveTextContent(truncatedTitle);
    });
  });

  describe('Structured Data', () => {
    it('Should_IncludeStructuredDataScript_When_PageRenders', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
    });

    it('Should_IncludeCorrectStructuredData_When_PageRenders', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      const structuredData = JSON.parse(script?.textContent || '{}');
      
      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('HowTo');
      expect(structuredData.name).toBe(mockTip.title);
      expect(structuredData.description).toBe(mockTip.description);
    });
  });

  describe('Related Tips Integration', () => {
    it('Should_PassCorrectPropsToRelatedTips_When_PageRenders', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      render(page);

      const relatedTips = screen.getByTestId('related-tips');
      expect(relatedTips).toHaveAttribute('data-category-id', mockTip.categoryId);
      expect(relatedTips).toHaveAttribute('data-current-tip-id', mockTip.id);
    });
  });

  describe('Semantic HTML', () => {
    it('Should_WrapTipContentInArticleTag_When_PageRenders', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      const { container } = render(page);

      const article = container.querySelector('article');
      expect(article).toBeInTheDocument();
    });

    it('Should_WrapPageContentInMainTag_When_PageRenders', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const page = await TipDetailPage({ params: { id: mockTip.id } });
      const { container } = render(page);

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });
});

describe('generateMetadata', () => {
  const mockTip: TipDetail = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'How to Peel Garlic in 10 Seconds',
    description: 'Learn this amazing trick to peel garlic quickly and easily without any mess. This description is long enough to test truncation at 160 characters which is the standard meta description length.',
    steps: [
      { stepNumber: 1, description: 'Place garlic cloves in a jar' },
    ],
    categoryId: 'cat-123',
    categoryName: 'Kitchen',
    tags: ['cooking', 'kitchen', 'garlic'],
    videoUrl: null,
    videoUrlId: null,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    image: {
      imageUrl: 'https://example.com/garlic-tip.jpg',
      imageStoragePath: '/tips/garlic-tip.jpg',
      originalFileName: 'garlic.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 102400,
      uploadedAt: '2024-01-15T10:30:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Title Generation', () => {
    it('Should_GenerateCorrectTitle_When_TipDataProvided', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.title).toBe(`${mockTip.title} - LifeHackBuddy`);
    });
  });

  describe('Description Generation', () => {
    it('Should_TruncateDescriptionTo160Characters_When_DescriptionIsLong', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.description).toBe(mockTip.description.slice(0, 160));
      expect(metadata.description?.length).toBeLessThanOrEqual(160);
    });

    it('Should_KeepFullDescription_When_DescriptionIsShort', async () => {
      const shortDescriptionTip = {
        ...mockTip,
        description: 'Short description',
      };
      vi.mocked(getCachedTipById).mockResolvedValue(shortDescriptionTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.description).toBe('Short description');
    });
  });

  describe('Keywords Generation', () => {
    it('Should_IncludeCategoryAndTags_When_GeneratingKeywords', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.keywords).toContain(mockTip.categoryName);
      mockTip.tags.forEach((tag) => {
        expect(metadata.keywords).toContain(tag);
      });
      expect(metadata.keywords).toContain('life hack');
      expect(metadata.keywords).toContain('tip');
    });
  });

  describe('Canonical URL', () => {
    it('Should_GenerateCanonicalUrl_When_MetadataGenerated', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.alternates?.canonical).toBe(`https://lifehackbuddy.com/tip/${mockTip.id}`);
    });
  });

  describe('Open Graph Tags', () => {
    it('Should_GenerateOpenGraphTags_When_MetadataGenerated', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.openGraph?.title).toBe(mockTip.title);
      expect(metadata.openGraph?.description).toBe(mockTip.description.slice(0, 160));
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.url).toBe(`https://lifehackbuddy.com/tip/${mockTip.id}`);
    });

    it('Should_IncludeImageInOpenGraph_When_TipHasImage', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.openGraph?.images).toHaveLength(1);
      expect(metadata.openGraph?.images?.[0]).toMatchObject({
        url: mockTip.image?.imageUrl,
        width: 1200,
        height: 630,
        alt: mockTip.title,
      });
    });

    it('Should_UseDefaultImage_When_TipHasNoImage', async () => {
      const tipWithoutImage = { ...mockTip, image: null };
      vi.mocked(getCachedTipById).mockResolvedValue(tipWithoutImage);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.openGraph?.images?.[0].url).toBe('/default.png');
    });

    it('Should_IncludePublishedTime_When_TipHasCreatedAt', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.openGraph?.publishedTime).toBe(mockTip.createdAt);
    });

    it('Should_IncludeModifiedTime_When_TipHasUpdatedAt', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.openGraph?.modifiedTime).toBe(mockTip.updatedAt);
    });

    it('Should_UseCreatedAtForModifiedTime_When_NoUpdatedAt', async () => {
      const tipWithoutUpdatedAt = { ...mockTip, updatedAt: null };
      vi.mocked(getCachedTipById).mockResolvedValue(tipWithoutUpdatedAt);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.openGraph?.modifiedTime).toBe(mockTip.createdAt);
    });
  });

  describe('Twitter Card Tags', () => {
    it('Should_GenerateTwitterCardTags_When_MetadataGenerated', async () => {
      vi.mocked(getCachedTipById).mockResolvedValue(mockTip);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe(mockTip.title);
      expect(metadata.twitter?.description).toBe(mockTip.description.slice(0, 160));
      expect(metadata.twitter?.images).toContain(mockTip.image?.imageUrl);
    });

    it('Should_UseDefaultImageInTwitterCard_When_TipHasNoImage', async () => {
      const tipWithoutImage = { ...mockTip, image: null };
      vi.mocked(getCachedTipById).mockResolvedValue(tipWithoutImage);

      const metadata = await generateMetadata({ params: { id: mockTip.id } });

      expect(metadata.twitter?.images).toContain('/default.png');
    });
  });

  describe('Error Handling', () => {
    it('Should_ReturnFallbackMetadata_When_FetchFails', async () => {
      vi.mocked(getCachedTipById).mockRejectedValue(new Error('Tip not found'));

      const metadata = await generateMetadata({ params: { id: 'invalid-id' } });

      expect(metadata.title).toBe('Tip Not Found - LifeHackBuddy');
      expect(metadata.description).toBe('The tip you are looking for could not be found.');
    });
  });
});
