/**
 * Feed error codes used across the application.
 * Format: "Error: CODE" for API responses, raw CODE for client-side errors.
 */

// API error codes (returned by /api/feed)
export enum FeedError {
  // Category errors
  INVALID_CATEGORY = 'Error: INVALID_CATEGORY',
  INVALID_CATEGORY_NAME = 'Error: INVALID_CATEGORY_NAME',
  CATEGORY_FETCH_FAILED = 'Error: CATEGORY_FETCH_FAILED',

  // Feed errors
  FEED_NOT_FOUND = 'Error: FEED_NOT_FOUND',
  FEED_FETCH_FAILED = 'Error: FEED_FETCH_FAILED',

  // Client-side errors
  EMPTY_RESPONSE = 'Error: EMPTY_RESPONSE',
  NETWORK_ERROR = 'Error: NETWORK_ERROR',
}

// HTTP error prefix (dynamic: "Error: HTTP_ERROR_{status}")
export const HTTP_ERROR_PREFIX = 'Error: HTTP_ERROR_'

/**
 * Build HTTP error message with status code
 */
export function httpError(status: number): string {
  return `${HTTP_ERROR_PREFIX}${status}`
}

/**
 * Check if error message is an HTTP error
 */
export function isHttpError(error: string): boolean {
  return error.startsWith(HTTP_ERROR_PREFIX)
}

/**
 * Extract HTTP status code from error message
 */
export function getHttpStatus(error: string): number | null {
  if (!isHttpError(error)) return null
  const status = parseInt(error.replace(HTTP_ERROR_PREFIX, ''), 10)
  return isNaN(status) ? null : status
}
