"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { ReactNode } from "react";
import { useCallback, useRef } from "react";

export type HCaptchaFailureMode = "allow" | "block";

export type UseHCaptchaOptions = {
  // Controls whether a failed or unavailable CAPTCHA allows the submission to continue
  failureMode?: HCaptchaFailureMode;
  language?: string;
  // Fires for every error reported by hCaptcha
  onError?: (code: string) => void;
  onCaptchaExpired?: () => void;
  siteKey: string;
};

export type HCaptchaFailureReason =
  | "configuration-error"
  | "captcha-error"
  | "expired"
  | "cancelled"
  | "not-ready"
  | "execution-error";

export type HCaptchaExecutionResult =
  | { verified: true; token: string }
  | { verified: false; allowed: boolean; reason: HCaptchaFailureReason };

export type UseHCaptchaResult = {
  // The hCaptcha component to render alongside the form. It has no visible UI during normal use,
  // but hCaptcha may display a challenge when additional verification is needed
  captcha: ReactNode;
  // Starts verification and resolves when a token is generated or the failure flow is applied
  execute: () => Promise<HCaptchaExecutionResult>;
  reset: () => void;
};

const CONFIG_ERROR_CODES = ["invalid-sitekey", "missing-sitekey"];

// Provides CAPTCHA behavior without owning a form, so consumers can integrate execution and reset
// with their own submission flow, including forms that use uncontrolled inputs
export const useHCaptcha = ({
  failureMode = "block",
  language,
  onError: onErrorCallback,
  onCaptchaExpired,
  siteKey,
}: UseHCaptchaOptions): UseHCaptchaResult => {
  const hCaptchaRef = useRef<HCaptcha>(null);

  const pendingExecutionRef = useRef<{
    promise: Promise<HCaptchaExecutionResult>;
    resolve: (result: HCaptchaExecutionResult) => void;
  } | null>(null);

  const hasFatalErrorRef = useRef(false);

  const complete = useCallback((result: HCaptchaExecutionResult) => {
    pendingExecutionRef.current?.resolve(result);
    pendingExecutionRef.current = null;
  }, []);

  const failureResult = useCallback(
    (reason: HCaptchaFailureReason): HCaptchaExecutionResult => ({
      verified: false,
      allowed: reason !== "cancelled" && failureMode === "allow",
      reason,
    }),
    [failureMode]
  );

  const reset = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    complete(failureResult("cancelled"));
  }, [complete, failureResult]);

  const onExpired = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    complete(failureResult("expired"));
    onCaptchaExpired?.();
  }, [complete, failureResult, onCaptchaExpired]);

  const resetAfterError = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    complete(failureResult("captcha-error"));
  }, [complete, failureResult]);

  const onError = useCallback(
    (code: string) => {
      if (CONFIG_ERROR_CODES.includes(code)) {
        hasFatalErrorRef.current = true;
        complete(failureResult("configuration-error"));
      } else {
        resetAfterError();
      }

      onErrorCallback?.(code);
    },
    [complete, failureResult, onErrorCallback, resetAfterError]
  );

  const execute = useCallback((): Promise<HCaptchaExecutionResult> => {
    if (pendingExecutionRef.current) return pendingExecutionRef.current.promise;

    let resolveExecution: (result: HCaptchaExecutionResult) => void = () => {};
    const promise = new Promise<HCaptchaExecutionResult>((resolve) => {
      resolveExecution = resolve;
    });
    pendingExecutionRef.current = { promise, resolve: resolveExecution };

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
  }, [complete, failureResult]);

  const onVerify = useCallback(
    (verifiedToken: string) => {
      complete({ verified: true, token: verifiedToken });
    },
    [complete]
  );

  const captcha = (
    <HCaptcha
      ref={hCaptchaRef}
      sitekey={siteKey}
      onVerify={onVerify}
      onError={onError}
      onChalExpired={onExpired}
      onExpire={onExpired}
      languageOverride={language}
      size="invisible"
      loadAsync={true}
    />
  );

  return { captcha, execute, reset };
};
