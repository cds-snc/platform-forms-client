"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

export type HCaptchaFailureMode = "allow" | "block";

export type UseHCaptchaOptions = {
  captchaEnabled?: boolean;
  /** Controls whether a failed or unavailable CAPTCHA allows the submission to continue. */
  failureMode?: HCaptchaFailureMode;
  language?: string;
  onConfigError?: (code: string) => void;
  /** Fires on every error, after any category-specific callback. */
  onAnyError?: (code: string) => void;
  onCaptchaExpired?: () => void;
  onRecoverableError?: (code: string) => void;
  onSuspiciousError?: (code: string) => void;
  siteKey: string;
};

export type HCaptchaSubmitCallback = (captchaToken: string | undefined) => void;

export type UseHCaptchaResult = {
  /**
   * The hCaptcha component to render alongside the form. It has no visible UI during normal use,
   * but hCaptcha may display a challenge when additional verification is needed.
   */
  captcha: ReactNode;
  /** Starts verification and calls back with a token, or undefined when CAPTCHA is bypassed. */
  execute: (onComplete: HCaptchaSubmitCallback) => void;
  reset: () => void;
  token: string | undefined;
};

const CONFIG_ERROR_CODES = ["invalid-sitekey", "missing-sitekey"];
const SUSPICIOUS_ERROR_CODES = ["invalid-data", "invalid-input-response"];

// Provides CAPTCHA behavior without owning a form, so consumers can integrate execution and reset
// with their own submission flow, including forms that use uncontrolled inputs.
export const useHCaptcha = ({
  captchaEnabled = true,
  failureMode = "allow",
  language,
  onConfigError,
  onAnyError,
  onCaptchaExpired,
  onRecoverableError,
  onSuspiciousError,
  siteKey,
}: UseHCaptchaOptions): UseHCaptchaResult => {
  const hCaptchaRef = useRef<HCaptcha>(null);
  const completionRef = useRef<HCaptchaSubmitCallback | null>(null);
  const hasFatalErrorRef = useRef(false);
  const [token, setToken] = useState<string | undefined>();

  const reset = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    setToken(undefined);
    onCaptchaExpired?.();
  }, [onCaptchaExpired]);

  const onError = useCallback(
    (code: string) => {
      if (CONFIG_ERROR_CODES.includes(code)) {
        hasFatalErrorRef.current = true;
        onConfigError?.(code);
      } else if (SUSPICIOUS_ERROR_CODES.includes(code)) {
        reset();
        onSuspiciousError?.(code);
      } else {
        reset();
        onRecoverableError?.(code);
      }

      onAnyError?.(code);
    },
    [onAnyError, onConfigError, onRecoverableError, onSuspiciousError, reset]
  );

  const completeWithoutCaptcha = useCallback(
    (onComplete: HCaptchaSubmitCallback) => {
      completionRef.current = null;
      if (failureMode === "allow") onComplete(undefined);
    },
    [failureMode]
  );

  const execute = useCallback(
    (onComplete: HCaptchaSubmitCallback) => {
      completionRef.current = onComplete;

      if (!captchaEnabled) {
        onComplete(undefined);
        return;
      }

      if (!hCaptchaRef.current || hasFatalErrorRef.current) {
        completeWithoutCaptcha(onComplete);
        return;
      }

      try {
        hCaptchaRef.current.execute();
      } catch {
        completeWithoutCaptcha(onComplete);
      }
    },
    [captchaEnabled, completeWithoutCaptcha]
  );

  const onVerify = useCallback((verifiedToken: string) => {
    setToken(verifiedToken);
    completionRef.current?.(verifiedToken);
    completionRef.current = null;
  }, []);

  const captcha = captchaEnabled ? (
    <HCaptcha
      ref={hCaptchaRef}
      sitekey={siteKey}
      onVerify={onVerify}
      onError={onError}
      onChalExpired={reset}
      onExpire={reset}
      languageOverride={language}
      size="invisible"
      loadAsync={true}
    />
  ) : null;

  return { captcha, execute, reset, token };
};
