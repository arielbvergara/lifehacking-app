/**
 * Unit tests for admin dashboard API client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchDashboardStatistics } from './admin-dashboard';
import { ERROR_MESSAGES } from '@/lib/constants/admin-dashboard';

// Mock fetch globally
global.fetch = vi.fn();

describe('fetchDashboardStatistics', () => {
  const mockToken = 'test-firebase-token';
  const mockDashboardData = {
    users: { total: 100, thisMonth: 10, lastMonth: 8 },
    categories: { total: 20, thisMonth: 2, lastMonth: 2 },
    tips: { total: 500, thisMonth: 50, lastMonth: 45 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('fetchDashboardStatistics_ShouldFetchSuccessfully_WhenValidToken', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData,
    });

    const result = await fetchDashboardStatistics(mockToken);

    expect(result).toEqual(mockDashboardData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/dashboard`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
        signal: expect.any(AbortSignal),
      }
    );
  });

  it('fetchDashboardStatistics_ShouldIncludeAuthToken_WhenCalled', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData,
    });

    await fetchDashboardStatistics(mockToken);

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('fetchDashboardStatistics_ShouldThrowSessionExpired_When401Error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Unauthorized' }),
    });

    await expect(fetchDashboardStatistics(mockToken)).rejects.toMatchObject({
      status: 401,
      message: ERROR_MESSAGES.SESSION_EXPIRED,
    });
  });

  it('fetchDashboardStatistics_ShouldThrowUnauthorized_When403Error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Forbidden' }),
    });

    await expect(fetchDashboardStatistics(mockToken)).rejects.toMatchObject({
      status: 403,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  });

  it('fetchDashboardStatistics_ShouldThrowNetworkError_WhenTimeout', async () => {
    const abortError = new Error('Timeout');
    abortError.name = 'AbortError';
    
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((_, reject) => reject(abortError))
    );

    await expect(fetchDashboardStatistics(mockToken)).rejects.toMatchObject({
      status: 0,
      message: ERROR_MESSAGES.NETWORK_ERROR,
    });
  });

  it('fetchDashboardStatistics_ShouldThrowNetworkError_WhenAbortError', async () => {
    const abortError = new Error('Network failure');
    abortError.name = 'AbortError';
    
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortError);

    await expect(fetchDashboardStatistics(mockToken)).rejects.toMatchObject({
      status: 0,
      message: ERROR_MESSAGES.NETWORK_ERROR,
    });
  });

  it('fetchDashboardStatistics_ShouldClearTimeout_WhenSuccessful', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData,
    });

    await fetchDashboardStatistics(mockToken);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('fetchDashboardStatistics_ShouldClearTimeout_WhenError', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Server error' }),
    });

    await expect(fetchDashboardStatistics(mockToken)).rejects.toBeDefined();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
