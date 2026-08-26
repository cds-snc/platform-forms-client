"use client";

import type { FormHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { useHCaptcha, type UseHCaptchaOptions } from "./useHCaptcha";

export type { HCaptchaFailureMode } from "./useHCaptcha";

export interface HCaptchaFormHandle {
  reset: () => void;
}

export type HCaptchaFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> &
  UseHCaptchaOptions & {
    children: ReactNode;
    /** Handles unexpected execution failures; expected CAPTCHA outcomes are returned as results. */
    onUnexpectedError?: (error: unknown) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>, captchaToken: string | undefined) => void;
  };

// Form wrapper for consumers that want CAPTCHA to own native form submission.
// Use `useHCaptcha` directly when the consumer owns the form and submit flow.
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
      onUnexpectedError,
      siteKey,
      ...formProps
    },
    ref
  ) => {
    const { captcha, execute, reset } = useHCaptcha({
      captchaEnabled,
      failureMode,
      language,
      onConfigError,
      onAnyError,
      onCaptchaExpired,
      onRecoverableError,
      onSuspiciousError,
      siteKey,
    });

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const handleSubmit = useCallback(
      (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        void execute()
          .then((result) => {
            if (result.verified) onSubmit(event, result.token);
            else if (result.allowed) onSubmit(event, undefined);
          })
          .catch((error: unknown) => onUnexpectedError?.(error));
      },
      [execute, onSubmit, onUnexpectedError]
    );

    return (
      <form {...formProps} onSubmit={handleSubmit}>
        {children}
        {captcha}
      </form>
    );
  }
);

HCaptchaForm.displayName = "HCaptchaForm";
