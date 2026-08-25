"use client";

import { useCallback, useRef } from "react";

export type HCaptchaErrorHandlingOptions = {
  onConfigError?: (code: string) => void;
  onError?: (code: string) => void;
  onRecoverableError?: (code: string) => void;
  onSuspiciousError?: (code: string) => void;
  configErrorCodes?: readonly string[];
  suspiciousErrorCodes?: readonly string[];
  resetToken: () => void;
};

const DEFAULT_CONFIG_ERROR_CODES = ["invalid-sitekey", "missing-sitekey"];
const DEFAULT_SUSPICIOUS_ERROR_CODES = ["invalid-data", "invalid-input-response"];

export const useHCaptchaErrorHandling = ({
  onConfigError,
  onError,
  onRecoverableError,
  onSuspiciousError,
  configErrorCodes = DEFAULT_CONFIG_ERROR_CODES,
  suspiciousErrorCodes = DEFAULT_SUSPICIOUS_ERROR_CODES,
  resetToken,
}: HCaptchaErrorHandlingOptions) => {
  const hasFatalErrorRef = useRef(false);

  const onErrorCallback = useCallback(
    (code: string) => {
      if (configErrorCodes.includes(code)) {
        hasFatalErrorRef.current = true;
        onConfigError?.(code);
      } else if (suspiciousErrorCodes.includes(code)) {
        resetToken();
        onSuspiciousError?.(code);
      } else {
        resetToken();
        onRecoverableError?.(code);
      }

      onError?.(code);
    },
    [
      configErrorCodes,
      onConfigError,
      onError,
      onRecoverableError,
      onSuspiciousError,
      resetToken,
      suspiciousErrorCodes,
    ]
  );

  return { onErrorCallback, hasFatalErrorRef };
};
