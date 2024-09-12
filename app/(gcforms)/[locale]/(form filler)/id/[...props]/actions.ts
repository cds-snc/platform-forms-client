"use server";
import { PublicFormRecord, Responses, SubmissionRequestBody } from "@lib/types";
import { buildFormDataObject } from "./lib/buildFormDataObject";
import { parseRequestData } from "./lib/parseRequestData";
import { processFormData } from "./lib/processFormData";
import { MissingFormDataError, MissingFormIdError } from "./lib/exceptions";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { getClientIP } from "@lib/ip";
import { getAppSetting } from "@lib/appSettings";

export async function submitForm(
  values: Responses,
  language: string,
  formRecord: PublicFormRecord
): Promise<{ id: string; error?: Error }> {
  try {
    const formDataObject = buildFormDataObject(formRecord, values);

    if (!formDataObject.formID) {
      throw new MissingFormIdError("No form ID submitted with request");
    }

    if (Object.entries(formDataObject).length <= 2) {
      throw new MissingFormDataError("No form data submitted with request");
    }

    const data = await parseRequestData(formDataObject as SubmissionRequestBody);

    await processFormData(data.fields, data.files, language);

    return { id: formRecord.id };
  } catch (e) {
    logMessage.error(
      `Could not submit response for form ${formRecord.id}. Received error: ${(e as Error).message}`
    );

    return { id: formRecord.id, error: { name: (e as Error).name, message: (e as Error).message } };
  }
}

/**
 * Test the Client Captcha token is valid using the hCaptcha API
 *
 * For more info:
 * -Request flow https://docs.hcaptcha.com/#verify-the-user-response-server-side
 *
 * @param token Client captcha token to verify
 * @returns boolean true if the token is valid, false otherwise
 */
export const verifyHCaptchaToken = async (token: string) => {
  // TODO any case(s) where a user should be authorized?

  // TODO move action out of Forms to be more reusable e.g. contact form, support form, etc.

  // TODO: double check hcaptcha urls correctly added to CSP header

  const result = await axios({
    url: "https://api.hcaptcha.com/siteverify",
    method: "POST",
    data: {
      secret: await getAppSetting("hCaptchaSecretKey"), // TODO move from a setting to a secret, cache it?
      response: token,
      remoteip: await getClientIP(),
    },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0, // TODO: Daaang that's a long delay?
  })
    // TODO - Should the error be sanitized for any private info before throwing/logging?
    .catch((error) => {
      logMessage.error(error);
      throw error.message;
    });

  // TODO:TEMP
  logMessage.info(`
    ========================================
    ClientIp: ${await getClientIP()}, token: ${token}
    Captcha result: ${JSON.stringify(result.data)}
    ========================================
  `);

  const captchaData: { success?: boolean; "error-codes"?: string[] } = result.data;
  if (captchaData && captchaData["error-codes"]) {
    logMessage.error(`Captcha error: ${JSON.stringify(captchaData["error-codes"])}`);
    // return false;
    return `Captcha error: ${JSON.stringify(captchaData)}`;
  }

  // return captchaData?.success === true;
  return `Captcha success: ${JSON.stringify(captchaData)}`;
};
