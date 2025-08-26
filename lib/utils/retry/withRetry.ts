import { logMessage } from "@lib/logger";

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: unknown) => void;
  shouldRetry?: (error: unknown) => boolean;
  onFinalFailure?: (error: unknown, totalAttempts: number) => void;
}

/**
 * Executes a function with retry logic and exponential backoff
 * @param fn Function to execute
 * @param options Retry configuration options
 * @returns Promise that resolves with the function result or rejects after all retries
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
    shouldRetry = () => true,
    onFinalFailure,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        // Call the final failure callback if provided
        if (onFinalFailure) {
          onFinalFailure(error, attempt);
        }
        throw error;
      }

      const delay = Math.min(2 ** (attempt - 1) * baseDelay, maxDelay);

      if (onRetry) {
        onRetry(attempt, error);
      } else {
        logMessage.warn(`Retry attempt ${attempt} failed - ${error}, retrying in ${delay}ms`);
      }

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Executes a function with retry logic, but returns a fallback value instead of throwing on failure
 * @param fn Function to execute
 * @param fallbackValue Value to return if all retries fail
 * @param options Retry configuration options
 * @returns Promise that resolves with the function result or fallback value
 */
export async function withRetryFallback<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await withRetry(fn, options);
  } catch (error) {
    // All retry attempts failed, return fallback value
    return fallbackValue;
  }
}
