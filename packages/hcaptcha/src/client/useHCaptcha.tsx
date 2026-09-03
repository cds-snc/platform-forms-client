"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

export type HCaptchaFailureMode = "allow" | "block";

export type UseHCaptchaOptions = {
  // Controls whether a failed or unavailable CAPTCHA allows the submission to continue
  failureMode?: HCaptchaFailureMode;
  language?: string;
  // Fires for every error reported by hCaptcha
  onError?: (code: string) => void;
  onCaptchaVerified?: () => void;
  onCaptchaExpired?: () => void;
  siteKey: string;
};

export type HCaptchaFailureReason =
  | "configuration-error"
  | "load-error"
  | "captcha-error"
  | "expired"
  | "cancelled"
  | "not-ready"
  | "execution-error";

export type HCaptchaExecutionResult =
  | { verified: true; token: string }
  // `allowed` reflects the consumer's failureMode choice: with "allow", the caller may continue
  // without a token after a provider failure. Use it for low-risk, best-effort CAPTCHA; protected
  // actions should use "block" and enforce verification on the server.
  | { verified: false; allowed: boolean; reason: HCaptchaFailureReason };

export type UseHCaptchaResult = {
  // The hCaptcha component to render alongside the form. It has no visible UI during normal use,
  // but hCaptcha may display a challenge when additional verification is needed
  captcha: ReactNode;
  // Starts verification and resolves when a token is generated or the failure flow is applied
  execute: () => Promise<HCaptchaExecutionResult>;
  reset: () => void;
};

// Provides CAPTCHA behavior without owning a form, so consumers can integrate execution and reset
// with their own submission flow, including forms that use uncontrolled inputs
export const useHCaptcha = ({
  failureMode = "block",
  language,
  onError: onErrorCallback,
  onCaptchaVerified,
  onCaptchaExpired,
  siteKey,
}: UseHCaptchaOptions): UseHCaptchaResult => {
  const hCaptchaRef = useRef<HCaptcha>(null);

  // Share one promise when multiple callers request verification at the same time
  const pendingExecutionRef = useRef<{
    promise: Promise<HCaptchaExecutionResult>;
    resolve: (result: HCaptchaExecutionResult) => void;
  } | null>(null);

  // Fatal widget errors will not recover without remounting the widget
  const hasFatalErrorRef = useRef(false);
  const fatalErrorReasonRef = useRef<"configuration-error" | "load-error" | null>(null);
  const [captchaInstanceKey, setCaptchaInstanceKey] = useState(0);

  // Provider callbacks and the provider's async execute Promise complete the package Promise
  const complete = useCallback((result: HCaptchaExecutionResult): boolean => {
    const pendingExecution = pendingExecutionRef.current;
    if (!pendingExecution) return false;

    pendingExecution.resolve(result);
    pendingExecutionRef.current = null;
    return true;
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
    // Manual resets cancel the current execution and recreate the widget so a failed SDK load can
    // be retried by the consumer.
    hCaptchaRef.current?.resetCaptcha();
    hasFatalErrorRef.current = false;
    fatalErrorReasonRef.current = null;
    complete(failureResult("cancelled"));
    setCaptchaInstanceKey((key) => key + 1);
  }, [complete, failureResult]);

  const onExpired = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    complete(failureResult("expired"));
    onCaptchaExpired?.();
  }, [complete, failureResult, onCaptchaExpired]);

  const onClose = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    complete(failureResult("cancelled"));
  }, [complete, failureResult]);

  const resetAfterError = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    complete(failureResult("captcha-error"));
  }, [complete, failureResult]);

  const handleProviderError = useCallback(
    (code: string) => {
      switch (code) {
        case "invalid-sitekey":
        case "missing-sitekey":
          hasFatalErrorRef.current = true;
          fatalErrorReasonRef.current = "configuration-error";
          complete(failureResult("configuration-error"));
          break;
        case "script-error":
          hasFatalErrorRef.current = true;
          fatalErrorReasonRef.current = "load-error";
          complete(failureResult("load-error"));
          break;
        case "challenge-closed":
          onClose();
          break;
        case "challenge-expired":
          onExpired();
          break;
        case "execution-error":
          complete(failureResult("execution-error"));
          break;
        default:
          resetAfterError();
      }

      onErrorCallback?.(code);
    },
    [complete, failureResult, onClose, onErrorCallback, onExpired, resetAfterError]
  );

  const startExecution = useCallback(() => {
    if (!pendingExecutionRef.current || !hCaptchaRef.current || hasFatalErrorRef.current) {
      return;
    }

    try {
      const providerExecution = hCaptchaRef.current.execute({ async: true });

      // hCaptcha automatically retries temporary network failures before rejecting this Promise.
      if (providerExecution && typeof providerExecution.then === "function") {
        void providerExecution
          .then(({ response }) => {
            if (complete({ verified: true, token: response })) {
              onCaptchaVerified?.();
            }
          })
          .catch((code: unknown) => {
            // The provider may report the same failure through its callback and Promise. Only
            // handle the rejection when the callback has not already completed this execution.
            if (pendingExecutionRef.current) {
              handleProviderError(typeof code === "string" ? code : "execution-error");
            }
          });
      }
    } catch {
      // The provider can throw before it reports an error through its callbacks
      complete(failureResult("execution-error"));
    }
  }, [complete, failureResult, handleProviderError, onCaptchaVerified]);

  const onReady = useCallback(() => {
    startExecution();
  }, [startExecution]);

  const onError = useCallback(
    (code: string) => {
      handleProviderError(code);
    },
    [handleProviderError]
  );

  const execute = useCallback((): Promise<HCaptchaExecutionResult> => {
    if (pendingExecutionRef.current) return pendingExecutionRef.current.promise;

    let resolveExecution: (result: HCaptchaExecutionResult) => void = () => {};
    const promise = new Promise<HCaptchaExecutionResult>((resolve) => {
      resolveExecution = resolve;
    });
    pendingExecutionRef.current = { promise, resolve: resolveExecution };

    if (!hCaptchaRef.current || hasFatalErrorRef.current) {
      complete(failureResult(fatalErrorReasonRef.current ?? "not-ready"));
    } else if (hCaptchaRef.current.isReady()) {
      startExecution();
    }

    return promise;
  }, [complete, failureResult, startExecution]);

  const onVerify = useCallback(
    (verifiedToken: string) => {
      if (complete({ verified: true, token: verifiedToken })) {
        onCaptchaVerified?.();
      }
    },
    [complete, onCaptchaVerified]
  );

  const captcha = (
    <HCaptcha
      key={captchaInstanceKey}
      ref={hCaptchaRef}
      sitekey={siteKey}
      onVerify={onVerify}
      onError={onError}
      onReady={onReady}
      // A challenge timeout means the user did not complete the challenge, while token expiration
      // means a previously issued token is no longer valid. Neither can produce a usable token,
      // so both callbacks reset the widget and resolve the active execution as expired. Closing
      // the challenge is handled separately as cancellation below.
      onChalExpired={onExpired}
      onExpire={onExpired}
      onClose={onClose}
      languageOverride={language}
      size="invisible"
      loadAsync={true}
    />
  );

  return { captcha, execute, reset };
};
