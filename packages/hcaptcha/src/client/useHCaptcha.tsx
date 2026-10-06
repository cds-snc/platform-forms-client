"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type HCaptchaLogger = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

export type UseHCaptchaOptions = {
  enabled?: boolean;
  language?: string;
  logger?: HCaptchaLogger;
  // Fires for every error reported by hCaptcha
  onError?: (code: string) => void;
  onSuspiciousError?: (code: string) => void;
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
  | "timeout"
  | "execution-error";

export type HCaptchaExecutionResult =
  { verified: true; token: string } | { verified: false; reason: HCaptchaFailureReason };

export type UseHCaptchaResult = {
  // The hCaptcha component to render alongside the form. It has no visible UI during normal use,
  // but hCaptcha may display a challenge when additional verification is needed
  captcha: ReactNode;
  // Starts verification and resolves when a token is generated or the failure flow is applied
  execute: () => Promise<HCaptchaExecutionResult>;
  reset: () => void;
};

const SUSPICIOUS_ERROR_CODES = new Set(["invalid-data", "invalid-input-response"]);

const HCAPTCHA_TIMEOUTS_MS = {
  // hCaptcha should have loaded by this time since it begins loading on form load but catch any
  // stalled or unusually slow loading scenarios
  readiness: 15000,
  // Allow time for network retries, but don't hang when no challenge appears
  execution: 30000,
  // Intentionally generous to allow users enough time to complete the challenge
  challenge: 5 * 60 * 1000,
};

// Provides CAPTCHA behavior without owning a form, so consumers can integrate execution and reset
// with their own submission flow, including forms that use uncontrolled inputs
export const useHCaptcha = ({
  enabled = true,
  language,
  logger,
  onError: onErrorCallback,
  onSuspiciousError,
  onCaptchaVerified,
  onCaptchaExpired,
  siteKey,
}: UseHCaptchaOptions): UseHCaptchaResult => {
  const hCaptchaRef = useRef<HCaptcha>(null);

  // Share one promise when multiple callers request verification at the same time
  const pendingExecutionRef = useRef<{
    promise: Promise<HCaptchaExecutionResult>;
    resolve: (result: HCaptchaExecutionResult) => void;
    executionId: number;
    phase: keyof typeof HCAPTCHA_TIMEOUTS_MS | null;
    timeoutId: ReturnType<typeof setTimeout> | undefined;
  } | null>(null);
  // Ignore provider results from executions invalidated by reset()
  const executionIdRef = useRef(0);

  // Fatal widget errors will not recover without remounting the widget
  const hasFatalErrorRef = useRef(false);
  const fatalErrorReasonRef = useRef<"configuration-error" | "load-error" | null>(null);
  const [captchaInstanceKey, setCaptchaInstanceKey] = useState(0);
  const captchaInstanceKeyRef = useRef(0);

  const remountCaptcha = useCallback(() => {
    captchaInstanceKeyRef.current += 1;
    setCaptchaInstanceKey(captchaInstanceKeyRef.current);
  }, []);

  // Provider callbacks and the provider's async execute Promise complete the package Promise
  const complete = useCallback((result: HCaptchaExecutionResult, executionId?: number): boolean => {
    const pendingExecution = pendingExecutionRef.current;
    if (
      !pendingExecution ||
      (executionId !== undefined && pendingExecution.executionId !== executionId)
    ) {
      return false;
    }

    clearTimeout(pendingExecution.timeoutId);
    pendingExecution.resolve(result);
    pendingExecutionRef.current = null;
    return true;
  }, []);

  const failureResult = useCallback(
    (reason: HCaptchaFailureReason): HCaptchaExecutionResult => ({
      verified: false,
      reason,
    }),
    []
  );

  const completeFailure = useCallback(
    (reason: HCaptchaFailureReason, executionId?: number): boolean => {
      if (!complete(failureResult(reason), executionId)) return false;
      remountCaptcha();
      return true;
    },
    [complete, failureResult, remountCaptcha]
  );

  useEffect(() => {
    return () => {
      complete(failureResult("cancelled"));
    };
  }, [complete, failureResult]);

  // Reuse one timer as hCaptcha moves through each step. Repeated events don't restart the clock.
  const setExecutionTimeout = useCallback(
    (phase: keyof typeof HCAPTCHA_TIMEOUTS_MS, executionId: number) => {
      const pendingExecution = pendingExecutionRef.current;
      if (
        !pendingExecution ||
        pendingExecution.executionId !== executionId ||
        pendingExecution.phase === phase
      ) {
        return;
      }

      clearTimeout(pendingExecution.timeoutId);
      pendingExecution.phase = phase;
      const timeoutMs = HCAPTCHA_TIMEOUTS_MS[phase];
      pendingExecution.timeoutId = setTimeout(() => {
        if (pendingExecutionRef.current?.phase !== phase) return;
        if (completeFailure("timeout", executionId)) {
          logger?.warn(`hCaptcha: ${phase} timed out after ${timeoutMs}ms`);
        }
      }, timeoutMs);
    },
    [completeFailure, logger]
  );

  const reset = useCallback(() => {
    // Manual resets cancel the current execution and recreate the widget so a failed SDK load can
    // be retried by the consumer.
    executionIdRef.current += 1;
    hCaptchaRef.current?.resetCaptcha();
    hasFatalErrorRef.current = false;
    fatalErrorReasonRef.current = null;
    complete(failureResult("cancelled"));
    remountCaptcha();
  }, [complete, failureResult, remountCaptcha]);

  const onExpired = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    completeFailure("expired");
    onCaptchaExpired?.();
  }, [completeFailure, onCaptchaExpired]);

  const onClose = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    completeFailure("cancelled");
  }, [completeFailure]);

  const resetAfterError = useCallback(() => {
    hCaptchaRef.current?.resetCaptcha();
    completeFailure("captcha-error");
  }, [completeFailure]);

  const handleProviderError = useCallback(
    (code: string) => {
      if (SUSPICIOUS_ERROR_CODES.has(code)) {
        logger?.warn(
          `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked. Resetting widget state.`
        );
        onSuspiciousError?.(code);
        resetAfterError();
      } else {
        switch (code) {
          case "invalid-sitekey":
          case "missing-sitekey":
            hasFatalErrorRef.current = true;
            fatalErrorReasonRef.current = "configuration-error";
            logger?.error(`hCaptcha: critical configuration error "${code}". Submission blocked.`);
            complete(failureResult("configuration-error"));
            break;
          case "script-error":
            hasFatalErrorRef.current = true;
            fatalErrorReasonRef.current = "load-error";
            logger?.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
            complete(failureResult("load-error"));
            break;
          case "challenge-closed":
            onClose();
            break;
          case "challenge-expired":
            onExpired();
            break;
          case "execution-error":
            completeFailure("execution-error");
            break;
          default:
            logger?.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
            resetAfterError();
        }
      }

      onErrorCallback?.(code);
    },
    [
      complete,
      completeFailure,
      failureResult,
      logger,
      onClose,
      onErrorCallback,
      onExpired,
      onSuspiciousError,
      resetAfterError,
    ]
  );

  const startExecution = useCallback(
    (executionId?: number) => {
      const pendingExecution = pendingExecutionRef.current;
      if (
        !pendingExecution ||
        !hCaptchaRef.current ||
        hasFatalErrorRef.current ||
        pendingExecution.phase !== "readiness" ||
        (executionId !== undefined && pendingExecution.executionId !== executionId)
      ) {
        return;
      }

      const currentExecutionId = pendingExecution.executionId;
      setExecutionTimeout("execution", currentExecutionId);

      try {
        const providerExecution = hCaptchaRef.current.execute({ async: true });

        // hCaptcha automatically retries temporary network failures before rejecting this Promise.
        if (providerExecution && typeof providerExecution.then === "function") {
          void providerExecution
            .then(({ response }) => {
              if (complete({ verified: true, token: response }, currentExecutionId)) {
                remountCaptcha();
                onCaptchaVerified?.();
              }
            })
            .catch((code: unknown) => {
              // The provider may report the same failure through its callback and Promise. Only
              // handle the rejection when the callback has not already completed this execution.
              if (pendingExecutionRef.current?.executionId === currentExecutionId) {
                handleProviderError(typeof code === "string" ? code : "execution-error");
              }
            });
        }
      } catch {
        // The provider can throw before it reports an error through its callbacks
        completeFailure("execution-error", currentExecutionId);
      }
    },
    [
      complete,
      completeFailure,
      handleProviderError,
      onCaptchaVerified,
      remountCaptcha,
      setExecutionTimeout,
    ]
  );

  const onReady = useCallback(() => {
    startExecution();
  }, [startExecution]);

  const onOpen = useCallback(() => {
    // Give the user the full challenge time, even if hCaptcha took a while to load or respond
    const pendingExecution = pendingExecutionRef.current;
    if (pendingExecution?.phase === "execution") {
      setExecutionTimeout("challenge", pendingExecution.executionId);
    }
  }, [setExecutionTimeout]);

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
    const executionId = ++executionIdRef.current;
    pendingExecutionRef.current = {
      promise,
      resolve: resolveExecution,
      executionId,
      phase: null,
      timeoutId: undefined,
    };
    setExecutionTimeout("readiness", executionId);

    if (!hCaptchaRef.current || hasFatalErrorRef.current) {
      complete(failureResult(fatalErrorReasonRef.current ?? "not-ready"));
    } else if (hCaptchaRef.current.isReady()) {
      startExecution(executionId);
    }

    return promise;
  }, [complete, failureResult, setExecutionTimeout, startExecution]);

  const onVerify = useCallback(
    (verifiedToken: string) => {
      if (complete({ verified: true, token: verifiedToken })) {
        remountCaptcha();
        logger?.info(`hCaptcha: verified token received at ${new Date().toISOString()}`);
        onCaptchaVerified?.();
      }
    },
    [complete, logger, onCaptchaVerified, remountCaptcha]
  );

  const isCurrentWidget = () => captchaInstanceKeyRef.current === captchaInstanceKey;

  const captcha = enabled ? (
    <HCaptcha
      key={captchaInstanceKey}
      ref={hCaptchaRef}
      sitekey={siteKey}
      // A replaced widget may still fire callbacks after a retry starts.
      onVerify={(token) => {
        if (isCurrentWidget()) onVerify(token);
      }}
      onError={(code) => {
        if (isCurrentWidget()) onError(code);
      }}
      onReady={() => {
        if (isCurrentWidget()) onReady();
      }}
      onOpen={() => {
        if (isCurrentWidget()) onOpen();
      }}
      // A challenge timeout means the user did not complete the challenge, while token expiration
      // means a previously issued token is no longer valid. Neither can produce a usable token,
      // so both callbacks reset the widget and resolve the active execution as expired. Closing
      // the challenge is handled separately as cancellation below.
      onChalExpired={() => {
        if (isCurrentWidget()) onExpired();
      }}
      onExpire={() => {
        if (isCurrentWidget()) onExpired();
      }}
      onClose={() => {
        if (isCurrentWidget()) onClose();
      }}
      languageOverride={language}
      size="invisible"
      loadAsync={true}
    />
  ) : null;

  return { captcha, execute, reset };
};
