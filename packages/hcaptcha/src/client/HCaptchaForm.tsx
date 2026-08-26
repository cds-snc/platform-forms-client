"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { FormHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface HCaptchaFormHandle {
  reset: () => void;
}

export type HCaptchaFailureMode = "allow" | "block";

export type HCaptchaFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  children: ReactNode;
  captchaEnabled?: boolean;
  failureMode?: HCaptchaFailureMode;
  language?: string;
  onConfigError?: (code: string) => void;
  /** Fires on every error, after any category-specific callback. */
  onAnyError?: (code: string) => void;
  onCaptchaExpired?: () => void;
  onRecoverableError?: (code: string) => void;
  onSuspiciousError?: (code: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>, captchaToken: string | undefined) => void;
  siteKey: string;
};

const CONFIG_ERROR_CODES = ["invalid-sitekey", "missing-sitekey"];
const SUSPICIOUS_ERROR_CODES = ["invalid-data", "invalid-input-response"];

export const HCaptchaForm = forwardRef<HCaptchaFormHandle, HCaptchaFormProps>(
  (
    {
      children,
      captchaEnabled = true,
      failureMode = "allow",
      language,
      onConfigError,
      onAnyError,
      onCaptchaExpired,
      onRecoverableError,
      onSuspiciousError,
      onSubmit,
      siteKey,
      ...formProps
    },
    ref
  ) => {
    const hCaptchaRef = useRef<HCaptcha>(null);
    const formSubmitEventRef = useRef<SubmitEvent<HTMLFormElement> | null>(null);

    const resetCaptcha = useCallback(() => {
      hCaptchaRef.current?.resetCaptcha();
    }, []);

    const resetToken = useCallback(() => {
      resetCaptcha();
      onCaptchaExpired?.();
    }, [onCaptchaExpired, resetCaptcha]);

    const hasFatalErrorRef = useRef(false);
    const onErrorCallback = useCallback(
      (code: string) => {
        if (CONFIG_ERROR_CODES.includes(code)) {
          hasFatalErrorRef.current = true;
          onConfigError?.(code);
        } else if (SUSPICIOUS_ERROR_CODES.includes(code)) {
          resetToken();
          onSuspiciousError?.(code);
        } else {
          resetToken();
          onRecoverableError?.(code);
        }

        onAnyError?.(code);
      },
      [onAnyError, onConfigError, onRecoverableError, onSuspiciousError, resetToken]
    );

    useImperativeHandle(ref, () => ({ reset: resetToken }), [resetToken]);

    const submitWithoutCaptcha = useCallback(
      (event: SubmitEvent<HTMLFormElement>) => {
        if (failureMode === "allow") onSubmit(event, undefined);
      },
      [failureMode, onSubmit]
    );

    const handleSubmit = useCallback(
      (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!captchaEnabled) {
          onSubmit(event, undefined);
          return;
        }

        formSubmitEventRef.current = event;
        if (!hCaptchaRef.current || hasFatalErrorRef.current) {
          submitWithoutCaptcha(event);
          return;
        }

        try {
          hCaptchaRef.current.execute();
        } catch {
          submitWithoutCaptcha(event);
        }
      },
      [captchaEnabled, hasFatalErrorRef, onSubmit, submitWithoutCaptcha]
    );

    const handleVerify = useCallback(
      (token: string) => {
        if (formSubmitEventRef.current) onSubmit(formSubmitEventRef.current, token);
      },
      [onSubmit]
    );

    return (
      <form {...formProps} onSubmit={handleSubmit}>
        {children}
        {captchaEnabled && (
          <HCaptcha
            ref={hCaptchaRef}
            sitekey={siteKey}
            onVerify={handleVerify}
            onError={onErrorCallback}
            onChalExpired={resetToken}
            onExpire={resetToken}
            languageOverride={language}
            size="invisible"
            loadAsync={true}
          />
        )}
      </form>
    );
  }
);

HCaptchaForm.displayName = "HCaptchaForm";
