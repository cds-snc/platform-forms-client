const SUSPICIOUS_HCAPTCHA_ERROR_CODES = new Set(["invalid-data", "invalid-input-response"]);

export const isSuspiciousHCaptchaError = (code: string) => {
  return SUSPICIOUS_HCAPTCHA_ERROR_CODES.has(code);
};
