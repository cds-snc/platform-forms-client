import { useLogMessageToServer } from "@root/lib/hooks/logging/useLogMessageToServer";
import { useCallback, useRef } from "react";

export const useCaptchaErrorHandling = ({ resetToken }: { resetToken: () => void }) => {
  const hasFatalErrorRef = useRef(false);
  const { logMessageToServer } = useLogMessageToServer();

  const onErrorCallback = useCallback(
    (code: string) => {
      const configErrors = ["invalid-sitekey", "missing-sitekey"];
      const suspiciousErrors = ["invalid-data", "invalid-input-response"];

      // Block on suspicious errors (potential bot/attack)
      if (suspiciousErrors.includes(code)) {
        hasFatalErrorRef.current = true;
        logMessageToServer({
          message: `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked but reseting token to allow retry.`,
          type: "warn",
        });
        resetToken();
        return;
      }

      // Block on critical hCaptcha configuration errors
      if (configErrors.includes(code)) {
        hasFatalErrorRef.current = true;
        logMessageToServer({
          message: `hCaptcha: critical configuration error "${code}". Submission blocked.`,
          type: "error",
        });
        return;
      }

      // Recoverable errors, just reset the token and allow user to retry
      logMessageToServer({
        message: `hCaptcha: recoverable error "${code}" - user can retry submission`,
        type: "warn",
      });
      resetToken();
    },
    [resetToken, logMessageToServer]
  );

  return {
    onErrorCallback,
    hasFatalErrorRef,
  };
};
