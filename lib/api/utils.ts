// Shared API utilities

import { API_TIMEOUT_MS } from '../config/api';
import type { ProblemDetails } from '../types/api';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(public problemDetails: ProblemDetails) {
    super(problemDetails.detail);
    this.name = 'APIError';
  }
}

/**
 * Fetch with timeout support using AbortController
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: API_TIMEOUT_MS)
 * @returns Promise resolving to the parsed JSON response
 * @throws {APIError} When the API returns an error response
 * @throws {Error} When the request times out or network fails
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ProblemDetails = await response.json().catch(() => ({
        type: 'unknown',
        title: 'Request Failed',
        status: response.status,
        detail: response.statusText,
        instance: url,
      }));
      throw new APIError(errorData);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }

    throw error;
  }
}
