import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { truncateText, truncateForBreadcrumb } from './text';

describe('truncateText', () => {
  it('should return the original text if it is shorter than maxLength', () => {
    const text = 'Hello world';
    const result = truncateText(text, 20);
    expect(result).toBe('Hello world');
  });

  it('should return the original text if it equals maxLength', () => {
    const text = 'Hello';
    const result = truncateText(text, 5);
    expect(result).toBe('Hello');
  });

  it('should truncate text and add ellipsis if it exceeds maxLength', () => {
    const text = 'This is a very long text that needs to be truncated';
    const result = truncateText(text, 20);
    expect(result).toBe('This is a very long ...');
    expect(result.length).toBe(23); // 20 + 3 for ellipsis
  });

  it('should handle empty strings', () => {
    const result = truncateText('', 10);
    expect(result).toBe('');
  });

  it('should handle single character strings', () => {
    const result = truncateText('A', 10);
    expect(result).toBe('A');
  });

  it('should truncate single character if maxLength is 0', () => {
    const result = truncateText('A', 0);
    expect(result).toBe('...');
  });

  it('should use default maxLength of 100 when not specified', () => {
    const text = 'a'.repeat(150);
    const result = truncateText(text);
    expect(result.length).toBe(103); // 100 + 3 for ellipsis
    expect(result.endsWith('...')).toBe(true);
  });

  it('should not add ellipsis if text length equals default maxLength', () => {
    const text = 'a'.repeat(100);
    const result = truncateText(text);
    expect(result).toBe(text);
    expect(result.length).toBe(100);
  });

  it('should handle text with special characters', () => {
    const text = 'Hello! @#$%^&*() 世界 🌍';
    const result = truncateText(text, 10);
    expect(result).toBe('Hello! @#$...');
  });

  it('should handle text with newlines and spaces', () => {
    const text = 'Line 1\nLine 2\nLine 3 with more content';
    const result = truncateText(text, 15);
    expect(result).toBe('Line 1\nLine 2\nL...');
  });

  it('should preserve the exact maxLength characters before adding ellipsis', () => {
    const text = '0123456789ABCDEF';
    const result = truncateText(text, 10);
    expect(result).toBe('0123456789...');
    expect(result.substring(0, 10)).toBe('0123456789');
  });
});

/**
 * Property-Based Tests
 * Feature: home-page-implementation
 */
describe('truncateText - Property-Based Tests', () => {
  /**
   * Property 8: Text Truncation Consistency
   * **Validates: Requirements 4.6, 5.7**
   * 
   * For any text string that exceeds the maximum display length,
   * the truncated text should end with an ellipsis ("...") and
   * the total length should not exceed the maximum length plus 3 characters.
   */
  test.prop([
    fc.string({ minLength: 1, maxLength: 500 }),
    fc.integer({ min: 0, max: 200 })
  ], { numRuns: 100 })(
    'Property_8_TextTruncation_ShouldEndWithEllipsis_WhenTextExceedsMaxLength',
    (text, maxLength) => {
      // Act
      const result = truncateText(text, maxLength);

      // Assert
      if (text.length > maxLength) {
        // Should end with ellipsis
        expect(result.endsWith('...')).toBe(true);
        // Total length should be maxLength + 3
        expect(result.length).toBe(maxLength + 3);
        // Should preserve the first maxLength characters
        expect(result.substring(0, maxLength)).toBe(text.substring(0, maxLength));
      } else {
        // Should return original text unchanged
        expect(result).toBe(text);
      }
    }
  );

  test.prop([
    fc.string({ minLength: 1, maxLength: 500 })
  ], { numRuns: 100 })(
    'Property_8_TextTruncation_ShouldPreserveOriginal_WhenTextIsShorterThanMaxLength',
    (text) => {
      // Arrange: Use a maxLength that's always longer than the text
      const maxLength = text.length + 10;

      // Act
      const result = truncateText(text, maxLength);

      // Assert
      expect(result).toBe(text);
      expect(result.endsWith('...')).toBe(false);
    }
  );

  test.prop([
    fc.string({ minLength: 10, maxLength: 500 }),
    fc.integer({ min: 1, max: 200 })
  ], { numRuns: 100 })(
    'Property_8_TextTruncation_ShouldBeDeterministic_ForSameInputs',
    (text, maxLength) => {
      // Act: Call the function multiple times with the same inputs
      const result1 = truncateText(text, maxLength);
      const result2 = truncateText(text, maxLength);
      const result3 = truncateText(text, maxLength);

      // Assert: Results should be identical
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    }
  );
});

describe('truncateForBreadcrumb', () => {
  it('should return the original text if it is shorter than maxLength', () => {
    const text = 'Short title';
    const result = truncateForBreadcrumb(text, 30);
    expect(result).toBe('Short title');
  });

  it('should return the original text if it equals maxLength', () => {
    const text = 'Exactly thirty characters!!';
    const result = truncateForBreadcrumb(text, 27);
    expect(result).toBe('Exactly thirty characters!!');
  });

  it('should truncate text and add ellipsis if it exceeds maxLength', () => {
    const text = 'How to Peel Garlic in 10 Seconds Using a Simple Trick';
    const result = truncateForBreadcrumb(text, 30);
    expect(result).toBe('How to Peel Garlic in 10 Se...');
    expect(result.length).toBe(30);
  });

  it('should use default maxLength of 30 when not specified', () => {
    const text = 'This is a very long breadcrumb title that needs truncation';
    const result = truncateForBreadcrumb(text);
    expect(result).toBe('This is a very long breadcr...');
    expect(result.length).toBe(30);
  });

  it('should handle empty strings', () => {
    const result = truncateForBreadcrumb('', 30);
    expect(result).toBe('');
  });

  it('should handle single character strings', () => {
    const result = truncateForBreadcrumb('A', 30);
    expect(result).toBe('A');
  });

  it('should truncate correctly with custom maxLength', () => {
    const text = 'Kitchen Tips and Tricks';
    const result = truncateForBreadcrumb(text, 15);
    expect(result).toBe('Kitchen Tips...');
    expect(result.length).toBe(15);
  });

  it('should handle text with special characters', () => {
    const text = 'How to Cook 🍳 Perfect Eggs Every Time!';
    const result = truncateForBreadcrumb(text, 20);
    expect(result).toBe('How to Cook 🍳 Pe...');
    expect(result.length).toBe(20);
  });

  it('should handle text with spaces at truncation point', () => {
    const text = 'This is a test string for breadcrumb';
    const result = truncateForBreadcrumb(text, 20);
    expect(result).toBe('This is a test st...');
    expect(result.length).toBe(20);
  });

  it('should preserve exact characters before ellipsis', () => {
    const text = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result = truncateForBreadcrumb(text, 15);
    expect(result).toBe('0123456789AB...');
    expect(result.substring(0, 12)).toBe('0123456789AB');
  });
});
