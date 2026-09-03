"use client";

import type { FormHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useHCaptcha, type HCaptchaFailureReason, type UseHCaptchaOptions } from "./useHCaptcha";

export interface HCaptchaFormHandle {
  getToken: () => string | undefined;
  reset: () => void;
}

export type HCaptchaFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onError" | "onSubmit"> &
  UseHCaptchaOptions & {
    children: ReactNode;
    // Disables CAPTCHA entirely; use for tests or deliberate feature flags, not as a security control.
    captchaEnabled?: boolean;
    onCaptchaFailure?: (reason: HCaptchaFailureReason) => void;
    onUnexpectedError: (error: unknown) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>, token?: string) => void | Promise<void>;
  };

export const HCaptchaForm = forwardRef<HCaptchaFormHandle, HCaptchaFormProps>(
  (
    {
      children,
      captchaEnabled = true,
      onCaptchaFailure,
      onCaptchaExpired,
      onSubmit,
      onUnexpectedError,
      ...props
    },
    ref
  ) => {
    const captchaToken = useRef<string | undefined>(undefined);
    const captchaSubmissionPending = useRef(false);
    const captchaExecutionId = useRef(0);

    const { failureMode, language, onCaptchaVerified, onError, siteKey, ...formProps } = props;

    const { captcha, execute, reset } = useHCaptcha({
      failureMode,
      language,
      siteKey,
      onError,
      onCaptchaVerified,
      onCaptchaExpired: () => {
        captchaToken.current = undefined;
        onCaptchaExpired?.();
      },
    });

    const handleUnexpectedError = useCallback(
      (error: unknown) => {
        try {
          onUnexpectedError(error);
        } catch {
          // The original CAPTCHA or submit error is already being handled by the promise chain.
          // This callback belongs to the consuming app, so its failure must not create a second
          // unhandled rejection while reporting that error.
        }
      },
      [onUnexpectedError]
    );

    useImperativeHandle(
      ref,
      () => ({
        getToken: () => captchaToken.current,
        reset: () => {
          captchaToken.current = undefined;
          captchaExecutionId.current += 1;
          captchaSubmissionPending.current = false;
          reset();
        },
      }),
      [reset]
    );

    const handleSubmit = useCallback(
      (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        captchaToken.current = undefined;

        if (!captchaEnabled) {
          void Promise.resolve()
            .then(() => onSubmit(event))
            .catch((error: unknown) => {
              handleUnexpectedError(error);
            });
          return;
        }

        if (captchaSubmissionPending.current) return;

        const executionId = ++captchaExecutionId.current;
        captchaSubmissionPending.current = true;

        void execute()
          .then((result) => {
            if (executionId !== captchaExecutionId.current) return;

            if (!result.verified) {
              onCaptchaFailure?.(result.reason);
              // Report the failure either way. If the failureMode setting allows continuation, no
              // token exists, so submit without one; otherwise, stop here.
              if (result.allowed) return onSubmit(event);
              return;
            }

            captchaToken.current = result.token;
            return onSubmit(event, result.token);
          })
          .catch((error: unknown) => {
            if (executionId === captchaExecutionId.current) {
              handleUnexpectedError(error);
            }
          })
          .finally(() => {
            if (executionId === captchaExecutionId.current) {
              captchaSubmissionPending.current = false;
            }
          });
      },
      [captchaEnabled, execute, handleUnexpectedError, onCaptchaFailure, onSubmit]
    );

    return (
      <form {...formProps} onSubmit={handleSubmit}>
        {children}
        {captchaEnabled && captcha}
      </form>
    );
  }
);

HCaptchaForm.displayName = "HCaptchaForm";
