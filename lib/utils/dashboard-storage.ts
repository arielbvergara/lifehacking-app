/**
 * Local storage utilities for dashboard preferences
 */

import type { Period, StatisticsType } from '@/lib/types/admin-dashboard';

const STORAGE_KEYS = {
  PERIOD: 'dashboard_period',
  STATISTICS_TYPE: 'dashboard_statistics_type',
} as const;

const DEFAULTS = {
  PERIOD: 'month' as Period,
  STATISTICS_TYPE: 'amount' as StatisticsType,
} as const;

/**
 * Check if localStorage is available (client-side only)
 */
function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Save selected period to localStorage
 */
export function savePeriod(period: Period): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.PERIOD, period);
  } catch (error) {
    console.error('Failed to save period preference:', error);
  }
}

/**
 * Load selected period from localStorage
 */
export function loadPeriod(): Period {
  if (!isLocalStorageAvailable()) {
    return DEFAULTS.PERIOD;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PERIOD);
    if (stored && ['day', 'week', 'month', 'year'].includes(stored)) {
      return stored as Period;
    }
  } catch (error) {
    console.error('Failed to load period preference:', error);
  }
  return DEFAULTS.PERIOD;
}

/**
 * Save selected statistics type to localStorage
 */
export function saveStatisticsType(type: StatisticsType): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.STATISTICS_TYPE, type);
  } catch (error) {
    console.error('Failed to save statistics type preference:', error);
  }
}

/**
 * Load selected statistics type from localStorage
 */
export function loadStatisticsType(): StatisticsType {
  if (!isLocalStorageAvailable()) {
    return DEFAULTS.STATISTICS_TYPE;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATISTICS_TYPE);
    if (stored && ['amount', 'percentage'].includes(stored)) {
      return stored as StatisticsType;
    }
  } catch (error) {
    console.error('Failed to load statistics type preference:', error);
  }
  return DEFAULTS.STATISTICS_TYPE;
}
