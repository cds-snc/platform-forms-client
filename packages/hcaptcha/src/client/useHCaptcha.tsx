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

export type HCaptchaFailureReason =
  "disabled" | "configuration-error" | "captcha-error" | "not-ready" | "execution-error";

export type HCaptchaExecutionResult =
  | { verified: true; token: string }
  | { verified: false; allowed: boolean; reason: HCaptchaFailureReason };

export type UseHCaptchaResult = {
  /**
   * The hCaptcha component to render alongside the form. It has no visible UI during normal use,
   * but hCaptcha may display a challenge when additional verification is needed.
   */
  captcha: ReactNode;
  /** Starts verification and resolves when a token is generated or the failure policy is applied. */
  execute: () => Promise<HCaptchaExecutionResult>;
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
  const pendingExecutionRef = useRef<{
    promise: Promise<HCaptchaExecutionResult>;
    resolve: (result: HCaptchaExecutionResult) => void;
  } | null>(null);
  const hasFatalErrorRef = useRef(false);
  const [token, setToken] = useState<string | undefined>();

  const reset = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    setToken(undefined);
    onCaptchaExpired?.();
  }, [onCaptchaExpired]);

  const complete = useCallback((result: HCaptchaExecutionResult) => {
    pendingExecutionRef.current?.resolve(result);
    pendingExecutionRef.current = null;
  }, []);

  const failureResult = useCallback(
    (reason: HCaptchaFailureReason): HCaptchaExecutionResult => ({
      verified: false,
      allowed: failureMode === "allow" || reason === "disabled",
      reason,
    }),
    [failureMode]
  );

  const onError = useCallback(
    (code: string) => {
      if (CONFIG_ERROR_CODES.includes(code)) {
        hasFatalErrorRef.current = true;
        onConfigError?.(code);
        complete(failureResult("configuration-error"));
      } else if (SUSPICIOUS_ERROR_CODES.includes(code)) {
        reset();
        onSuspiciousError?.(code);
        complete(failureResult("captcha-error"));
      } else {
        reset();
        onRecoverableError?.(code);
        complete(failureResult("captcha-error"));
      }

      onAnyError?.(code);
    },
    [
      complete,
      failureResult,
      onAnyError,
      onConfigError,
      onRecoverableError,
      onSuspiciousError,
      reset,
    ]
  );

  const execute = useCallback((): Promise<HCaptchaExecutionResult> => {
    if (pendingExecutionRef.current) return pendingExecutionRef.current.promise;

    let resolveExecution: (result: HCaptchaExecutionResult) => void = () => {};
    const promise = new Promise<HCaptchaExecutionResult>((resolve) => {
      resolveExecution = resolve;
    });
    pendingExecutionRef.current = { promise, resolve: resolveExecution };

    if (!captchaEnabled) {
      complete(failureResult("disabled"));
      return promise;
    }

    if (!hCaptchaRef.current || hasFatalErrorRef.current) {
      complete(failureResult(hasFatalErrorRef.current ? "configuration-error" : "not-ready"));
      return promise;
    }

    try {
      hCaptchaRef.current.execute();
    } catch {
      complete(failureResult("execution-error"));
    }

    return promise;
  }, [captchaEnabled, complete, failureResult]);

  const onVerify = useCallback(
    (verifiedToken: string) => {
      setToken(verifiedToken);
      complete({ verified: true, token: verifiedToken });
    },
    [complete]
  );

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
