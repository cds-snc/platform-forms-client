"use server";
import axios from "axios";
import { getClientIP } from "@lib/ip";
import { logMessage } from "@lib/logger";
import { getHCaptchaSettings } from "./helpers";

// @TODO public endpoint, any kind of abuse/* to think about?

/**
 * Verifties the client hCaptcha token is valid using the hCaptcha API
 *
 * @param token Client captcha token to verify
 * @returns boolean true if the token is valid, false otherwise
 */
export const verifyHCaptchaToken = async (token: string): Promise<boolean> => {
  const { siteVerifyKey } = getHCaptchaSettings();

  if (!siteVerifyKey) {
    // 5XX error, just pass through
    throw new Error("Missing siteverify key");
  }

  // API expects data to be sent in the request body (not default axios of params)
  // Local IPs will passs but be ignored by session evaluation
  const data = new FormData();
  data.append("secret", siteVerifyKey);
  data.append("response", String(token));
  data.append("remoteip", String(await getClientIP()));

  const result = await axios({
    url: "https://api.hcaptcha.com/siteverify",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0, // TODO right delay? - consider fallback logic
  }).catch((error) => {
    // 5XX error, want to pass through. e.g. siteverify is down
    logMessage.error(error);
    throw error.message; // TODO sanitize anything?
  });

  // 4XX request error, want to fail. e.g. site secret mismatch
  // See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const captchaData: { success: boolean; score: number; "error-codes"?: string[] } = result.data;
  if (captchaData && captchaData["error-codes"]) {
    logMessage.info(`hCaptcha client error: ${JSON.stringify(captchaData["error-codes"])}`);
    return false;
  }

  const verified = determinVerified(captchaData.success, captchaData.score);
  logMessage.info(
    `hCaptcha success=${captchaData.success} score=${captchaData.score} verified=${verified}`
  );
  return verified;
};

// Looks at the success and score to determine a pass or fail. We can tweak the score over time.
// See https://docs.hcaptcha.com/enterprise#handling-siteverify-responses
const determinVerified = (success: boolean, score: number) => {
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
    // TODO: Client should fetch a new token. Just do a redirect or similar?
    throw new Error("Token is expired or invalid");
  }
  // Verified success
  return true;
};
