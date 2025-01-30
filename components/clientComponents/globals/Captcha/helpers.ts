export const getHCaptchaSettings = () => {
  // TODO instead just log the error and return an empty string? - probably not worth crashing the app?
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

export const hCaptchaEnabled = (featureFlag: boolean) => {
  // @TODO enable below development check before this goes into review
  if (
    /*process.env.NODE_ENV === "development" ||*/ process.env.NEXT_PUBLIC_APP_ENV === "test" ||
    !featureFlag
  ) {
    return false;
  }

  return true;
};
