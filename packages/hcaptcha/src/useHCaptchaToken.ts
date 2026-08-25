"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useCallback, useRef } from "react";
import type { RefObject } from "react";

export const useHCaptchaToken = (
  captchaTokenRef?: RefObject<string>,
  hCaptchaRef?: RefObject<HCaptcha | null>
) => {
  const tokenTimestampRef = useRef<number | null>(null);

  const setToken = useCallback(
    (token: string) => {
      if (captchaTokenRef) {
        captchaTokenRef.current = token;
        tokenTimestampRef.current = Date.now();
      }
    },
    [captchaTokenRef]
  );

  const resetToken = useCallback(() => {
    const tokenAge = tokenTimestampRef.current
      ? (Date.now() - tokenTimestampRef.current) / 1000
      : "unknown";

    if (captchaTokenRef) captchaTokenRef.current = "";
    hCaptchaRef?.current?.resetCaptcha();
    tokenTimestampRef.current = null;

    return tokenAge;
  }, [captchaTokenRef, hCaptchaRef]);

  return { setToken, resetToken };
};
