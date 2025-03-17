"use client";

import { logMessage } from "@lib/logger";

export const hCaptchaEnabled = (featureFlag: boolean, isPreview: boolean = false) => {
  if (process.env.NODE_ENV === "development" && featureFlag) {
    logMessage.info(`hCaptcha: flag is enabled but running in development envirnoment. 
      Remember to setup hCAPTHCA and comment out this and the below check.`);
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_APP_ENV === "test" ||
    isPreview ||
    !featureFlag
  ) {
    return false;
  }

  return true;
};
