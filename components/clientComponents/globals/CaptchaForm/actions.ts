"use server";
import axios from "axios";
import { getClientIP } from "@lib/ip";
import { logMessage } from "@lib/logger";

/**
 * Verifies the client hCaptcha token is valid using the hCaptcha API
 *
 * @param token captcha token to verify
 * @returns boolean true if the token is valid
 */
export const verifyHCaptchaToken = async (token: string): Promise<boolean> => {
  if (!token) {
    throw new Error("hCaptcha: missing token");
  }

  const siteVerifyKey = process.env.HCAPTCHA_SITE_VERIFY_KEY;
  if (!siteVerifyKey) {
    throw new Error("hCaptcha: missing siteVerifyKey");
  }

  // API expects data to be sent in the request body
  const data = new FormData();
  data.append("secret", siteVerifyKey);
  data.append("response", String(token));
  data.append("remoteip", String(await getClientIP()));

  const result = await axios({
    url: "https://api.hcaptcha.com/siteverify",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
    timeout: 5000,
  });

  // 4XX request error, want to fail. See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const captchaData: { success: boolean; score: number; "error-codes"?: string[] } = result.data;

  if (!captchaData) {
    logMessage.warn(`hCaptcha: missing captchaData`);
    return false;
  }

  if (captchaData["error-codes"]) {
    logMessage.warn(`hCaptcha: client error ${JSON.stringify(captchaData["error-codes"])}`);
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

// Looks at the success and score to determine a pass or fail. We can tweak the score over time.
// See https://docs.hcaptcha.com/enterprise#handling-siteverify-responses
const checkIfVerified = (success: boolean, score: number) => {
  if (score >= 0.8) {
    // Session is bad - identifying separately for potential future use
    return false;
  }
  if (score >= 0.7) {
    // Score is suspicious - we may want to tweak this to 0.79 if we have too many false positives
    return false;
  }
  if (!success) {
    // Token is expired or invalid
    throw new Error("hCaptcha: token is expired or invalid");
  }
  // Verified success
  return true;
};
