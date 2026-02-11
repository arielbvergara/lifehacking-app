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
