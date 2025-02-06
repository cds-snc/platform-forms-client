"use client";

export const hCaptchaEnabled = (featureFlag: boolean, isPreview: boolean = false) => {
  // @TODO enable below development check before this goes into review
  // @TODO add back the feature flag check when going to staging
  if (
    /*process.env.NODE_ENV === "development" ||*/
    process.env.NEXT_PUBLIC_APP_ENV === "test" ||
    isPreview ||
    !featureFlag
  ) {
    return false;
  }

  return true;
};
