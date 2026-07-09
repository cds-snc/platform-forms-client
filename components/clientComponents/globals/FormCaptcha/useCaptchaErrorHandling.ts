import { useCallback, useRef } from "react";
import { logMessage } from "@lib/logger";

export const useCaptchaErrorHandling = ({ resetToken }: { resetToken: () => void }) => {
  const hasFatalErrorRef = useRef(false);

  const onErrorCallback = useCallback(
    (code: string) => {
      const configErrors = ["invalid-sitekey", "missing-sitekey"];
      const suspiciousErrors = ["invalid-data", "invalid-input-response"];

      // Block on suspicious errors (potential bot/attack)
      if (suspiciousErrors.includes(code)) {
        hasFatalErrorRef.current = true;
        logMessage.warn(
          `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked but reseting token to allow retry.`
        );
        resetToken();
        return;
      }

      // Block on critical hCaptcha configuration errors
      if (configErrors.includes(code)) {
        hasFatalErrorRef.current = true;
        logMessage.error(`hCaptcha: critical configuration error "${code}". Submission blocked.`);
        return;
      }

      // Recoverable errors, just reset the token and allow user to retry
      logMessage.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
      resetToken();
    },
    [resetToken]
  );

  return {
    onErrorCallback,
    hasFatalErrorRef,
  };
};
