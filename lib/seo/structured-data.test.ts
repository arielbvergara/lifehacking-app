import { describe, it, expect } from 'vitest';
import {
  generateWebsiteStructuredData,
  generateTipStructuredData,
  generateHowToStructuredData,
  generateBreadcrumbStructuredData,
  safeJsonLdStringify,
} from './structured-data';
import { TipSummary, TipDetail } from '@/lib/types/api';
import { SITE_URL } from '@/lib/config/site';

describe('structured-data', () => {
  describe('generateWebsiteStructuredData', () => {
    it('generateWebsiteStructuredData_ShouldReturnValidSchema_WhenCalledWithDefaultUrl', () => {
      const result = generateWebsiteStructuredData();

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'LifeHackBuddy',
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      });
    });

    it('generateWebsiteStructuredData_ShouldReturnValidSchema_WhenCalledWithCustomUrl', () => {
      const customUrl = 'https://custom.example.com';
      const result = generateWebsiteStructuredData(customUrl);

      expect(result.url).toBe(customUrl);
      expect(result.potentialAction?.target).toBe(`${customUrl}/search?q={search_term_string}`);
    });
  });

  describe('generateTipStructuredData', () => {
    const mockTip: TipSummary = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Tip Title',
      description: 'Test tip description',
      categoryId: '123e4567-e89b-12d3-a456-426614174001',
      categoryName: 'Kitchen',
      tags: ['cooking', 'quick'],
      videoUrl: 'https://example.com/video',
      createdAt: '2024-01-01T00:00:00Z',
      image: {
        imageUrl: 'https://example.com/image.jpg',
        imageStoragePath: '/storage/image.jpg',
        originalFileName: 'image.jpg',
        contentType: 'image/jpeg',
        fileSizeBytes: 1024,
        uploadedAt: '2024-01-01T00:00:00Z',
      },
    };

    it('generateTipStructuredData_ShouldReturnValidArticleSchema_WhenCalledWithTip', () => {
      const result = generateTipStructuredData(mockTip);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: mockTip.title,
        description: mockTip.description,
        image: mockTip.image?.imageUrl,
        datePublished: mockTip.createdAt,
        author: {
          '@type': 'Organization',
          name: 'LifeHackBuddy',
        },
      });
    });

    it('generateTipStructuredData_ShouldHandleMissingImage_WhenTipHasNoImage', () => {
      const tipWithoutImage: TipSummary = {
        ...mockTip,
        image: undefined,
      };

      const result = generateTipStructuredData(tipWithoutImage);

      expect(result.image).toBeUndefined();
      expect(result.headline).toBe(mockTip.title);
    });
  });

  describe('generateHowToStructuredData', () => {
    const mockTipDetail: TipDetail = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'How to Peel Garlic in 10 Seconds',
      description: 'Learn the fastest way to peel garlic using a simple kitchen hack.',
      categoryId: '123e4567-e89b-12d3-a456-426614174001',
      categoryName: 'Kitchen',
      tags: ['cooking', 'quick', 'garlic'],
      videoUrl: 'https://www.youtube.com/watch?v=abc123',
      videoUrlId: 'abc123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      image: {
        imageUrl: 'https://example.com/garlic.jpg',
        imageStoragePath: '/storage/garlic.jpg',
        originalFileName: 'garlic.jpg',
        contentType: 'image/jpeg',
        fileSizeBytes: 2048,
        uploadedAt: '2024-01-01T00:00:00Z',
      },
      steps: [
        {
          stepNumber: 1,
          description: 'Place garlic cloves in a jar',
        },
        {
          stepNumber: 2,
          description: 'Close the lid tightly',
        },
        {
          stepNumber: 3,
          description: 'Shake vigorously for 10 seconds',
        },
      ],
    };

    it('generateHowToStructuredData_ShouldReturnValidHowToSchema_WhenCalledWithCompleteTip', () => {
      const result = generateHowToStructuredData(mockTipDetail);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('HowTo');
      expect(result.name).toBe(mockTipDetail.title);
      expect(result.description).toBe(mockTipDetail.description);
      expect(result.image).toBe(mockTipDetail.image?.imageUrl);
    });

    it('generateHowToStructuredData_ShouldMapStepsCorrectly_WhenTipHasMultipleSteps', () => {
      const result = generateHowToStructuredData(mockTipDetail);

      expect(result.step).toHaveLength(3);
      expect(result.step[0]).toEqual({
        '@type': 'HowToStep',
        position: 1,
        name: 'Step 1',
        text: 'Place garlic cloves in a jar',
      });
      expect(result.step[1]).toEqual({
        '@type': 'HowToStep',
        position: 2,
        name: 'Step 2',
        text: 'Close the lid tightly',
      });
      expect(result.step[2]).toEqual({
        '@type': 'HowToStep',
        position: 3,
        name: 'Step 3',
        text: 'Shake vigorously for 10 seconds',
      });
    });

    it('generateHowToStructuredData_ShouldIncludeVideoObject_WhenVideoUrlAndImageArePresent', () => {
      const result = generateHowToStructuredData(mockTipDetail);

      expect(result.video).toBeDefined();
      expect(result.video).toEqual({
        '@type': 'VideoObject',
        name: mockTipDetail.title,
        description: mockTipDetail.description,
        thumbnailUrl: mockTipDetail.image?.imageUrl,
        contentUrl: mockTipDetail.videoUrl,
        uploadDate: mockTipDetail.createdAt,
      });
    });

    it('generateHowToStructuredData_ShouldNotIncludeVideoObject_WhenVideoUrlIsMissing', () => {
      const tipWithoutVideo: TipDetail = {
        ...mockTipDetail,
        videoUrl: null,
        videoUrlId: null,
      };

      const result = generateHowToStructuredData(tipWithoutVideo);

      expect(result.video).toBeUndefined();
      expect(result.name).toBe(mockTipDetail.title);
      expect(result.step).toHaveLength(3);
    });

    it('generateHowToStructuredData_ShouldNotIncludeVideoObject_WhenImageIsMissing', () => {
      const tipWithoutImage: TipDetail = {
        ...mockTipDetail,
        image: undefined,
      };

      const result = generateHowToStructuredData(tipWithoutImage);

      expect(result.video).toBeUndefined();
      expect(result.image).toBeUndefined();
      expect(result.name).toBe(mockTipDetail.title);
    });

    it('generateHowToStructuredData_ShouldHandleEmptySteps_WhenTipHasNoSteps', () => {
      const tipWithoutSteps: TipDetail = {
        ...mockTipDetail,
        steps: [],
      };

      const result = generateHowToStructuredData(tipWithoutSteps);

      expect(result.step).toHaveLength(0);
      expect(result.step).toEqual([]);
    });

    it('generateHowToStructuredData_ShouldHandleSingleStep_WhenTipHasOneStep', () => {
      const tipWithOneStep: TipDetail = {
        ...mockTipDetail,
        steps: [
          {
            stepNumber: 1,
            description: 'Just do this one thing',
          },
        ],
      };

      const result = generateHowToStructuredData(tipWithOneStep);

      expect(result.step).toHaveLength(1);
      expect(result.step[0]).toEqual({
        '@type': 'HowToStep',
        position: 1,
        name: 'Step 1',
        text: 'Just do this one thing',
      });
    });

    it('generateHowToStructuredData_ShouldUseUndefinedForImage_WhenImageUrlIsNull', () => {
      const tipWithNullImageUrl: TipDetail = {
        ...mockTipDetail,
        image: {
          imageUrl: null,
          imageStoragePath: '/storage/garlic.jpg',
          originalFileName: 'garlic.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 2048,
          uploadedAt: '2024-01-01T00:00:00Z',
        },
      };

      const result = generateHowToStructuredData(tipWithNullImageUrl);

      expect(result.image).toBeUndefined();
    });
  });

  describe('generateBreadcrumbStructuredData', () => {
    it('generateBreadcrumbStructuredData_ShouldReturnValidSchema_WhenCalledWithItems', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Categories', href: '/categories' },
        { label: 'Kitchen' },
      ];

      const result = generateBreadcrumbStructuredData(items);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
      expect(result.itemListElement).toHaveLength(3);
    });

    it('generateBreadcrumbStructuredData_ShouldAssignCorrectPositions_WhenCalledWithItems', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Categories', href: '/categories' },
        { label: 'Kitchen' },
      ];

      const result = generateBreadcrumbStructuredData(items);

      expect(result.itemListElement[0].position).toBe(1);
      expect(result.itemListElement[1].position).toBe(2);
      expect(result.itemListElement[2].position).toBe(3);
    });

    it('generateBreadcrumbStructuredData_ShouldBuildAbsoluteItemUrls_WhenHrefIsRelative', () => {
      const items = [{ label: 'Home', href: '/' }];

      const result = generateBreadcrumbStructuredData(items);

      expect(result.itemListElement[0].item).toBe(`${SITE_URL}/`);
    });

    it('generateBreadcrumbStructuredData_ShouldPreserveAbsoluteItemUrls_WhenHrefIsAbsolute', () => {
      const items = [{ label: 'Home', href: 'https://example.com/' }];

      const result = generateBreadcrumbStructuredData(items);

      expect(result.itemListElement[0].item).toBe('https://example.com/');
    });

    it('generateBreadcrumbStructuredData_ShouldOmitItemProperty_WhenHrefIsNotProvided', () => {
      const items = [{ label: 'Current Page' }];

      const result = generateBreadcrumbStructuredData(items);

      expect(result.itemListElement[0].item).toBeUndefined();
      expect(result.itemListElement[0].name).toBe('Current Page');
    });

    it('generateBreadcrumbStructuredData_ShouldUseCustomBaseUrl_WhenProvided', () => {
      const items = [{ label: 'Home', href: '/' }];
      const customBase = 'https://custom.example.com';

      const result = generateBreadcrumbStructuredData(items, customBase);

      expect(result.itemListElement[0].item).toBe(`${customBase}/`);
    });

    it('generateBreadcrumbStructuredData_ShouldHandleEmptyItems_WhenCalledWithEmptyArray', () => {
      const result = generateBreadcrumbStructuredData([]);

      expect(result.itemListElement).toHaveLength(0);
    });
  });

  describe('safeJsonLdStringify', () => {
    it('safeJsonLdStringify_ShouldEscapeScriptTags_WhenInputContainsCloseScript', () => {
      const data = { title: '</script><script>alert("xss")</script>' };
      const result = safeJsonLdStringify(data);
      expect(result).not.toContain('</script>');
      expect(result).not.toContain('</');
      expect(result).toContain('\\u003c');
    });

    it('safeJsonLdStringify_ShouldReturnValidJSON_WhenParsedBack', () => {
      const data = { title: 'Test </script> injection', nested: { value: '<b>html</b>' } };
      const result = safeJsonLdStringify(data);
      const parsed = JSON.parse(result);
      expect(parsed.title).toBe('Test </script> injection');
      expect(parsed.nested.value).toBe('<b>html</b>');
    });

    it('safeJsonLdStringify_ShouldHandleSafeData_WhenNoScriptTags', () => {
      const data = { '@type': 'Article', headline: 'Normal Title' };
      const result = safeJsonLdStringify(data);
      expect(result).toContain('"Normal Title"');
    });
  });
});
