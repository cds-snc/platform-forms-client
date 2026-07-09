import { useCallback, useRef, SubmitEvent } from "react";
import { logMessage } from "@lib/logger";

export const useCaptchaErrorHandling = ({
  resetToken,
  handleSubmit,
  formSubmitEventRef,
}: {
  resetToken: () => void;
  handleSubmit: (e?: SubmitEvent<HTMLFormElement>) => void;
  formSubmitEventRef: React.RefObject<SubmitEvent<HTMLFormElement> | null>;
}) => {
  const hasFatalErrorRef = useRef(false);

  const onErrorCallback = useCallback(
    (code: string) => {
      const configErrors = ["invalid-sitekey", "missing-sitekey"];
      const suspiciousErrors = ["invalid-data", "invalid-input-response"];

      // Block on suspicious errors (potential bot/attack)
      if (suspiciousErrors.includes(code)) {
        hasFatalErrorRef.current = true;
        logMessage.warn(
          `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked.`
        );
        resetToken();
        return;
      }

      // Block on critical hCaptcha configuration errors
      if (configErrors.includes(code)) {
        hasFatalErrorRef.current = true;

        // TODO: Probably remove this block since hCaptcha local development does not really work/useful
        if (process.env.NODE_ENV === "development") {
          logMessage.error(
            `hCaptcha: configuration error "${code}" - bypassing in development mode. Fix your .env configuration.`
          );
          if (formSubmitEventRef.current) {
            handleSubmit(formSubmitEventRef.current);
          }
          return;
        }

        logMessage.error(`hCaptcha: critical configuration error "${code}". Blocking submission.`);
        return;
      }

      // Recoverable errors, just reset the token and allow user to retry
      logMessage.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
      resetToken();
    },
    [handleSubmit, resetToken, formSubmitEventRef]
  );

  return {
    onErrorCallback,
    hasFatalErrorRef,
  };
};
