import { describe, it, expect } from 'vitest';
import { calculateActiveFilters } from './active-filters';

describe('calculateActiveFilters', () => {
  it('should return 0 when no parameters are present', () => {
    const params = new URLSearchParams();
    expect(calculateActiveFilters(params)).toBe(0);
  });

  it('should return 0 when only default parameters are present', () => {
    const params = new URLSearchParams('sortBy=newest&sortDir=desc');
    expect(calculateActiveFilters(params)).toBe(0);
  });

  it('should count search query as active filter', () => {
    const params = new URLSearchParams('q=cooking');
    expect(calculateActiveFilters(params)).toBe(1);
  });

  it('should count categoryId as active filter', () => {
    const params = new URLSearchParams('categoryId=123e4567-e89b-12d3-a456-426614174000');
    expect(calculateActiveFilters(params)).toBe(1);
  });

  it('should count non-default sortBy as active filter', () => {
    const params = new URLSearchParams('sortBy=oldest');
    expect(calculateActiveFilters(params)).toBe(1);
  });

  it('should count non-default sortDir as active filter', () => {
    const params = new URLSearchParams('sortDir=asc');
    expect(calculateActiveFilters(params)).toBe(1);
  });

  it('should not count default sortBy (newest) as active filter', () => {
    const params = new URLSearchParams('sortBy=newest');
    expect(calculateActiveFilters(params)).toBe(0);
  });

  it('should not count default sortDir (desc) as active filter', () => {
    const params = new URLSearchParams('sortDir=desc');
    expect(calculateActiveFilters(params)).toBe(0);
  });

  it('should count multiple active filters correctly', () => {
    const params = new URLSearchParams('q=cooking&categoryId=123&sortBy=alphabetical');
    expect(calculateActiveFilters(params)).toBe(3);
  });

  it('should count all possible active filters', () => {
    const params = new URLSearchParams('q=test&categoryId=123&sortBy=oldest&sortDir=asc');
    expect(calculateActiveFilters(params)).toBe(4);
  });

  it('should handle empty string values correctly', () => {
    const params = new URLSearchParams('q=&categoryId=');
    // Empty strings are falsy, so they should not be counted
    expect(calculateActiveFilters(params)).toBe(0);
  });

  it('should ignore page parameter in count', () => {
    const params = new URLSearchParams('q=test&page=2');
    expect(calculateActiveFilters(params)).toBe(1);
  });

  it('should handle alphabetical sort as active filter', () => {
    const params = new URLSearchParams('sortBy=alphabetical');
    expect(calculateActiveFilters(params)).toBe(1);
  });

  it('should count combination of query and non-default sort', () => {
    const params = new URLSearchParams('q=gardening&sortBy=alphabetical&sortDir=asc');
    expect(calculateActiveFilters(params)).toBe(3);
  });
});
