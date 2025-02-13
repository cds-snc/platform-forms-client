"use server";
import axios from "axios";
import { getClientIP } from "@lib/ip";
import { logMessage } from "@lib/logger";

/**
 * Verifies the client hCaptcha token is valid using the hCaptcha API
 *
 * @param token Client captcha token to verify
 * @returns boolean true if the token is valid, false otherwise
 */
export const verifyHCaptchaToken = async (token: string): Promise<boolean> => {
  const siteVerifyKey = process.env.HCAPTCHA_SITE_VERIFY_KEY;

  if (!siteVerifyKey) {
    throw new Error("hCaptcha siteVerifyKey is not set");
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

  // 4XX request error, want to fail. e.g. site secret mismatch
  // See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const captchaData: { success: boolean; score: number; "error-codes"?: string[] } = result.data;
  if (captchaData && captchaData["error-codes"]) {
    logMessage.error(`hCaptcha Client error: ${JSON.stringify(captchaData["error-codes"])}`);
    return false;
  }

  return checkIfVerified(captchaData.success, captchaData.score);
};

// Looks at the success and score to determine a pass or fail. We can tweak the score over time.
// See https://docs.hcaptcha.com/enterprise#handling-siteverify-responses
const checkIfVerified = (success: boolean, score: number) => {
  if (score >= 0.8) {
    // Session is bad
    return false;
  }
  if (score >= 0.7) {
    // Score is suspicious
    return false;
  }
  if (!success) {
    // Token is expired or invalid
    throw new Error("Token is expired or invalid");
  }
  // Verified success
  return true;
};
