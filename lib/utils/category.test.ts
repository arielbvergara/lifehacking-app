import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { getCategoryIcon, getAllCategoryIcons, formatTipCount } from './category';

describe('getCategoryIcon', () => {
  it('should return correct icon for Kitchen category', () => {
    const result = getCategoryIcon('Kitchen');
    expect(result).toBe('🍳');
  });

  it('should return correct icon for Cleaning category', () => {
    const result = getCategoryIcon('Cleaning');
    expect(result).toBe('🧹');
  });

  it('should return correct icon for Tech Help category', () => {
    const result = getCategoryIcon('Tech Help');
    expect(result).toBe('💻');
  });

  it('should return correct icon for DIY Repair category', () => {
    const result = getCategoryIcon('DIY Repair');
    expect(result).toBe('🔧');
  });

  it('should return correct icon for Wellness category', () => {
    const result = getCategoryIcon('Wellness');
    expect(result).toBe('🧘');
  });

  it('should return default icon for unknown category', () => {
    const result = getCategoryIcon('Unknown Category');
    expect(result).toBe('📌');
  });

  it('should return default icon for empty string', () => {
    const result = getCategoryIcon('');
    expect(result).toBe('📌');
  });

  it('should be case-sensitive', () => {
    const result = getCategoryIcon('kitchen'); // lowercase
    expect(result).toBe('📌'); // Should return default, not Kitchen icon
  });

  it('should handle categories with special characters', () => {
    const result = getCategoryIcon('Category@#$');
    expect(result).toBe('📌');
  });
});

describe('getAllCategoryIcons', () => {
  it('should return an object with category mappings', () => {
    const icons = getAllCategoryIcons();
    expect(typeof icons).toBe('object');
    expect(icons['Kitchen']).toBe('🍳');
    expect(icons['Cleaning']).toBe('🧹');
  });

  it('should include all expected categories', () => {
    const icons = getAllCategoryIcons();
    const expectedCategories = [
      'Kitchen',
      'Cleaning',
      'Tech Help',
      'DIY Repair',
      'Wellness',
      'Automotive',
      'Fashion',
    ];

    expectedCategories.forEach(category => {
      expect(icons[category]).toBeDefined();
      expect(typeof icons[category]).toBe('string');
    });
  });
});

/**
 * Property-Based Tests
 * Feature: home-page-implementation
 */
