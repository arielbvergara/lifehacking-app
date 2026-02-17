/**
 * Gemini AI service for generating tip content from video URLs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GeminiTipContent,
  VideoUrlValidation,
} from '@/lib/types/admin-tip';
import {
  VIDEO_URL_PATTERNS,
  ERROR_MESSAGES,
  GEMINI_TIMEOUT_MS,
  TIP_TITLE_MIN_LENGTH,
  TIP_TITLE_MAX_LENGTH,
  TIP_DESCRIPTION_MIN_LENGTH,
  TIP_DESCRIPTION_MAX_LENGTH,
  TIP_STEP_DESCRIPTION_MIN_LENGTH,
  TIP_STEP_DESCRIPTION_MAX_LENGTH,
  TIP_TAG_MIN_LENGTH,
  TIP_TAG_MAX_LENGTH,
  TIP_MAX_TAGS,
  TIP_MIN_STEPS,
} from '@/lib/constants/admin-tip';

/**
 * Validates a video URL and extracts platform and video ID
 */
export function validateVideoUrl(url: string): VideoUrlValidation {
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.VIDEO_URL_REQUIRED,
    };
  }

  const trimmedUrl = url.trim();

  // Check YouTube Watch
  const youtubeWatchMatch = trimmedUrl.match(VIDEO_URL_PATTERNS.YOUTUBE_WATCH);
  if (youtubeWatchMatch) {
    return {
      isValid: true,
      platform: 'youtube',
      videoId: youtubeWatchMatch[1],
    };
  }

  // Check YouTube Shorts
  const youtubeShortsMatch = trimmedUrl.match(VIDEO_URL_PATTERNS.YOUTUBE_SHORTS);
  if (youtubeShortsMatch) {
    return {
      isValid: true,
      platform: 'youtube',
      videoId: youtubeShortsMatch[1],
    };
  }

  // Check Instagram
  const instagramMatch = trimmedUrl.match(VIDEO_URL_PATTERNS.INSTAGRAM);
  if (instagramMatch) {
    return {
      isValid: true,
      platform: 'instagram',
      videoId: instagramMatch[1],
    };
  }

  return {
    isValid: false,
    error: ERROR_MESSAGES.VIDEO_URL_INVALID,
  };
}

/**
 * Validates Gemini response structure and content
 */
function validateGeminiResponse(data: unknown): data is GeminiTipContent {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const content = data as Partial<GeminiTipContent>;

  // Validate title
  if (
    !content.title ||
    typeof content.title !== 'string' ||
    content.title.trim().length < TIP_TITLE_MIN_LENGTH ||
    content.title.trim().length > TIP_TITLE_MAX_LENGTH
  ) {
    return false;
  }

  // Validate description
  if (
    !content.description ||
    typeof content.description !== 'string' ||
    content.description.trim().length < TIP_DESCRIPTION_MIN_LENGTH ||
    content.description.trim().length > TIP_DESCRIPTION_MAX_LENGTH
  ) {
    return false;
  }

  // Validate steps
  if (!Array.isArray(content.steps) || content.steps.length < TIP_MIN_STEPS) {
    return false;
  }

  for (const step of content.steps) {
    if (
      !step ||
      typeof step !== 'object' ||
      typeof step.stepNumber !== 'number' ||
      step.stepNumber < 1 ||
      !step.description ||
      typeof step.description !== 'string' ||
      step.description.trim().length < TIP_STEP_DESCRIPTION_MIN_LENGTH ||
      step.description.trim().length > TIP_STEP_DESCRIPTION_MAX_LENGTH
    ) {
      return false;
    }
  }

  // Validate tags
  if (!Array.isArray(content.tags)) {
    return false;
  }

  if (content.tags.length > TIP_MAX_TAGS) {
    return false;
  }

  for (const tag of content.tags) {
    if (
      typeof tag !== 'string' ||
      tag.trim().length < TIP_TAG_MIN_LENGTH ||
      tag.trim().length > TIP_TAG_MAX_LENGTH
    ) {
      return false;
    }
  }

  // Validate videoUrl
  if (typeof content.videoUrl !== 'string') {
    return false;
  }

  return true;
}

/**
 * Generates tip content from a video URL using Gemini AI
 */
export async function generateTipContentFromVideo(
  videoUrl: string
): Promise<GeminiTipContent> {
  // Validate API key
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.GEMINI_API_KEY_MISSING);
  }

  // Validate video URL
  const validation = validateVideoUrl(videoUrl);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create prompt for tip generation
    const prompt = `Analyze this ${validation.platform} video and generate a life hack tip in JSON format.

Video URL: ${videoUrl}

Generate a JSON response with the following structure:
{
  "title": "A catchy title (5-200 characters)",
  "description": "A detailed description of the life hack (10-2000 characters)",
  "steps": [
    {
      "stepNumber": 1,
      "description": "First step description (10-500 characters)"
    },
    {
      "stepNumber": 2,
      "description": "Second step description (10-500 characters)"
    }
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "videoUrl": "${videoUrl}"
}

Requirements:
- Title: 5-200 characters, engaging and descriptive
- Description: 10-2000 characters, explain what the hack does and why it's useful
- Steps: At least 1 step, each with stepNumber (starting from 1) and description (10-500 characters)
- Tags: 0-10 tags, each 1-50 characters, relevant keywords
- VideoUrl: Must be the exact URL provided

Return ONLY valid JSON, no markdown formatting or additional text.`;

    // Set timeout for Gemini API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      // Generate content
      const result = await model.generateContent(prompt);
      clearTimeout(timeoutId);

      const response = result.response;
      const text = response.text();

      // Parse JSON response
      let parsedContent: unknown;
      try {
        // Remove markdown code blocks if present
        const cleanedText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        parsedContent = JSON.parse(cleanedText);
      } catch {
        throw new Error(ERROR_MESSAGES.GEMINI_INVALID_RESPONSE);
      }

      // Validate response structure
      if (!validateGeminiResponse(parsedContent)) {
        throw new Error(ERROR_MESSAGES.GEMINI_INVALID_RESPONSE);
      }

      return parsedContent;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      if (error.message.includes(ERROR_MESSAGES.GEMINI_API_KEY_MISSING)) {
        throw error;
      }
      if (error.message.includes(ERROR_MESSAGES.GEMINI_INVALID_RESPONSE)) {
        throw error;
      }
    }
    throw new Error(ERROR_MESSAGES.GEMINI_API_ERROR);
  }
}
