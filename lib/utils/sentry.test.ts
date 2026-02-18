import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { captureException, withSpan, logger } from './sentry';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  setContext: vi.fn(),
  startSpan: vi.fn((config, callback) => callback({ setAttribute: vi.fn() })),
  logger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    fmt: vi.fn((strings) => strings.join('')),
  },
}));

describe('sentry utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('captureException', () => {
    it('captureException_ShouldCaptureError_WhenCalledWithError', () => {
      const error = new Error('Test error');
      
      captureException(error);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('captureException_ShouldSetContext_WhenCalledWithContext', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };
      
      captureException(error, context);
      
      expect(Sentry.setContext).toHaveBeenCalledWith('additional_context', context);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('captureException_ShouldNotSetContext_WhenCalledWithoutContext', () => {
      const error = new Error('Test error');
      
      captureException(error);
      
      expect(Sentry.setContext).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('withSpan', () => {
    it('withSpan_ShouldCreateSpan_WhenCalled', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      
      await withSpan('http.client', 'GET /api/test', callback);
      
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          op: 'http.client',
          name: 'GET /api/test',
        },
        expect.any(Function)
      );
    });

    it('withSpan_ShouldSetAttributes_WhenAttributesProvided', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      const attributes = { userId: '123', endpoint: '/api/test' };
      const mockSpan = { setAttribute: vi.fn() };
      
      vi.mocked(Sentry.startSpan).mockImplementation((config, cb) => cb(mockSpan as Sentry.Span));
      
      await withSpan('http.client', 'GET /api/test', callback, attributes);
      
      expect(mockSpan.setAttribute).toHaveBeenCalledWith('userId', '123');
      expect(mockSpan.setAttribute).toHaveBeenCalledWith('endpoint', '/api/test');
    });

    it('withSpan_ShouldReturnCallbackResult_WhenCallbackSucceeds', async () => {
      const expectedResult = { data: 'test' };
      const callback = vi.fn().mockResolvedValue(expectedResult);
      
      const result = await withSpan('http.client', 'GET /api/test', callback);
      
      expect(result).toEqual(expectedResult);
    });

    it('withSpan_ShouldPropagateError_WhenCallbackThrows', async () => {
      const error = new Error('Callback error');
      const callback = vi.fn().mockRejectedValue(error);
      
      await expect(
        withSpan('http.client', 'GET /api/test', callback)
      ).rejects.toThrow('Callback error');
    });
  });

  describe('logger', () => {
    it('logger_ShouldBeExported_WhenImported', () => {
      expect(logger).toBeDefined();
      expect(logger.trace).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.fatal).toBeDefined();
    });
  });
});
