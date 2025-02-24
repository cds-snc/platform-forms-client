"use server";
import axios from "axios";
import { getClientIP } from "@lib/ip";
import { logMessage } from "@lib/logger";
import { redirect } from "next/navigation";

/**
 * Verifies the client hCaptcha token is valid using the hCaptcha API
 *
 * @param token captcha token to verify
 * @returns boolean true if the token is valid, false otherwise
 */
export const verifyHCaptchaToken = async (
  token: string,
  lang: string,
  blockableMode: boolean
): Promise<boolean | void> => {
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
    logMessage.error(
      `hCaptcha: client error. Error: ${JSON.stringify(captchaData["error-codes"])}`
    );
    !blockableMode && redirect(`/${lang}/unable-to-process`);
  }

  const verified = checkIfVerified(captchaData.success, captchaData.score);
  if (!verified) {
    logMessage.info(
      `hCaptcha: failed verification. Success=${captchaData.success}, Score=${captchaData.score}`
    );
    !blockableMode && redirect(`/${lang}/unable-to-process`);
  }

  logMessage.info(
    `hCaptcha: passed verification. Success=${captchaData.success}, Score=${captchaData.score}`
  );
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
