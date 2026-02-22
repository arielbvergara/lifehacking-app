import { describe, it, expect } from 'vitest';
import { formatStatNumber, calculateGrowthText } from './dashboard';

describe('Dashboard Utilities', () => {
  describe('formatStatNumber', () => {
    it('formatStatNumber_ShouldFormatWithComma_WhenNumberIsLessThan10k', () => {
      expect(formatStatNumber(1248)).toBe('1,248');
      expect(formatStatNumber(999)).toBe('999');
      expect(formatStatNumber(9999)).toBe('9,999');
    });

    it('formatStatNumber_ShouldFormatWithKSuffix_WhenNumberIs10kOrMore', () => {
      expect(formatStatNumber(10000)).toBe('10k');
      expect(formatStatNumber(50400)).toBe('50.4k');
      expect(formatStatNumber(50000)).toBe('50k');
    });

    it('formatStatNumber_ShouldHandleSmallNumbers_WhenNumberIsLessThan1000', () => {
      expect(formatStatNumber(18)).toBe('18');
      expect(formatStatNumber(0)).toBe('0');
      expect(formatStatNumber(500)).toBe('500');
    });

    it('formatStatNumber_ShouldRemoveTrailingZero_WhenDecimalIsZero', () => {
      expect(formatStatNumber(10000)).toBe('10k');
      expect(formatStatNumber(25000)).toBe('25k');
    });
  });

  describe('calculateGrowthText', () => {
    it('calculateGrowthText_ShouldReturnPositiveAbsolute_WhenPreviousIsZero', () => {
      const result = calculateGrowthText(12, 0, 'month');
      expect(result.text).toBe('+12 this month');
      expect(result.type).toBe('positive');
    });

    it('calculateGrowthText_ShouldReturnPositivePercentage_WhenPreviousIsLarge', () => {
      const result = calculateGrowthText(105, 100, 'month');
      expect(result.text).toBe('+5% growth');
      expect(result.type).toBe('positive');
    });

    it('calculateGrowthText_ShouldReturnNegativeAbsolute_WhenPreviousIsSmall', () => {
      const result = calculateGrowthText(5, 8, 'month');
      expect(result.text).toBe('-3 this month');
      expect(result.type).toBe('negative');
    });

    it('calculateGrowthText_ShouldReturnNegativePercentage_WhenPreviousIsLarge', () => {
      const result = calculateGrowthText(95, 100, 'month');
      expect(result.text).toBe('-5% decline');
      expect(result.type).toBe('negative');
    });

    it('calculateGrowthText_ShouldReturnNoChange_WhenValuesAreEqual', () => {
      const result = calculateGrowthText(100, 100, 'month');
      expect(result.text).toBe('No change');
      expect(result.type).toBe('neutral');
    });

    it('calculateGrowthText_ShouldHandleZeroToZero_WhenBothAreZero', () => {
      const result = calculateGrowthText(0, 0, 'month');
      expect(result.text).toBe('No change');
      expect(result.type).toBe('neutral');
    });

    it('calculateGrowthText_ShouldUseAbsoluteForSmallNumbers_WhenPreviousIsLessThan10', () => {
      const result = calculateGrowthText(7, 5, 'month');
      expect(result.text).toBe('+2 this month');
      expect(result.type).toBe('positive');
    });
  });
});
