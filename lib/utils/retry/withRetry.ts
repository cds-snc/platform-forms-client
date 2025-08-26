import { logMessage } from "@lib/logger";

/**
 * Options for configuring retry behavior.
 *
 * @property maxRetries - The maximum number of retry attempts before giving up. Defaults to 3.
 * @property baseDelay - The initial delay (in milliseconds) before the first retry. Defaults to 1000.
 * @property maxDelay - The maximum delay (in milliseconds) between retries. Defaults to 10000.
 * @property onRetry - Optional callback invoked after each failed attempt, before the next retry. Receives the attempt number and error.
 * @property shouldRetry - Optional function to determine if a retry should occur based on the error. Returns true to retry, false to stop.
 * @property onFinalFailure - Optional callback invoked when all retries have failed. Receives the final error and total attempts.
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: unknown) => void;
  isRetryable?: (error: unknown) => boolean;
  onFinalFailure?: (error: unknown, totalAttempts: number) => void;
}

/**
 * Executes a function with retry logic and exponential backoff
 * @param fn Function to execute
 * @param options Retry configuration options. See {@link RetryOptions} for detailed configuration.
 * @returns Promise that resolves with the function result or rejects after all retries
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
    isRetryable: isRetryable = () => true,
    onFinalFailure,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryable(error)) {
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
 * @param options Retry configuration options. See {@link RetryOptions} for detailed configuration.
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
