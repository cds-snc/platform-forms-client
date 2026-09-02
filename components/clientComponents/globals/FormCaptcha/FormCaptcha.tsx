import type { FormHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import {
  useHCaptcha,
  type HCaptchaFailureReason,
  type UseHCaptchaOptions,
} from "@gcforms/hcaptcha/client";
import { logMessage } from "@lib/logger";
import { isSuspiciousHCaptchaError } from "./isSuspiciousHCaptchaError";

export interface FormCaptchaHandle {
  getToken: () => string | undefined;
  reset: () => void;
}

type FormCaptchaProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onError" | "onSubmit"> &
  Omit<UseHCaptchaOptions, "failureMode"> & {
    children: ReactNode;
    captchaEnabled?: boolean;
    onCaptchaFailure?: (reason: HCaptchaFailureReason) => void;
    onUnexpectedError?: (error: unknown) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  };

// Integrates hCaptcha with a form and exposes token and reset controls to the parent flow
export const FormCaptcha = forwardRef<FormCaptchaHandle, FormCaptchaProps>(
  (
    { children, captchaEnabled = true, onCaptchaFailure, onSubmit, onUnexpectedError, ...props },
    ref
  ) => {
    const captchaToken = useRef<string | undefined>(undefined);
    // Formik starts submitting only after captcha resolves, so guard native submit events here
    const captchaSubmissionPending = useRef(false);
    // Incremented when an execution is invalidated so late promise results are ignored
    const captchaExecutionId = useRef(0);
    const { language, onCaptchaExpired, onError, siteKey, ...formProps } = props;
    const { captcha, execute, reset } = useHCaptcha({
      language,
      siteKey,
      onError: (code) => {
        if (isSuspiciousHCaptchaError(code)) {
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
        captchaToken.current = undefined;
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
        // Discard any previous token before starting a new verification attempt
        captchaToken.current = undefined;

        if (!captchaEnabled) {
          onSubmit(event);
          return;
        }

        if (captchaSubmissionPending.current) {
          return;
        }
        const executionId = ++captchaExecutionId.current;
        captchaSubmissionPending.current = true;

        void execute()
          .then((result) => {
            if (executionId !== captchaExecutionId.current) {
              return;
            }

            if (!result.verified) {
              onCaptchaFailure?.(result.reason);
              return;
            }

            captchaToken.current = result.token;
            logMessage.info(
              `hCaptcha: verified token received by form at ${new Date().toISOString()}`
            );

            return onSubmit(event);
          })
          .catch((error: unknown) => {
            if (executionId !== captchaExecutionId.current) {
              return;
            }

            // Keep CAPTCHA and submission errors from escaping as unhandled rejections
            try {
              if (onUnexpectedError) {
                return onUnexpectedError(error);
              }

              logMessage.error(error as Error);
            } catch (handlerError) {
              logMessage.error(handlerError as Error);
            }
          })
          .finally(() => {
            if (executionId === captchaExecutionId.current) {
              captchaSubmissionPending.current = false;
            }
          });
      },
      [captchaEnabled, execute, onCaptchaFailure, onSubmit, onUnexpectedError]
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
