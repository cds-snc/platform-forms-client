import type { AxiosInstance } from "axios";

/**
 * Adds a request interceptor to simulate API errors for development/testing.
 *
 * Reads from sessionStorage key 'gcforms_simulate_error' and forces requests to fail:
 * - Numeric values (e.g., '500', '429') simulate HTTP status errors
 * - 'network' simulates a network/connection error
 * - 'abort' simulates request cancellation
 *
 * Use with the window helpers exposed by useApiDebug():
 *   window.gcformsSimulateError('500')
 *   window.gcformsSimulateClear()
 */
export const addErrorSimulationInterceptor = (httpClient: AxiosInstance) => {
  httpClient.interceptors.request.use(
    (config) => {
      try {
        if (typeof window === "undefined") return config;

        const simulate = sessionStorage.getItem("gcforms_simulate_error");
        if (!simulate) return config;

        // Simulate cancellation (axios.isCancel looks for __CANCEL__ flag)
        if (simulate === "abort") {
          const err = new Error("Simulated request abort");
          // Mark the error shape so axios.isCancel will treat it as a cancellation
          (err as unknown as Record<string, unknown>)["__CANCEL__"] = true;
          return Promise.reject(err);
        }

        // Simulate network error (no response)
        if (simulate === "network") {
          return Promise.reject({ message: "Simulated network error", code: "ENOTFOUND" });
        }

        // Simulate HTTP status codes by rejecting with a response-like shape
        const status = parseInt(simulate, 10);
        if (!Number.isNaN(status)) {
          return Promise.reject({ response: { status, statusText: `Simulated ${status}` } });
        }
      } catch (e) {
        // ignore and proceed
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};

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
