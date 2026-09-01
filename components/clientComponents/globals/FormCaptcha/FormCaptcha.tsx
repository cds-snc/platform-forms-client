import type { FormHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useHCaptcha, type UseHCaptchaOptions } from "@gcforms/hcaptcha/client";
import { logMessage } from "@lib/logger";

const SUSPICIOUS_ERROR_CODES = ["invalid-data", "invalid-input-response"];

export interface FormCaptchaHandle {
  getToken: () => string | undefined;
  reset: () => void;
}

type FormCaptchaProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> &
  Omit<UseHCaptchaOptions, "failureMode"> & {
    children: ReactNode;
    captchaEnabled?: boolean;
    onUnexpectedError?: (error: unknown) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  };

export const FormCaptcha = forwardRef<FormCaptchaHandle, FormCaptchaProps>(
  ({ children, captchaEnabled = true, onSubmit, onUnexpectedError, ...props }, ref) => {
    const captchaToken = useRef<string | undefined>(undefined);
    const { language, onCaptchaExpired, onError, siteKey, ...formProps } = props;
    const { captcha, execute, reset } = useHCaptcha({
      language,
      siteKey,
      onError: (code) => {
        if (SUSPICIOUS_ERROR_CODES.includes(code)) {
          logMessage.warn(
            `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked. Resetting widget state.`
          );
        } else if (code === "invalid-sitekey" || code === "missing-sitekey") {
          logMessage.error(`hCaptcha: critical configuration error "${code}". Submission blocked.`);
        } else {
          logMessage.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
        }
        onError?.(code);
      },
      onCaptchaExpired: () => {
        logMessage.info("hCaptcha: challenge expired");
        onCaptchaExpired?.();
      },
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
        captchaToken.current = undefined;

        if (!captchaEnabled) {
          onSubmit(event);
          return;
        }

        void execute()
          .then((result) => {
            if (!result.verified && !result.allowed) return;

            if (result.verified) captchaToken.current = result.token;

            return onSubmit(event);
          })
          .catch((error: unknown) => {
            try {
              if (onUnexpectedError) return onUnexpectedError(error);

              logMessage.error(error as Error);
            } catch (handlerError) {
              logMessage.error(handlerError as Error);
            }
          });
      },
      [captchaEnabled, execute, onSubmit, onUnexpectedError]
    );

    return (
      <form {...formProps} onSubmit={handleSubmit}>
        {children}
        {captchaEnabled && captcha}
      </form>
    );
  }
);

FormCaptcha.displayName = "FormCaptcha";
