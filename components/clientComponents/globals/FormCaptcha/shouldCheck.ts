export const shouldCheckCaptcha = (isPublished: boolean) => {
  const hCaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  const isDevEnvironment = process.env.NODE_ENV === "development";

  if (!hCaptchaSiteKey && isDevEnvironment) {
    return false;
  }

  return process.env.NEXT_PUBLIC_APP_ENV !== "test" && isPublished;
};
