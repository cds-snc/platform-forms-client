"use client";

import type { ReactNode, SubmitEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import {
  HCaptchaForm,
  type HCaptchaFormHandle,
  type HCaptchaFormProps,
} from "@gcforms/hcaptcha/client";
import { logMessage } from "@lib/logger";

export interface FormCaptchaHandle {
  getToken: () => string | undefined;
  reset: () => void;
}

type FormCaptchaProps = Omit<HCaptchaFormProps, "children" | "onSubmit"> & {
  children: ReactNode;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

export const FormCaptcha = forwardRef<FormCaptchaHandle, FormCaptchaProps>(
  ({ children, onSubmit, ...props }, ref) => {
    const captchaFormRef = useRef<HCaptchaFormHandle | null>(null);
    const captchaToken = useRef<string | undefined>(undefined);
    const setCaptchaFormHandle = useCallback((handle: HCaptchaFormHandle | null) => {
      captchaFormRef.current = handle;
    }, []);

    const handleSubmit = useCallback(
      (event: SubmitEvent<HTMLFormElement>, token: string | undefined) => {
        captchaToken.current = token;
        onSubmit(event);
      },
      [onSubmit]
    );

    useImperativeHandle(
      ref,
      () => ({
        getToken: () => captchaToken.current,
        reset: () => {
          captchaToken.current = undefined;
          captchaFormRef.current?.reset();
        },
      }),
      []
    );

    return (
      <HCaptchaForm
        {...props}
        ref={setCaptchaFormHandle}
        onSubmit={handleSubmit}
        onConfigError={(code) => {
          logMessage.error(`hCaptcha: critical configuration error "${code}". Submission blocked.`);
        }}
        onRecoverableError={(code) => {
          logMessage.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
        }}
        onSuspiciousError={(code) => {
          logMessage.warn(
            `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked. Resetting widget state.`
          );
        }}
        onCaptchaExpired={() => {
          logMessage.info("hCaptcha: challenge expired");
        }}
      >
        {children}
      </HCaptchaForm>
    );
  }
);

FormCaptcha.displayName = "FormCaptcha";
