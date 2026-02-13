import { describe, it, expect } from 'vitest';
import {
  generateWebsiteStructuredData,
  generateTipStructuredData,
} from './structured-data';
import { TipSummary } from '@/lib/types/api';

describe('structured-data', () => {
  describe('generateWebsiteStructuredData', () => {
    it('generateWebsiteStructuredData_ShouldReturnValidSchema_WhenCalledWithDefaultUrl', () => {
      const result = generateWebsiteStructuredData();

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'LifeHackBuddy',
        url: 'https://lifehackbuddy.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://lifehackbuddy.com/search?q={search_term_string}',
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
});
