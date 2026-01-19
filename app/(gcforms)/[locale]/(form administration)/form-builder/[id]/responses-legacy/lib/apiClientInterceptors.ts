import type { AxiosInstance } from "axios";

/**
 * Adds a response interceptor to track rate limit headers from the API.
 * Updates the rateLimitRemaining counter when x-ratelimit-remaining header is present.
 */
export const addRateLimitTrackingInterceptor = (
  httpClient: AxiosInstance,
  updateRateLimit: (remaining: number) => void
) => {
  httpClient.interceptors.response.use((response) => {
    const headers = response.headers as Record<string, string | string[]>;
    const remaining = headers["x-ratelimit-remaining"];
    if (remaining !== undefined && typeof remaining === "string") {
      const parsed = parseInt(remaining, 10);
      if (!Number.isNaN(parsed)) {
        updateRateLimit(parsed);
      }
    }
    return response;
  });
};
