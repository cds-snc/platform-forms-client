export type CaptchaLogger = {
  info?: (message: string) => void;
  warn?: (message: string) => void;
};

export type HCaptchaVerificationResult =
  | { verified: true; score?: number }
  | {
      verified: false;
      reason:
        "missing-token" | "missing-secret" | "invalid-response" | "score-too-high" | "api-error";
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

  if (captchaData["error-codes"] || typeof captchaData.success !== "boolean") {
    logger?.info?.("hCaptcha: verification returned an invalid or rejected response");
    return { verified: false, reason: "invalid-response" };
  }

  const score = captchaData.score;
  const verificationSucceeded = captchaData.success;
  const scorePolicyConfigured = maxAllowedScore !== undefined;

  if (verificationSucceeded && scorePolicyConfigured) {
    const scoreIsMissing = typeof score !== "number";
    const scoreExceedsLimit = !scoreIsMissing && score > maxAllowedScore;

    if (scoreIsMissing || scoreExceedsLimit) {
      return { verified: false, reason: "score-too-high" };
    }
  }

  return captchaData.success
    ? { verified: true, score }
    : { verified: false, reason: "invalid-response" };
};

type VerificationAttemptResult = { response?: Response; error?: unknown };

const HCAPTCHA_SITE_VERIFY_URL = "https://api.hcaptcha.com/siteverify";
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 10000;

// Retry logic with progressive backoff for transient errors (network issues, 5xx responses)
const verifyWithRetry = (
  requestBody: URLSearchParams,
  fetchImpl: typeof fetch,
  logger: CaptchaLogger | undefined,
  maxAttempts: number,
  attempt = 1,
  retryDelay = RETRY_BASE_DELAY_MS
): Promise<VerificationAttemptResult> =>
  fetchImpl(HCAPTCHA_SITE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: requestBody,
    signal: AbortSignal.timeout(5000),
  })
    .then((response) => {
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return { response };
      }

      if (attempt >= maxAttempts) {
        return { response };
      }

      logger?.info?.(`hCaptcha: verification attempt ${attempt} failed`);
      return new Promise((resolve) => setTimeout(resolve, retryDelay)).then(() =>
        verifyWithRetry(
          requestBody,
          fetchImpl,
          logger,
          maxAttempts,
          attempt + 1,
          Math.min(retryDelay * 2, RETRY_MAX_DELAY_MS)
        )
      );
    })
    .catch((error) => {
      if (attempt >= maxAttempts) {
        return { error };
      }

      logger?.info?.(`hCaptcha: verification attempt ${attempt} failed`);
      return new Promise((resolve) => setTimeout(resolve, retryDelay)).then(() =>
        verifyWithRetry(
          requestBody,
          fetchImpl,
          logger,
          maxAttempts,
          attempt + 1,
          Math.min(retryDelay * 2, RETRY_MAX_DELAY_MS)
        )
      );
    });
