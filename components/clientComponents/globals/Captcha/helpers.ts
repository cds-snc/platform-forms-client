import axios from "axios";
import { getClientIP } from "@lib/ip";
import { getAppSetting } from "@lib/appSettings";
import { logMessage } from "@lib/logger";

/**
 * Test the Client Captcha token is valid using the hCaptcha API
 * For more info see  https://docs.hcaptcha.com/#verify-the-user-response-server-side
 * @param token Client captcha token to verify
 * @returns boolean true if the token is valid, false otherwise
 */
export const verifyHCaptchaToken = async (token: string): Promise<boolean> => {
  // TODO any case(s) where a user should be authorized?
  // TODO move action out of Forms to be more reusable e.g. contact form, support form, etc.
  // TODO double check hcaptcha urls correctly added to CSP header

  // API expects data to be sent in the request body (not default axios of params)
  const data = new FormData();
  data.append("secret", String(await getAppSetting("hCaptchaSecretKey")));
  data.append("response", String(token));
  data.append("remoteip", String(await getClientIP()));

  const result = await axios({
    url: "https://api.hcaptcha.com/siteverify",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0, // TODO right delay?
  }).catch((error) => {
    logMessage.error(error);
    throw error.message; // TODO sanitize?
  });

  const captchaData: { success?: boolean; "error-codes"?: string[] } = result.data;
  if (captchaData && captchaData["error-codes"]) {
    logMessage.error(`Captcha error: ${JSON.stringify(captchaData["error-codes"])}`); // TODO remove
    return false;
  }

  return captchaData?.success === true;
};
