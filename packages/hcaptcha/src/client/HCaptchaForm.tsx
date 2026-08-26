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

        execute((captchaToken) => onSubmit(event, captchaToken));
      },
      [execute, onSubmit]
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
