import * as Sentry from "@sentry/nextjs";

/**
 * Capture an exception and send it to Sentry
 * @param error - The error to capture
 * @param context - Additional context to attach to the error
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
) {
  if (context) {
    Sentry.setContext("additional_context", context);
  }
  Sentry.captureException(error);
}

/**
 * Create a span for tracking performance of an operation
 * @param operation - The operation type (e.g., "http.client", "ui.click")
 * @param name - A descriptive name for the span
 * @param callback - The function to execute within the span
 * @param attributes - Additional attributes to attach to the span
 */
export async function withSpan<T>(
  operation: string,
  name: string,
  callback: (span: Sentry.Span) => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return Sentry.startSpan(
    {
      op: operation,
      name,
    },
    (span) => {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
      return callback(span);
    }
  );
}

/**
 * Get the Sentry logger instance
 */
export const { logger } = Sentry;
