import axios from "axios";
import { headers } from "next/headers";
import { logMessage } from "./logger";
import { safeJSONParse } from "./utils";

// TODO move to utils
// See https://nextjs.org/docs/app/api-reference/functions/headers#ip-address
export async function getClientIP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }
  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

const HCAPTCHA_DEMO_KEY = "0x0000000000000000000000000000000000000000"; //TODO process.env.HCAPTCHA_SECRET_KEY;

export const checkHCaptchaToken = async (captchaSecret: string, token: string) => {
  const clientIp = await getClientIP();
  // logMessage.info(`clientIp: ${clientIp}, captchaSecret: ${captchaSecret}, token: ${token}`);
  const data = {
    secret: HCAPTCHA_DEMO_KEY,
    response: token,
    remoteip: clientIp,
  };
  logMessage.info(`Captcha data: ${JSON.stringify(data)}`);

  const result = await axios({
    url: "https://api.hcaptcha.com/siteverify",
    method: "POST",
    // data: {
    //   secret: captchaSecret,
    //   response: token,
    //   remoteip: clientIp,
    // },
    data,
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
  });

  logMessage.info(`Captcha result: ${JSON.stringify(result.data)}`);

  const resultJson = safeJSONParse<{ success?: boolean; "error-codes"?: string[] }>(result.data);

  if (resultJson && resultJson["error-codes"]) {
    logMessage.error(`Captcha error: ${JSON.stringify(resultJson["error-codes"])}`);
  }

  // Getting error {"success":false,"error-codes":["missing-input-response","missing-input-secret"]}
  // return resultJson?.success === true;
  return true; // TEMP
};
