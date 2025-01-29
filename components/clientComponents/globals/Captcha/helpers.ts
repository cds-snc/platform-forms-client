"use server";
import axios from "axios";
import { getClientIP } from "@lib/ip";
import { logMessage } from "@lib/logger";

// TODO any ideas to protect/* this public end point?

/**
 * Verifties the client hCaptcha token is valid using the hCaptcha API
 * For more info see  https://docs.hcaptcha.com/#verify-the-user-response-server-side
 * @param token Client captcha token to verify
 * @returns boolean true if the token is valid, false otherwise
 */
export const verifyHCaptchaToken = async (token: string): Promise<boolean> => {
  const { siteVerifyKey } = await getHCaptchaSettings();

  // API expects data to be sent in the request body (not default axios of params)
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
    logMessage.error(error);
    throw error.message; // TODO sanitize anything?
  });

  const captchaData: { success?: boolean; "error-codes"?: string[] } = result.data;
  if (captchaData && captchaData["error-codes"]) {
    logMessage.error(`Captcha error: ${JSON.stringify(captchaData["error-codes"])}`);
    return false;
  }

  return captchaData?.success === true;
};

// TODO instead just log the error and return an empty string? - probably not worth crashing the app?
export const getHCaptchaSettings = async () => {
  if (!process.env.HCAPTCHA_SITE_VERIFY_KEY) {
    throw new Error("No value set for hCaptcha Site Verify Key");
  }

  if (!process.env.HCAPTCHA_SITE_KEY) {
    throw new Error("hCaptcha Site Key is not set");
  }

  return {
    siteVerifyKey: process.env.HCAPTCHA_SITE_VERIFY_KEY,
    hCaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY,
  };
};
