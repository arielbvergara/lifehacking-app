import { describe, it, expect } from 'vitest';
import { truncateText } from './text';

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
