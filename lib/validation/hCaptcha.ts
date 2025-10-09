import axios from "axios";
import { allowIp, getClientIP } from "@lib/ip";
import { logMessage } from "@lib/logger";
import { withRetry } from "../utils/retry";

/**
 * Verifies the client hCaptcha token is valid using the hCaptcha API
 *
 * @param token captcha token to verify
 * @returns boolean true if the token is valid
 */
export const verifyHCaptchaToken = async (token: string, formId: string): Promise<boolean> => {
  const clientIp = await getClientIP();
  const allowList = String(process.env.HCAPTCHA_IP_ALLOW_LIST);
  if (allowIp(clientIp, allowList)) {
    logMessage.info(`hCaptcha: bypassed for allow-listed IP for formId ${formId}`);
    return true;
  }

  if (!token) {
    logMessage.info(`hCaptcha: client error missing token for formId ${formId}`);
    return false;
  }

  const siteVerifyKey = process.env.HCAPTCHA_SITE_VERIFY_KEY;
  if (!siteVerifyKey) {
    logMessage.info(`hCaptcha: missing siteVerifyKey for formId ${formId}`);
    return false;
  }

  // API expects data to be sent in the request body
  const data = new FormData();
  data.append("secret", siteVerifyKey);
  data.append("response", String(token));
  data.append("remoteip", String(await getClientIP()));

  const hCaptchaApiUrl = "https://api.hcaptcha.com/siteverify";

  const result = await withRetry(
    async () => {
      return axios({
        url: hCaptchaApiUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data,
        timeout: 5000,
      }).catch((error) => {
        throw new Error(`hCaptcha: ${error.message} for formId ${formId}`);
      });
    },
    {
      maxRetries: 3,
      onRetry: (attempt, error) => {
        logMessage.info(`hCaptcha: attempt ${attempt} failed - ${error} for formId ${formId}`);
      },
      onFinalFailure: async (error, totalAttempts) => {
        // Log comprehensive failure information
        logMessage.info(
          `hCaptcha: ${totalAttempts} retry attempts failed, preventing submission. Final error: ${error} for formId ${formId}`
        );
      },
      isRetryable: (error) => {
        const err = error as { response?: { status?: number } };
        // Retry on network errors or 5xx server errors, but not on 4xx client errors
        return !err.response || (err.response.status !== undefined && err.response.status >= 500);
      },
    }
  );

  // 4XX request error, want to fail. See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const captchaData: { success: boolean; score: number; "error-codes"?: string[] } = result.data;

  if (!captchaData) {
    logMessage.warn(`hCaptcha: missing captchaData for formId ${formId}`);
    return false;
  }

  if (captchaData["error-codes"]) {
    logMessage.info(
      `hCaptcha: client error ${JSON.stringify(captchaData["error-codes"])} for formId ${formId}`
    );
    return false;
  }

  const verified = checkIfVerified(captchaData.success, captchaData.score);

  if (!verified) {
    logMessage.info(`hCaptcha: failed with score ${captchaData.score} for formId ${formId}`);
    return false;
  }

  logMessage.info(`hCaptcha: passed with score ${captchaData.score} for formId ${formId}`);
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
