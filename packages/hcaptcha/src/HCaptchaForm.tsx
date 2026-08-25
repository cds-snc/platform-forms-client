"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { FormHTMLAttributes, ReactNode, RefObject, SubmitEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { useHCaptchaToken } from "./useHCaptchaToken";
import { useHCaptchaErrorHandling } from "./useHCaptchaErrorHandling";

export type HCaptchaFailureMode = "allow" | "block";

export type HCaptchaFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  children: ReactNode;
  captchaTokenRef?: RefObject<string>;
  enabled?: boolean;
  failureMode?: HCaptchaFailureMode;
  language?: string;
  onConfigError?: (code: string) => void;
  onCaptchaError?: (code: string) => void;
  onCaptchaExpired?: () => void;
  onRecoverableError?: (code: string) => void;
  onSuspiciousError?: (code: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  resetCaptchaRef?: RefObject<{ resetToken: () => void } | null>;
  siteKey: string;
};

export const HCaptchaForm = ({
  children,
  captchaTokenRef,
  enabled = true,
  failureMode = "allow",
  language,
  onConfigError,
  onCaptchaError,
  onCaptchaExpired,
  onRecoverableError,
  onSuspiciousError,
  onSubmit,
  resetCaptchaRef,
  siteKey,
  ...formProps
}: HCaptchaFormProps) => {
  const hCaptchaRef = useRef<HCaptcha>(null);
  const formSubmitEventRef = useRef<SubmitEvent<HTMLFormElement> | null>(null);
  const { setToken, resetToken: resetCaptchaToken } = useHCaptchaToken(
    captchaTokenRef,
    hCaptchaRef
  );
  const resetToken = useCallback(() => {
    resetCaptchaToken();
    onCaptchaExpired?.();
  }, [onCaptchaExpired, resetCaptchaToken]);
  const { onErrorCallback } = useHCaptchaErrorHandling({
    onConfigError,
    onError: onCaptchaError,
    onRecoverableError,
    onSuspiciousError,
    resetToken,
  });

  const submitWithoutCaptcha = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      if (failureMode === "allow") onSubmit(event);
    },
    [failureMode, onSubmit]
  );

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!enabled) {
        onSubmit(event);
        return;
      }

      formSubmitEventRef.current = event;
      if (!hCaptchaRef.current) {
        submitWithoutCaptcha(event);
        return;
      }

      try {
        hCaptchaRef.current.execute();
      } catch {
        submitWithoutCaptcha(event);
      }
    },
    [enabled, onSubmit, submitWithoutCaptcha]
  );

  const handleVerify = useCallback(
    (token: string) => {
      setToken(token);
      if (formSubmitEventRef.current) onSubmit(formSubmitEventRef.current);
    },
    [onSubmit, setToken]
  );

  useEffect(() => {
    if (resetCaptchaRef) resetCaptchaRef.current = { resetToken };
  }, [resetCaptchaRef, resetToken]);

  return (
    <form {...formProps} onSubmit={handleSubmit}>
      {children}
      {enabled && (
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
};
