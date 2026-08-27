"use client";

import type { FormHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useHCaptcha, type UseHCaptchaOptions } from "@gcforms/hcaptcha/client";
import { logMessage } from "@lib/logger";

export interface FormCaptchaHandle {
  getToken: () => string | undefined;
  reset: () => void;
}

type FormCaptchaProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> &
  UseHCaptchaOptions & {
    children: ReactNode;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  };

export const FormCaptcha = forwardRef<FormCaptchaHandle, FormCaptchaProps>(
  ({ children, onSubmit, ...props }, ref) => {
    const captchaToken = useRef<string | undefined>(undefined);
    const {
      captchaEnabled,
      failureMode,
      language,
      onAnyError,
      onCaptchaExpired,
      onConfigError,
      onRecoverableError,
      onSuspiciousError,
      siteKey,
      ...formProps
    } = props;
    const { captcha, execute, reset } = useHCaptcha({
      captchaEnabled,
      failureMode,
      language,
      siteKey,
      onConfigError: (code) => {
        logMessage.error(`hCaptcha: critical configuration error "${code}". Submission blocked.`);
        onConfigError?.(code);
      },
      onRecoverableError: (code) => {
        logMessage.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
        onRecoverableError?.(code);
      },
      onSuspiciousError: (code) => {
        logMessage.warn(
          `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked. Resetting widget state.`
        );
        onSuspiciousError?.(code);
      },
      onCaptchaExpired: () => {
        logMessage.info("hCaptcha: challenge expired");
        onCaptchaExpired?.();
      },
      onAnyError,
    });

    useImperativeHandle(
      ref,
      () => ({
        getToken: () => captchaToken.current,
        reset: () => {
          captchaToken.current = undefined;
          reset();
        },
      }),
      [reset]
    );

    const handleSubmit = useCallback(
      (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        void execute().then((result) => {
          if (result.verified) captchaToken.current = result.token;
          else if (!result.allowed) return;
          onSubmit(event);
        });
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

FormCaptcha.displayName = "FormCaptcha";
