"use client";

import { logMessage } from "@lib/logger";

export const hCaptchaEnabled = (
  featureFlag: boolean,
  hCaptchaSiteKey: string,
  isPreview = false
) => {
  if (process.env.NEXT_PUBLIC_APP_ENV === "test" || !featureFlag || isPreview) {
    return false;
  }

  if (process.env.NODE_ENV === "development" && featureFlag && !hCaptchaSiteKey) {
    logMessage.info(`hCaptcha: flag is enabled but hCaptchaSiteKey is missing. This will cause 
      hCaptcha to fail. Add the hCaptchaSiteKey to the App settings and make sure the
      HCAPTCHA_SITE_VERIFY_KEY is in your .env`);
  }

  return true;
};
