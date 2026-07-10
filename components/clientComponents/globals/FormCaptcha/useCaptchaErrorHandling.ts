import { logMessage } from "@root/lib/logger";
import { useCallback, useRef } from "react";

// Logging is currently only client side to help debugging on staging. Ideally replace with a client-to-server logging solution for prod debugging.

export const useCaptchaErrorHandling = ({ resetToken }: { resetToken: () => void }) => {
  const hasFatalErrorRef = useRef(false);

  const onErrorCallback = useCallback(
    (code: string) => {
      const configErrors = ["invalid-sitekey", "missing-sitekey"];
      const suspiciousErrors = ["invalid-data", "invalid-input-response"];

      // Block on suspicious errors (potential bot/attack): reset the widget state
      // and block the current submission. hCaptcha remains active for any subsequent
      // attempts on this page load. Users can reload the page to and try again.
      if (suspiciousErrors.includes(code)) {
        logMessage.warn(
          `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked. Resetting widget state.`
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
