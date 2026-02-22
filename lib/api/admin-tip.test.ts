/**
 * Unit tests for admin tip API client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTipById, updateTip, deleteTip } from './admin-tip';
import { ERROR_MESSAGES } from '@/lib/constants/admin-dashboard';

// Mock fetch globally
global.fetch = vi.fn();

describe('fetchTipById', () => {
  const mockToken = 'test-firebase-token';
  const mockTipId = 'tip-123';
  const mockTipData = {
    id: mockTipId,
    title: 'Test Tip',
    description: 'Test Description',
    steps: [{ stepNumber: 1, description: 'Step 1' }],
    categoryId: 'cat-1',
    categoryName: 'Test Category',
    tags: ['test'],
    videoUrl: null,
    videoUrlId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
    image: {
      imageUrl: 'https://example.com/image.jpg',
      imageStoragePath: 'path/to/image.jpg',
      originalFileName: 'image.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 1024,
      uploadedAt: '2024-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('fetchTipById_ShouldFetchSuccessfully_WhenValidIdAndToken', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTipData,
    });

    const result = await fetchTipById(mockTipId, mockToken);

    expect(result).toEqual(mockTipData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Tip/${mockTipId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
        signal: expect.any(AbortSignal),
      }
    );
  });

  it('fetchTipById_ShouldIncludeAuthToken_WhenCalled', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTipData,
    });

    await fetchTipById(mockTipId, mockToken);

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('fetchTipById_ShouldThrowNotFound_When404Error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Tip not found' }),
    });

    await expect(fetchTipById(mockTipId, mockToken)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('fetchTipById_ShouldThrowNetworkError_WhenTimeout', async () => {
    const abortError = new Error('Timeout');
    abortError.name = 'AbortError';
    
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortError);

    await expect(fetchTipById(mockTipId, mockToken)).rejects.toMatchObject({
      status: 0,
      message: ERROR_MESSAGES.NETWORK_ERROR,
    });
  });

  it('fetchTipById_ShouldClearTimeout_WhenSuccessful', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTipData,
    });

    await fetchTipById(mockTipId, mockToken);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

describe('updateTip', () => {
  const mockToken = 'test-firebase-token';
  const mockTipId = 'tip-123';
  const mockUpdateData = {
    title: 'Updated Tip',
    description: 'Updated Description',
    categoryId: 'cat-1',
    steps: [
      { stepNumber: 1, description: 'Updated Step 1' },
      { stepNumber: 2, description: 'Updated Step 2' },
    ],
    tags: ['updated', 'test'],
    videoUrl: 'https://youtube.com/watch?v=123',
  };
  const mockUpdatedTip = {
    id: mockTipId,
    ...mockUpdateData,
    categoryName: 'Test Category',
    videoUrlId: '123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    image: {
      imageUrl: 'https://example.com/image.jpg',
      imageStoragePath: 'path/to/image.jpg',
      originalFileName: 'image.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 1024,
      uploadedAt: '2024-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('updateTip_ShouldUpdateSuccessfully_WhenValidData', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedTip,
    });

    const result = await updateTip(mockTipId, mockUpdateData, mockToken);

    expect(result).toEqual(mockUpdatedTip);
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/tips/${mockTipId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(mockUpdateData),
        signal: expect.any(AbortSignal),
      }
    );
  });

  it('updateTip_ShouldIncludeAuthToken_WhenCalled', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedTip,
    });

    await updateTip(mockTipId, mockUpdateData, mockToken);

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('updateTip_ShouldThrowNotFound_When404Error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Tip not found' }),
    });

    await expect(updateTip(mockTipId, mockUpdateData, mockToken)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('updateTip_ShouldThrowValidationError_When400Error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        detail: 'Validation failed',
        errors: { title: ['Title is required'] },
      }),
    });

    await expect(updateTip(mockTipId, mockUpdateData, mockToken)).rejects.toMatchObject({
      status: 400,
      errors: { title: ['Title is required'] },
    });
  });

  it('updateTip_ShouldThrowNetworkError_WhenTimeout', async () => {
    const abortError = new Error('Timeout');
    abortError.name = 'AbortError';
    
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortError);

    await expect(updateTip(mockTipId, mockUpdateData, mockToken)).rejects.toMatchObject({
      status: 0,
      message: ERROR_MESSAGES.NETWORK_ERROR,
    });
  });

  it('updateTip_ShouldClearTimeout_WhenSuccessful', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedTip,
    });

    await updateTip(mockTipId, mockUpdateData, mockToken);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('updateTip_ShouldClearTimeout_WhenError', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Server error' }),
    });

    await expect(updateTip(mockTipId, mockUpdateData, mockToken)).rejects.toBeDefined();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

describe('deleteTip', () => {
  const mockToken = 'test-firebase-token';
  const mockTipId = 'tip-123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('deleteTip_ShouldDeleteSuccessfully_WhenValidId', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await expect(deleteTip(mockTipId, mockToken)).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/tips/${mockTipId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
        signal: expect.any(AbortSignal),
      }
    );
  });

  it('deleteTip_ShouldIncludeAuthToken_WhenCalled', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await deleteTip(mockTipId, mockToken);

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('deleteTip_ShouldThrowNotFound_When404Error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Tip not found' }),
    });

    await expect(deleteTip(mockTipId, mockToken)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('deleteTip_ShouldThrowUnauthorized_When403Error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Forbidden' }),
    });

    await expect(deleteTip(mockTipId, mockToken)).rejects.toMatchObject({
      status: 403,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  });

  it('deleteTip_ShouldThrowNetworkError_WhenTimeout', async () => {
    const abortError = new Error('Timeout');
    abortError.name = 'AbortError';
    
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortError);

    await expect(deleteTip(mockTipId, mockToken)).rejects.toMatchObject({
      status: 0,
      message: ERROR_MESSAGES.NETWORK_ERROR,
    });
  });

  it('deleteTip_ShouldClearTimeout_WhenSuccessful', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await deleteTip(mockTipId, mockToken);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('deleteTip_ShouldClearTimeout_WhenError', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Server error' }),
    });

    await expect(deleteTip(mockTipId, mockToken)).rejects.toBeDefined();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