describe('getCategoryIcon - Property-Based Tests', () => {
  /**
   * Property 4: Icon Mapping Consistency
   * **Validates: Requirements 3.5**
   * 
   * For any category name, the displayed icon should be deterministic
   * and consistent across multiple renders of the same category.
   */
  test.prop([
    fc.string({ minLength: 1, maxLength: 100 })
  ], { numRuns: 100 })(
    'Property_4_IconMapping_ShouldBeDeterministic_ForAnyCategoryName',
    (categoryName) => {
      // Act: Call the function multiple times with the same input
      const result1 = getCategoryIcon(categoryName);
      const result2 = getCategoryIcon(categoryName);
      const result3 = getCategoryIcon(categoryName);

      // Assert: Results should be identical
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    }
  );

  test.prop([
    fc.constantFrom(
      'Kitchen',
      'Cleaning',
      'Tech Help',
      'DIY Repair',
      'Wellness',
      'Automotive',
      'Fashion',
      'Gardening',
      'Finance',
      'Organization'
    )
  ], { numRuns: 50 })(
    'Property_4_IconMapping_ShouldReturnKnownIcon_ForKnownCategories',
    (categoryName) => {
      // Act
      const result = getCategoryIcon(categoryName);

      // Assert: Should return a non-default icon
      expect(result).not.toBe('📌');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  );

  test.prop([
    fc.string({ minLength: 1, maxLength: 100 })
  ], { numRuns: 100 })(
    'Property_4_IconMapping_ShouldAlwaysReturnString_ForAnyInput',
    (categoryName) => {
      // Act
      const result = getCategoryIcon(categoryName);

      // Assert: Should always return a string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  );

  test.prop([
    fc.string({ minLength: 1, maxLength: 100 })
  ], { numRuns: 100 })(
    'Property_4_IconMapping_ShouldReturnEitherKnownOrDefaultIcon_ForAnyInput',
    (categoryName) => {
      // Arrange
      const allIcons = getAllCategoryIcons();
      const knownIcons = Object.values(allIcons);
      const defaultIcon = '📌';

      // Act
      const result = getCategoryIcon(categoryName);

      // Assert: Result should be either a known icon or the default
      const isKnownIcon = knownIcons.includes(result);
      const isDefaultIcon = result === defaultIcon;
      expect(isKnownIcon || isDefaultIcon).toBe(true);
    }
  );

  test.prop([
    fc.constantFrom(
      'Kitchen',
      'Cleaning',
      'Tech Help',
      'DIY Repair',
      'Wellness'
    )
  ], { numRuns: 50 })(
    'Property_4_IconMapping_ShouldMatchExpectedIcon_ForKnownCategories',
    (categoryName) => {
      // Arrange
      const expectedIcons: Record<string, string> = {
        'Kitchen': '🍳',
        'Cleaning': '🧹',
        'Tech Help': '💻',
        'DIY Repair': '🔧',
        'Wellness': '🧘',
      };

      // Act
      const result = getCategoryIcon(categoryName);

      // Assert
      expect(result).toBe(expectedIcons[categoryName]);
    }
  );

  test.prop([
    fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
      // Filter out known category names
      const knownCategories = Object.keys(getAllCategoryIcons());
      return !knownCategories.includes(s);
    })
  ], { numRuns: 100 })(
    'Property_4_IconMapping_ShouldReturnDefaultIcon_ForUnknownCategories',
    (unknownCategory) => {
      // Act
      const result = getCategoryIcon(unknownCategory);

      // Assert: Should return default icon
      expect(result).toBe('📌');
    }
  );
});

describe('formatTipCount', () => {
  it('should format zero tips correctly', () => {
    const result = formatTipCount(0);
    expect(result).toBe('0 tips');
  });

  it('should format one tip correctly', () => {
    const result = formatTipCount(1);
    expect(result).toBe('1 tips');
  });

  it('should format multiple tips correctly', () => {
    const result = formatTipCount(42);
    expect(result).toBe('42 tips');
  });

  it('should format large numbers correctly', () => {
    const result = formatTipCount(1000);
    expect(result).toBe('1000 tips');
  });

  it('should handle very large numbers', () => {
    const result = formatTipCount(999999);
    expect(result).toBe('999999 tips');
  });
});

/**
 * Property-Based Tests for formatTipCount
 * Feature: home-page-implementation
 */
describe('formatTipCount - Property-Based Tests', () => {
  /**
   * Property 5: Tip Count Formatting
   * **Validates: Requirements 3.7**
   * 
   * For any non-negative integer tip count, the displayed format
   * should be "{count} tips" where {count} is the integer value.
   */
  test.prop([
    fc.integer({ min: 0, max: 1000000 })
  ], { numRuns: 100 })(
    'Property_5_TipCountFormatting_ShouldMatchExpectedFormat_ForAnyNonNegativeInteger',
    (count) => {
      // Act
      const result = formatTipCount(count);

      // Assert: Should match the format "{count} tips"
      expect(result).toBe(`${count} tips`);
      expect(result.endsWith(' tips')).toBe(true);
      expect(result.startsWith(count.toString())).toBe(true);
    }
  );

  test.prop([
    fc.integer({ min: 0, max: 1000000 })
  ], { numRuns: 100 })(
    'Property_5_TipCountFormatting_ShouldBeDeterministic_ForSameCount',
    (count) => {
      // Act: Call multiple times with the same input
      const result1 = formatTipCount(count);
      const result2 = formatTipCount(count);
      const result3 = formatTipCount(count);

      // Assert: Results should be identical
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    }
  );

  test.prop([
    fc.integer({ min: 0, max: 1000000 })
  ], { numRuns: 100 })(
    'Property_5_TipCountFormatting_ShouldAlwaysIncludeTipsWord_ForAnyCount',
    (count) => {
      // Act
      const result = formatTipCount(count);

      // Assert: Should always contain the word "tips"
      expect(result).toContain('tips');
      expect(result.split(' ').length).toBe(2);
      expect(result.split(' ')[1]).toBe('tips');
    }
  );

  test.prop([
    fc.integer({ min: 0, max: 1000000 })
  ], { numRuns: 100 })(
    'Property_5_TipCountFormatting_ShouldPreserveNumericValue_ForAnyCount',
    (count) => {
      // Act
      const result = formatTipCount(count);

      // Assert: The numeric part should match the input
      const numericPart = result.split(' ')[0];
      expect(parseInt(numericPart, 10)).toBe(count);
    }
  );

  test.prop([
    fc.integer({ min: 0, max: 1000000 })
  ], { numRuns: 100 })(
    'Property_5_TipCountFormatting_ShouldAlwaysReturnString_ForAnyCount',
    (count) => {
      // Act
      const result = formatTipCount(count);

      // Assert: Should always return a string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  );

  test.prop([
    fc.constantFrom(0, 1, 2, 10, 100, 1000)
  ], { numRuns: 30 })(
    'Property_5_TipCountFormatting_ShouldHandleCommonCounts_Correctly',
    (count) => {
      // Act
      const result = formatTipCount(count);

      // Assert
      expect(result).toBe(`${count} tips`);
    }
  );
});
