import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadCategoryImage, createCategory } from './admin-category';
import { CategoryImageDto, CreateCategoryRequest } from '@/lib/types/admin-category';
import { ERROR_MESSAGES } from '@/lib/constants/admin-category';

// Mock environment variables
const mockApiBaseUrl = 'http://localhost:8080';
vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', mockApiBaseUrl);

describe('Admin Category API', () => {
  const mockToken = 'mock-firebase-token';
  const mockImageMetadata: CategoryImageDto = {
    imageUrl: 'https://example.com/image.jpg',
    imageStoragePath: 'categories/test.jpg',
    originalFileName: 'test.jpg',
    contentType: 'image/jpeg',
    fileSizeBytes: 1024,
    uploadedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadCategoryImage', () => {
    it('uploadCategoryImage_ShouldCallCorrectEndpoint_WhenInvoked', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockImageMetadata,
      } as Response);

      await uploadCategoryImage(mockFile, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/api/admin/categories/images`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('uploadCategoryImage_ShouldIncludeAuthorizationHeader_WhenInvoked', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockImageMetadata,
      } as Response);

      await uploadCategoryImage(mockFile, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
    });

    it('uploadCategoryImage_ShouldSendFileAsFormData_WhenInvoked', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockImageMetadata,
      } as Response);

      await uploadCategoryImage(mockFile, mockToken);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = callArgs[1]?.body as FormData;
      
      expect(body).toBeInstanceOf(FormData);
      expect(body.get('file')).toBe(mockFile);
    });

    it('uploadCategoryImage_ShouldReturnImageMetadata_WhenSuccessful', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockImageMetadata,
      } as Response);

      const result = await uploadCategoryImage(mockFile, mockToken);

      expect(result).toEqual(mockImageMetadata);
    });

    it('uploadCategoryImage_ShouldThrowError_When400Response', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Invalid file format' }),
      } as Response);

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toEqual({
        status: 400,
        message: 'Invalid file format',
      });
    });

    it('uploadCategoryImage_ShouldThrowUnauthorizedError_When403Response', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Forbidden' }),
      } as Response);

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toEqual({
        status: 403,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    });

    it('uploadCategoryImage_ShouldThrowGenericError_When500Response', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Internal server error' }),
      } as Response);

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toEqual({
        status: 500,
        message: 'Internal server error',
      });
    });

    it('uploadCategoryImage_ShouldThrowNetworkError_WhenTimeout', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error('Timeout');
          error.name = 'AbortError';
          reject(error);
        });
      });

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toEqual({
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
    });

    it('uploadCategoryImage_ShouldThrowGenericError_WhenNonJSONResponse', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/html' }),
        json: async () => {
          throw new Error('Not JSON');
        },
      } as Response);

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toEqual({
        status: 500,
        message: ERROR_MESSAGES.GENERIC_ERROR,
      });
    });

    it('uploadCategoryImage_ShouldIncludeValidationErrors_When400WithErrors', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          detail: 'Validation failed',
          errors: {
            file: ['File is required', 'File must be an image'],
          },
        }),
      } as Response);

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toEqual({
        status: 400,
        message: 'Validation failed',
        errors: {
          file: ['File is required', 'File must be an image'],
        },
      });
    });
  });

  describe('createCategory', () => {
    const mockRequest: CreateCategoryRequest = {
      name: 'Test Category',
      image: mockImageMetadata,
    };

    const mockResponse = {
      id: 'cat-123',
      name: 'Test Category',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: null,
      image: mockImageMetadata,
    };

    it('createCategory_ShouldCallCorrectEndpoint_WhenInvoked', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await createCategory(mockRequest, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/api/admin/categories`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('createCategory_ShouldIncludeAuthorizationHeader_WhenInvoked', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await createCategory(mockRequest, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
    });

    it('createCategory_ShouldSendJSONPayload_WhenInvoked', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await createCategory(mockRequest, mockToken);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = callArgs[1]?.body as string;
      
      expect(JSON.parse(body)).toEqual(mockRequest);
    });

    it('createCategory_ShouldReturnCategoryResponse_WhenSuccessful', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await createCategory(mockRequest, mockToken);

      expect(result).toEqual(mockResponse);
    });

    it('createCategory_ShouldThrowError_When400Response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Invalid category data' }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 400,
        message: 'Invalid category data',
      });
    });

    it('createCategory_ShouldThrowUnauthorizedError_When403Response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Forbidden' }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 403,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    });

    it('createCategory_ShouldThrowConflictError_When409Response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 409,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: "Category with name 'Test Category' already exists" }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 409,
        message: ERROR_MESSAGES.CATEGORY_EXISTS('Test Category'),
      });
    });

    it('createCategory_ShouldExtractCategoryName_When409Response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 409,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: "Category with name 'Kitchen Tips' already exists" }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 409,
        message: ERROR_MESSAGES.CATEGORY_EXISTS('Kitchen Tips'),
      });
    });

    it('createCategory_ShouldUseGenericName_When409WithoutName', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 409,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Category already exists' }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 409,
        message: ERROR_MESSAGES.CATEGORY_EXISTS('this name'),
      });
    });

    it('createCategory_ShouldThrowGenericError_When500Response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Internal server error' }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 500,
        message: 'Internal server error',
      });
    });

    it('createCategory_ShouldThrowNetworkError_WhenTimeout', async () => {
      vi.mocked(fetch).mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error('Timeout');
          error.name = 'AbortError';
          reject(error);
        });
      });

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
    });

    it('createCategory_ShouldThrowGenericError_WhenNonJSONResponse', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/html' }),
        json: async () => {
          throw new Error('Not JSON');
        },
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 500,
        message: ERROR_MESSAGES.GENERIC_ERROR,
      });
    });

    it('createCategory_ShouldIncludeValidationErrors_When400WithErrors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          detail: 'Validation failed',
          errors: {
            name: ['Name is required'],
            image: ['Image is required'],
          },
        }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 400,
        message: 'Validation failed',
        errors: {
          name: ['Name is required'],
          image: ['Image is required'],
        },
      });
    });

    it('createCategory_ShouldUseTitleAsMessage_WhenNoDetail', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          title: 'Bad Request',
        }),
      } as Response);

      await expect(createCategory(mockRequest, mockToken)).rejects.toEqual({
        status: 400,
        message: 'Bad Request',
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('ErrorHandling_ShouldHandleNetworkFailure_WhenFetchThrows', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toThrow('Network failure');
    });

    it('ErrorHandling_ShouldHandleJSONParseError_WhenResponseInvalid', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toEqual({
        status: 500,
        message: ERROR_MESSAGES.GENERIC_ERROR,
      });
    });

    it('ErrorHandling_ShouldClearTimeout_WhenRequestSucceeds', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockImageMetadata,
      } as Response);

      await uploadCategoryImage(mockFile, mockToken);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('ErrorHandling_ShouldClearTimeout_WhenRequestFails', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Error' }),
      } as Response);

      await expect(uploadCategoryImage(mockFile, mockToken)).rejects.toBeDefined();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
