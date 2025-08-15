import axios from "axios";
import { getClientIP } from "@lib/ip";
import { logMessage } from "@lib/logger";
import { withRetryFallback } from "../utils/retry";

/**
 * Verifies the client hCaptcha token is valid using the hCaptcha API
 *
 * @param token captcha token to verify
 * @returns boolean true if the token is valid
 */
export const verifyHCaptchaToken = async (token: string): Promise<boolean> => {
  if (!token) {
    logMessage.info(`hCaptcha: client error missing token`);
    return false;
  }

  const siteVerifyKey = process.env.HCAPTCHA_SITE_VERIFY_KEY;
  if (!siteVerifyKey) {
    logMessage.info(`hCaptcha: missing siteVerifyKey`);
    return false;
  }

  // API expects data to be sent in the request body
  const data = new FormData();
  data.append("secret", siteVerifyKey);
  data.append("response", String(token));
  data.append("remoteip", String(await getClientIP()));

  const clientIP = await getClientIP(); // Get IP once before the retry logic

  const result = await withRetryFallback(
    async () => {
      return axios({
        url: "https://api.hcaptcha.com/siteverify",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data,
        timeout: 5000,
      });
    },
    null, // fallback value if all retries fail
    {
      maxRetries: 3,
      onRetry: (attempt, error) => {
        logMessage.warn(`hCaptcha: attempt ${attempt} failed - ${error}`);
      },
      onFinalFailure: (error, totalAttempts) => {
        // Log comprehensive failure information
        logMessage.error(
          `hCaptcha: All ${totalAttempts} retry attempts failed. Final error: ${error}`
        );
        logMessage.error(`hCaptcha: Token: ${token?.substring(0, 10)}...`);
        logMessage.error(`hCaptcha: Client IP: ${clientIP}`);

        // Perform specific actions on final failure
        // Examples:
        // - Send metrics/telemetry
        // - Trigger alerts
        // - Log to external monitoring systems
        // - Record failure statistics

        // You could add metrics here:
        // metrics.increment('hcaptcha.final_failure');
        // alerting.sendAlert('hCaptcha API completely failed');
      },
      shouldRetry: (error) => {
        const err = error as { response?: { status?: number } };
        // Retry on network errors or 5xx server errors, but not on 4xx client errors
        return !err.response || (err.response.status !== undefined && err.response.status >= 500);
      },
    }
  );

  if (!result) {
    logMessage.error(`hCaptcha: API call failed after retries, allowing submission`);
    return true;
  }

  // 4XX request error, want to fail. See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const captchaData: { success: boolean; score: number; "error-codes"?: string[] } = result.data;

  if (!captchaData) {
    logMessage.warn(`hCaptcha: missing captchaData`);
    return false;
  }

  if (captchaData["error-codes"]) {
    logMessage.info(`hCaptcha: client error ${JSON.stringify(captchaData["error-codes"])}`);
    return false;
  }

  const verified = checkIfVerified(captchaData.success, captchaData.score);

  if (!verified) {
    logMessage.info(`hCaptcha: failed with score ${captchaData.score}`);
    return false;
  }

  logMessage.info(`hCaptcha: passed with score ${captchaData.score}`);
  return true;
};

/**
 * Looks at the success and score to determine a pass or fail. Currently, we are only
 * taking the action of blocking users for highly suspicious scores above 0.79.
 * We can tweak the score over time.
 * See https://docs.hcaptcha.com/enterprise#handling-siteverify-responses
 * @param success
 * @param score
 * @returns
 */
const checkIfVerified = (success: boolean, score: number) => {
  if (score > 0.79) {
    // Suspicious score, retun a fail
    return false;
  }
  if (!success) {
    // Token is expired or invalid
    logMessage.info(`hCaptcha: token expired or invalid`);
    return false;
  }
  // Verified success
  return true;
};
