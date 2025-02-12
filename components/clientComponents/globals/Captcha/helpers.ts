"use client";

export const hCaptchaEnabled = (featureFlag: boolean, isPreview: boolean = false) => {
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
