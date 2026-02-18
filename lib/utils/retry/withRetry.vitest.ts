import { vi } from "vitest";
import { withRetry, withRetryFallback } from "./withRetry";

// Mock the logger
vi.mock("@lib/logger", () => ({
  logMessage: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("withRetry", () => {
  it("should return result on first successful attempt", async () => {
    vi.clearAllMocks();
    const mockFn = vi.fn().mockResolvedValue("success");

    const result = await withRetry(mockFn);

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and eventually succeed", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("attempt 1"))
      .mockRejectedValueOnce(new Error("attempt 2"))
      .mockResolvedValue("success");

    const promise = withRetry(mockFn);

    // Fast-forward through the delays
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(3);
    
    vi.useRealTimers();
  });

  it("should exhaust retries and fail appropriately", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    const error = new Error("persistent failure");
    const mockFn = vi.fn().mockRejectedValue(error);

    // Test with fallback to avoid unhandled promise rejection
    const promise = withRetryFallback(mockFn, "fallback", { maxRetries: 2 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("fallback");
    expect(mockFn).toHaveBeenCalledTimes(2);
    
    vi.useRealTimers();
  });

  it("should call onRetry callback when provided", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("attempt 1"))
      .mockResolvedValue("success");

    const onRetry = vi.fn();

    const promise = withRetry(mockFn, { onRetry });

    await vi.runAllTimersAsync();

    await promise;

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    
    vi.useRealTimers();
  });

  it("should respect shouldRetry function", async () => {
    vi.clearAllMocks();
    
    const error = new Error("non-retryable");
    const mockFn = vi.fn().mockRejectedValue(error);

    const shouldRetry = vi.fn().mockReturnValue(false);

    await expect(withRetry(mockFn, { isRetryable: shouldRetry })).rejects.toThrow("non-retryable");
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(error);
  });

  it("should call onFinalFailure callback when all retries fail", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    const error = new Error("final failure");
    const mockFn = vi.fn().mockRejectedValue(error);
    const onFinalFailure = vi.fn();

    // Execute withRetry and expect it to reject
    const retryPromise = withRetry(mockFn, { maxRetries: 2, onFinalFailure });
    
    // Fast-forward through the delays and await the rejection simultaneously
    const [rejectionResult] = await Promise.allSettled([
      retryPromise,
      vi.runAllTimersAsync()
    ]);
    
    // Verify the promise was rejected with the expected error
    expect(rejectionResult.status).toBe('rejected');
    if (rejectionResult.status === 'rejected') {
      expect(rejectionResult.reason).toEqual(error);
    }

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(onFinalFailure).toHaveBeenCalledTimes(1);
    expect(onFinalFailure).toHaveBeenCalledWith(error, 2);
    
    vi.useRealTimers();
  });
});

describe("withRetryFallback", () => {
  it("should return result on success", async () => {
    vi.clearAllMocks();
    
    const mockFn = vi.fn().mockResolvedValue("success");

    const result = await withRetryFallback(mockFn, "fallback");

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should return fallback value after all retries fail", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    const mockFn = vi.fn().mockRejectedValue(new Error("failure"));

    const promise = withRetryFallback(mockFn, "fallback", { maxRetries: 2 });

    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toBe("fallback");
    expect(mockFn).toHaveBeenCalledTimes(2);
    
    vi.useRealTimers();
  });

  it("should call onFinalFailure callback when all retries fail", async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    const error = new Error("final failure");
    const mockFn = vi.fn().mockRejectedValue(error);
    const onFinalFailure = vi.fn();

    const promise = withRetryFallback(mockFn, "fallback", { 
      maxRetries: 2, 
      onFinalFailure 
    });

    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toBe("fallback");
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(onFinalFailure).toHaveBeenCalledTimes(1);
    expect(onFinalFailure).toHaveBeenCalledWith(error, 2);
    
    vi.useRealTimers();
  });
});
