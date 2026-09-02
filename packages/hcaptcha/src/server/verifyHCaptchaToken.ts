export type CaptchaLogger = {
  info?: (message: string) => void;
  warn?: (message: string) => void;
};

export type HCaptchaVerificationResult =
  | { verified: true; score?: number }
  | {
      verified: false;
      reason:
        | "missing-token"
        | "missing-secret"
        | "invalid-response"
        | "score-too-high"
        | "score-missing"
        | "api-error";
    };

export type VerifyHCaptchaTokenOptions = {
  secret: string | undefined;
  remoteIp?: string;
  logger?: CaptchaLogger;
  maxAllowedScore?: number;
  maxAttempts?: number;
  fetchImpl?: typeof fetch;
};

type HCaptchaResponse = {
  success?: boolean;
  score?: number;
  "error-codes"?: string[];
};

const DEFAULT_MAX_ATTEMPTS = 3;

export const verifyHCaptchaToken = async (
  token: string | undefined,
  options: VerifyHCaptchaTokenOptions
): Promise<HCaptchaVerificationResult> => {
  const {
    secret,
    remoteIp,
    logger,
    maxAllowedScore,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    fetchImpl = fetch,
  } = options;

  if (!token) {
    logger?.info?.("hCaptcha: missing token");
    return { verified: false, reason: "missing-token" };
  }

  if (!secret) {
    logger?.info?.("hCaptcha: missing site verify secret");
    return { verified: false, reason: "missing-secret" };
  }

  const requestBody = new URLSearchParams({ secret, response: token });
  if (remoteIp) {
    requestBody.set("remoteip", remoteIp);
  }

  const { response, error } = await verifyWithRetry(requestBody, fetchImpl, logger, maxAttempts);

  if (!response || response.status >= 500) {
    logger?.warn?.(`hCaptcha: verification request failed${error ? `: ${String(error)}` : ""}`);
    return { verified: false, reason: "api-error" };
  }

  let captchaData: HCaptchaResponse;
  try {
    captchaData = (await response.json()) as HCaptchaResponse;
  } catch {
    logger?.warn?.("hCaptcha: invalid verification response");
    return { verified: false, reason: "invalid-response" };
  }

  // Treat the provider response as untrusted input and fail closed for malformed payloads
  if (
    !captchaData ||
    typeof captchaData !== "object" ||
    captchaData["error-codes"] ||
    typeof captchaData.success !== "boolean"
  ) {
    logger?.info?.("hCaptcha: verification returned an invalid or rejected response");
    return { verified: false, reason: "invalid-response" };
  }

  const score = captchaData.score;
  const verificationSucceeded = captchaData.success;

  if (!verificationSucceeded) {
    logger?.info?.("hCaptcha: verification failed");
    return { verified: false, reason: "invalid-response" };
  }

  // A score is optional when no score limit is configured
  if (maxAllowedScore === undefined) {
    return { verified: true, score };
  }

  if (typeof score !== "number") {
    logger?.info?.("hCaptcha: verification response was missing a score");
    return { verified: false, reason: "score-missing" };
  }

  if (score > maxAllowedScore) {
    logger?.info?.(`hCaptcha: verification score ${score} exceeded limit ${maxAllowedScore}`);
    return { verified: false, reason: "score-too-high" };
  }

  return { verified: true, score };
};

type VerificationAttemptResult = { response?: Response; error?: unknown };

const HCAPTCHA_SITE_VERIFY_URL = "https://api.hcaptcha.com/siteverify";
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 10000;

// Retries network failures and 5xx responses with exponential backoff, while treating 4xx
// responses as final provider rejections. Returns the final result instead of throwing.
const verifyWithRetry = (
  requestBody: URLSearchParams,
  fetchImpl: typeof fetch,
  logger: CaptchaLogger | undefined,
  maxAttempts: number
): Promise<VerificationAttemptResult> => {
  // Ensure there is always an initial verification attempt
  const attempts = Math.max(1, maxAttempts);

  // Chain attempts so each retry waits for the previous request to finish
  return Array.from({ length: attempts - 1 }).reduce<Promise<VerificationAttemptResult>>(
    (previousAttempt, _, retryIndex) =>
      previousAttempt.then((attemptResult) => {
        if (isNonRetryableResponse(attemptResult.response)) {
          return attemptResult;
        }

        const attempt = retryIndex + 1;
        logger?.info?.(`hCaptcha: verification attempt ${attempt} failed`);

        // Cap the exponential delay to keep retries from waiting indefinitely
        const currentRetryDelay = Math.min(
          RETRY_BASE_DELAY_MS * 2 ** retryIndex,
          RETRY_MAX_DELAY_MS
        );

        return wait(currentRetryDelay).then(() => verifyAttempt(requestBody, fetchImpl));
      }),
    verifyAttempt(requestBody, fetchImpl)
  );
};

const verifyAttempt = async (
  requestBody: URLSearchParams,
  fetchImpl: typeof fetch
): Promise<VerificationAttemptResult> => {
  try {
    return {
      response: await fetchImpl(HCAPTCHA_SITE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: requestBody,
        signal: AbortSignal.timeout(5000),
      }),
    };
  } catch (error) {
    // Return request errors as data so the retry loop can handle them
    return { error };
  }
};

const isNonRetryableResponse = (response?: Response) => {
  return Boolean(response?.ok || (response && response.status >= 400 && response.status < 500));
};

const wait = (milliseconds: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
};
