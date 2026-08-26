export type CaptchaLogger = {
  info?: (message: string) => void;
  warn?: (message: string) => void;
};

export type HCaptchaVerificationResult =
  | { verified: true; score?: number }
  | {
      verified: false;
      reason: "missing-token" | "missing-secret" | "invalid-response" | "api-error";
    };

export type VerifyHCaptchaTokenOptions = {
  secret: string | undefined;
  remoteIp?: string;
  logger?: CaptchaLogger;
  maxAllowedScore?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
};

type HCaptchaResponse = {
  success?: boolean;
  score?: number;
  "error-codes"?: string[];
};

const HCAPTCHA_SITE_VERIFY_URL = "https://api.hcaptcha.com/siteverify";
const DEFAULT_MAX_ALLOWED_SCORE = 0.79;
const DEFAULT_MAX_RETRIES = 3;

export const verifyHCaptchaToken = async (
  token: string | undefined,
  options: VerifyHCaptchaTokenOptions
): Promise<HCaptchaVerificationResult> => {
  const {
    secret,
    remoteIp,
    logger,
    maxAllowedScore = DEFAULT_MAX_ALLOWED_SCORE,
    maxRetries = DEFAULT_MAX_RETRIES,
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
  if (remoteIp) requestBody.set("remoteip", remoteIp);

  const verify = async (attempt: number): Promise<{ response?: Response; error?: unknown }> => {
    try {
      const response = await fetchImpl(HCAPTCHA_SITE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: requestBody,
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return { response };
      }

      if (attempt < maxRetries) {
        logger?.info?.(`hCaptcha: verification attempt ${attempt + 1} failed`);
        return verify(attempt + 1);
      }

      return { response };
    } catch (error) {
      if (attempt < maxRetries) {
        logger?.info?.(`hCaptcha: verification attempt ${attempt + 1} failed`);
        return verify(attempt + 1);
      }

      return { error };
    }
  };

  const { response, error } = await verify(0);

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
  const verified = captchaData.success && (score === undefined || score <= maxAllowedScore);

  return verified ? { verified: true, score } : { verified: false, reason: "invalid-response" };
};
