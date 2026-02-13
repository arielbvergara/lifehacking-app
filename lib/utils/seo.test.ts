import { describe, it, expect } from 'vitest';
import {
  generateTipImageAlt,
  generateCategoryImageAlt,
  generateTipMetaDescription,
  generateCategoryMetaDescription,
  generatePageTitle,
} from './seo';
import { TipSummary, Category } from '@/lib/types/api';

describe('seo', () => {
  const mockTip: TipSummary = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Quick Kitchen Cleaning Hack',
    description: 'Learn how to clean your kitchen quickly and efficiently',
    categoryId: '123e4567-e89b-12d3-a456-426614174001',
    categoryName: 'Kitchen',
    tags: ['cleaning', 'quick'],
    videoUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockCategory: Category = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Kitchen',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  };

  describe('generateTipImageAlt', () => {
    it('generateTipImageAlt_ShouldReturnDescriptiveAltText_WhenCalledWithTip', () => {
      const result = generateTipImageAlt(mockTip);

      expect(result).toBe('Quick Kitchen Cleaning Hack - Kitchen life hack with step-by-step guide');
    });
  });

  describe('generateCategoryImageAlt', () => {
    it('generateCategoryImageAlt_ShouldReturnDescriptiveAltText_WhenCalledWithCategory', () => {
      const result = generateCategoryImageAlt(mockCategory);

      expect(result).toBe('Kitchen category - Browse life hacks and tips');
    });
  });

  describe('generateTipMetaDescription', () => {
    it('generateTipMetaDescription_ShouldReturnFullDescription_WhenDescriptionIsShort', () => {
      const result = generateTipMetaDescription(mockTip);

      expect(result).toBe(mockTip.description);
    });

    it('generateTipMetaDescription_ShouldTruncateAtWordBoundary_WhenDescriptionIsLong', () => {
      const longTip: TipSummary = {
        ...mockTip,
        description: 'This is a very long description that exceeds the maximum length and should be truncated at a word boundary to ensure it looks good in search results and does not cut off in the middle of a word',
      };

      const result = generateTipMetaDescription(longTip, 100);

      expect(result.length).toBeLessThanOrEqual(100);
      expect(result).toMatch(/\.\.\.$/);
      expect(result).not.toMatch(/\s\.\.\.$/); // Should not end with space before ellipsis
    });

    it('generateTipMetaDescription_ShouldUseCustomMaxLength_WhenProvided', () => {
      const result = generateTipMetaDescription(mockTip, 30);

      expect(result.length).toBeLessThanOrEqual(30);
    });
  });

  describe('generateCategoryMetaDescription', () => {
    it('generateCategoryMetaDescription_ShouldReturnDescriptiveText_WhenCalledWithCategoryAndCount', () => {
      const result = generateCategoryMetaDescription('Kitchen', 42);

      expect(result).toBe('Discover 42 practical kitchen life hacks and tips. Simple tricks to make your daily life easier.');
    });

    it('generateCategoryMetaDescription_ShouldHandleSingularCount_WhenCountIsOne', () => {
      const result = generateCategoryMetaDescription('Wellness', 1);

      expect(result).toContain('1 practical wellness');
    });
  });

  describe('generatePageTitle', () => {
    it('generatePageTitle_ShouldIncludeSiteName_WhenIncludeSiteNameIsTrue', () => {
      const result = generatePageTitle('Home Page', true);

      expect(result).toBe('Home Page | LifeHackBuddy');
    });

    it('generatePageTitle_ShouldExcludeSiteName_WhenIncludeSiteNameIsFalse', () => {
      const result = generatePageTitle('Home Page', false);

      expect(result).toBe('Home Page');
    });

    it('generatePageTitle_ShouldIncludeSiteNameByDefault_WhenIncludeSiteNameIsNotProvided', () => {
      const result = generatePageTitle('Home Page');

      expect(result).toBe('Home Page | LifeHackBuddy');
    });
  });
});
