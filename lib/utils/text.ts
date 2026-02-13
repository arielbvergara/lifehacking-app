/**
 * Truncates text to a maximum length and appends an ellipsis if truncated.
 * 
 * @param text - The text to truncate
 * @param maxLength - The maximum length before truncation (default: 100)
 * @returns The truncated text with ellipsis if it exceeds maxLength, otherwise the original text
 * 
 * @example
 * truncateText("Hello world", 5) // "Hello..."
 * truncateText("Hi", 10) // "Hi"
 * truncateText("", 10) // ""
 */
export function truncateText(text: string, maxLength: number = 100): string {
  // Handle edge cases
  if (!text || text.length === 0) {
    return text;
  }

  if (text.length <= maxLength) {
    return text;
  }

  // Truncate and add ellipsis
  return text.substring(0, maxLength) + '...';
}

/**
 * Truncates text for breadcrumb display
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 30)
 * @returns Truncated text with ellipsis
 * 
 * @example
 * truncateForBreadcrumb("How to Peel Garlic in 10 Seconds", 20) // "How to Peel Garlic..."
 * truncateForBreadcrumb("Short", 30) // "Short"
 */
export function truncateForBreadcrumb(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
