import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateVideoUrl, generateTipContentFromVideo } from './gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ERROR_MESSAGES,
  TIP_TITLE_MAX_LENGTH,
  TIP_DESCRIPTION_MAX_LENGTH,
  TIP_STEP_DESCRIPTION_MAX_LENGTH,
  TIP_TAG_MAX_LENGTH,
  TIP_MAX_TAGS,
} from '@/lib/constants/admin-tip';
import { GeminiTipContent } from '@/lib/types/admin-tip';

// Mock GoogleGenerativeAI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(),
}));

// Mock environment variables
const mockApiKey = 'mock-gemini-api-key';
vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', mockApiKey);
vi.stubEnv('NEXT_PUBLIC_GEMINI_MODEL_PRIMARY', 'gemini-2.5-flash');
vi.stubEnv('NEXT_PUBLIC_GEMINI_MODEL_FALLBACK', 'gemini-2.5');

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore API key for each test
    vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', mockApiKey);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateVideoUrl', () => {
    it('validateVideoUrl_ShouldReturnInvalid_WhenEmptyString', () => {
      const result = validateVideoUrl('');
      
      expect(result).toEqual({
        isValid: false,
        error: ERROR_MESSAGES.VIDEO_URL_REQUIRED,
      });
    });

    it('validateVideoUrl_ShouldReturnInvalid_WhenWhitespaceOnly', () => {
      const result = validateVideoUrl('   ');
      
      expect(result).toEqual({
        isValid: false,
        error: ERROR_MESSAGES.VIDEO_URL_REQUIRED,
      });
    });

    it('validateVideoUrl_ShouldReturnValid_WhenYouTubeWatchUrl', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: true,
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      });
    });

    it('validateVideoUrl_ShouldReturnValid_WhenYouTubeShortsUrl', () => {
      const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: true,
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      });
    });

    it('validateVideoUrl_ShouldReturnValid_WhenInstagramUrl', () => {
      const url = 'https://www.instagram.com/p/ABC123xyz/';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: true,
        platform: 'instagram',
        videoId: 'ABC123xyz',
      });
    });

    it('validateVideoUrl_ShouldReturnValid_WhenInstagramUrlWithoutTrailingSlash', () => {
      const url = 'https://www.instagram.com/p/ABC123xyz';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: true,
        platform: 'instagram',
        videoId: 'ABC123xyz',
      });
    });

    it('validateVideoUrl_ShouldTrimWhitespace_WhenValidUrl', () => {
      const url = '  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: true,
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      });
    });

    it('validateVideoUrl_ShouldReturnInvalid_WhenInvalidYouTubeUrl', () => {
      const url = 'https://www.youtube.com/watch?v=invalid';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: false,
        error: ERROR_MESSAGES.VIDEO_URL_INVALID,
      });
    });

    it('validateVideoUrl_ShouldReturnInvalid_WhenInvalidPlatform', () => {
      const url = 'https://www.vimeo.com/123456789';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: false,
        error: ERROR_MESSAGES.VIDEO_URL_INVALID,
      });
    });

    it('validateVideoUrl_ShouldReturnInvalid_WhenMalformedUrl', () => {
      const url = 'not-a-url';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: false,
        error: ERROR_MESSAGES.VIDEO_URL_INVALID,
      });
    });

    it('validateVideoUrl_ShouldReturnInvalid_WhenYouTubeVideoIdTooShort', () => {
      const url = 'https://www.youtube.com/watch?v=short';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: false,
        error: ERROR_MESSAGES.VIDEO_URL_INVALID,
      });
    });

    it('validateVideoUrl_ShouldReturnInvalid_WhenYouTubeVideoIdTooLong', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQextra';
      const result = validateVideoUrl(url);
      
      expect(result).toEqual({
        isValid: false,
        error: ERROR_MESSAGES.VIDEO_URL_INVALID,
      });
    });
  });

  describe('generateTipContentFromVideo', () => {
    const validYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const validInstagramUrl = 'https://www.instagram.com/p/ABC123xyz/';
    
    const mockValidResponse: GeminiTipContent = {
      title: 'Test Life Hack',
      description: 'This is a test description for the life hack.',
      steps: [
        { stepNumber: 1, description: 'First step description here.' },
        { stepNumber: 2, description: 'Second step description here.' },
      ],
      tags: ['test', 'lifehack'],
      videoUrl: validYouTubeUrl,
    };

    const createMockModel = (responseText: string) => ({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => responseText,
        },
      }),
    });

    const setupMockGenAI = (mockModel: ReturnType<typeof createMockModel>) => {
      const mockGenAI = {
        getGenerativeModel: vi.fn().mockReturnValue(mockModel),
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(GoogleGenerativeAI).mockImplementation(function(this: any) {
        return mockGenAI;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      
      return mockGenAI;
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenApiKeyMissing', async () => {
      vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', '');

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_API_KEY_MISSING
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenVideoUrlInvalid', async () => {
      await expect(generateTipContentFromVideo('invalid-url')).rejects.toThrow(
        ERROR_MESSAGES.VIDEO_URL_INVALID
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenVideoUrlEmpty', async () => {
      await expect(generateTipContentFromVideo('')).rejects.toThrow(
        ERROR_MESSAGES.VIDEO_URL_REQUIRED
      );
    });

    it('generateTipContentFromVideo_ShouldCallGeminiAPI_WhenValidYouTubeUrl', async () => {
      const mockModel = createMockModel(JSON.stringify(mockValidResponse));
      const mockGenAI = setupMockGenAI(mockModel);

      await generateTipContentFromVideo(validYouTubeUrl);

      expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
      });
    });

    it('generateTipContentFromVideo_ShouldIncludeVideoUrl_WhenCallingAPI', async () => {
      const mockModel = createMockModel(JSON.stringify(mockValidResponse));
      setupMockGenAI(mockModel);

      await generateTipContentFromVideo(validYouTubeUrl);

      expect(mockModel.generateContent).toHaveBeenCalledWith([
        {
          fileData: {
            fileUri: validYouTubeUrl,
            mimeType: 'video/*',
          },
        },
        {
          text: expect.stringContaining('Analyze this youtube video'),
        },
      ]);
    });

    it('generateTipContentFromVideo_ShouldReturnValidContent_WhenSuccessful', async () => {
      const mockModel = createMockModel(JSON.stringify(mockValidResponse));
      setupMockGenAI(mockModel);

      const result = await generateTipContentFromVideo(validYouTubeUrl);

      expect(result).toEqual(mockValidResponse);
    });

    it('generateTipContentFromVideo_ShouldHandleMarkdownCodeBlocks_WhenInResponse', async () => {
      const responseWithMarkdown = `\`\`\`json
${JSON.stringify(mockValidResponse)}
\`\`\``;
      
      const mockModel = createMockModel(responseWithMarkdown);
      setupMockGenAI(mockModel);

      const result = await generateTipContentFromVideo(validYouTubeUrl);

      expect(result).toEqual(mockValidResponse);
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenResponseNotJSON', async () => {
      const mockModel = createMockModel('This is not JSON');
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenTitleTooShort', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        title: 'Hi', // Less than TIP_TITLE_MIN_LENGTH (5)
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenTitleTooLong', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        title: 'a'.repeat(TIP_TITLE_MAX_LENGTH + 1),
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenDescriptionTooShort', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        description: 'Short', // Less than TIP_DESCRIPTION_MIN_LENGTH (10)
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenDescriptionTooLong', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        description: 'a'.repeat(TIP_DESCRIPTION_MAX_LENGTH + 1),
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenNoSteps', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: [],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenStepNumberInvalid', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: [{ stepNumber: 0, description: 'Invalid step number' }],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenStepDescriptionTooShort', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: [{ stepNumber: 1, description: 'Short' }],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenStepDescriptionTooLong', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: [
          {
            stepNumber: 1,
            description: 'a'.repeat(TIP_STEP_DESCRIPTION_MAX_LENGTH + 1),
          },
        ],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenTooManyTags', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        tags: Array(TIP_MAX_TAGS + 1).fill('tag'),
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenTagTooShort', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        tags: [''], // Empty tag
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenTagTooLong', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        tags: ['a'.repeat(TIP_TAG_MAX_LENGTH + 1)],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldAcceptEmptyTags_WhenValid', async () => {
      const validResponseWithNoTags = {
        ...mockValidResponse,
        tags: [],
      };
      
      const mockModel = createMockModel(JSON.stringify(validResponseWithNoTags));
      setupMockGenAI(mockModel);

      const result = await generateTipContentFromVideo(validYouTubeUrl);

      expect(result.tags).toEqual([]);
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenVideoUrlMissing', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        videoUrl: undefined,
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenResponseNotObject', async () => {
      const mockModel = createMockModel(JSON.stringify('string response'));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenResponseNull', async () => {
      const mockModel = createMockModel(JSON.stringify(null));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldHandleInstagramUrl_WhenValid', async () => {
      const instagramResponse = {
        ...mockValidResponse,
        videoUrl: validInstagramUrl,
      };
      
      const mockModel = createMockModel(JSON.stringify(instagramResponse));
      setupMockGenAI(mockModel);

      const result = await generateTipContentFromVideo(validInstagramUrl);

      expect(result.videoUrl).toBe(validInstagramUrl);
      expect(mockModel.generateContent).toHaveBeenCalledWith([
        {
          fileData: {
            fileUri: validInstagramUrl,
            mimeType: 'video/*',
          },
        },
        {
          text: expect.stringContaining('Analyze this instagram video'),
        },
      ]);
    });

    it('generateTipContentFromVideo_ShouldThrowTimeoutError_WhenRequestTimesOut', async () => {
      const mockModel = {
        generateContent: vi.fn().mockImplementation(() => {
          return new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('Timeout');
              error.name = 'AbortError';
              reject(error);
            }, 100);
          });
        }),
      };
      
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        'Request timeout. Please try again.'
      );
    }, 10000);

    it('generateTipContentFromVideo_ShouldThrowGenericError_WhenUnknownError', async () => {
      const mockModel = {
        generateContent: vi.fn().mockRejectedValue(new Error('Unknown error')),
      };
      
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_API_ERROR
      );
    });

    it('generateTipContentFromVideo_ShouldClearTimeout_WhenSuccessful', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const mockModel = createMockModel(JSON.stringify(mockValidResponse));
      setupMockGenAI(mockModel);

      await generateTipContentFromVideo(validYouTubeUrl);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('generateTipContentFromVideo_ShouldClearTimeout_WhenFails', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const mockModel = createMockModel('invalid json');
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('generateTipContentFromVideo_ShouldUseFallbackModel_WhenPrimaryFails', async () => {
      const mockPrimaryModel = {
        generateContent: vi.fn().mockRejectedValue(new Error('Primary model failed')),
      };
      
      const mockFallbackModel = createMockModel(JSON.stringify(mockValidResponse));
      
      const mockGenAI = {
        getGenerativeModel: vi.fn()
          .mockReturnValueOnce(mockPrimaryModel)
          .mockReturnValueOnce(mockFallbackModel),
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(GoogleGenerativeAI).mockImplementation(function(this: any) {
        return mockGenAI;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await generateTipContentFromVideo(validYouTubeUrl);

      expect(result).toEqual(mockValidResponse);
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledTimes(2);
      expect(mockGenAI.getGenerativeModel).toHaveBeenNthCalledWith(1, {
        model: 'gemini-2.5-flash',
      });
      expect(mockGenAI.getGenerativeModel).toHaveBeenNthCalledWith(2, {
        model: 'gemini-2.5',
      });
    });

    it('generateTipContentFromVideo_ShouldThrowError_WhenBothModelsFail', async () => {
      const mockPrimaryModel = {
        generateContent: vi.fn().mockRejectedValue(new Error('Primary model failed')),
      };
      
      const mockFallbackModel = {
        generateContent: vi.fn().mockRejectedValue(new Error('Fallback model failed')),
      };
      
      const mockGenAI = {
        getGenerativeModel: vi.fn()
          .mockReturnValueOnce(mockPrimaryModel)
          .mockReturnValueOnce(mockFallbackModel),
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(GoogleGenerativeAI).mockImplementation(function(this: any) {
        return mockGenAI;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_API_ERROR
      );
      
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledTimes(2);
    });

    it('generateTipContentFromVideo_ShouldTrimWhitespace_WhenValidatingFields', async () => {
      const responseWithWhitespace = {
        title: '  Test Life Hack  ',
        description: '  This is a test description.  ',
        steps: [
          { stepNumber: 1, description: '  First step.  ' },
        ],
        tags: ['  tag1  ', '  tag2  '],
        videoUrl: validYouTubeUrl,
      };
      
      const mockModel = createMockModel(JSON.stringify(responseWithWhitespace));
      setupMockGenAI(mockModel);

      const result = await generateTipContentFromVideo(validYouTubeUrl);

      expect(result).toEqual(responseWithWhitespace);
    });

    it('generateTipContentFromVideo_ShouldValidateStepStructure_WhenMissingStepNumber', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: [{ description: 'Missing step number' }],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldValidateStepStructure_WhenMissingDescription', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: [{ stepNumber: 1 }],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldValidateStepStructure_WhenStepNotObject', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: ['not an object'],
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldValidateTagsArray_WhenNotArray', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        tags: 'not an array',
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });

    it('generateTipContentFromVideo_ShouldValidateStepsArray_WhenNotArray', async () => {
      const invalidResponse = {
        ...mockValidResponse,
        steps: 'not an array',
      };
      
      const mockModel = createMockModel(JSON.stringify(invalidResponse));
      setupMockGenAI(mockModel);

      await expect(generateTipContentFromVideo(validYouTubeUrl)).rejects.toThrow(
        ERROR_MESSAGES.GEMINI_INVALID_RESPONSE
      );
    });
  });
});
