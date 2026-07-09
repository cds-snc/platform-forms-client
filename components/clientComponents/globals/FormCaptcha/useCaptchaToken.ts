import { useCallback, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useLogMessageToServer } from "@root/lib/hooks/logging/useLogMessageToServer";

export const useCaptchaToken = (
  captchaTokenRef?: React.RefObject<string>,
  hCaptchaRef?: React.RefObject<HCaptcha | null>
) => {
  const tokenTimestampRef = useRef<number | null>(null);
  const { logMessageToServer } = useLogMessageToServer();

  const setToken = useCallback(
    (token: string) => {
      if (captchaTokenRef) {
        captchaTokenRef.current = token;
        tokenTimestampRef.current = Date.now();
        logMessageToServer({
          message: `hCaptcha: token generated ${new Date(tokenTimestampRef.current).toISOString()}`,
          type: "info",
        });
      } else {
        logMessageToServer({
          message: "hCaptcha: failed to generate a token",
          type: "warn",
        });
      }
    },
    [captchaTokenRef, logMessageToServer]
  );

  const resetToken = useCallback(() => {
    const tokenAge = tokenTimestampRef.current
      ? (Date.now() - tokenTimestampRef.current) / 1000
      : "unknown";

    if (captchaTokenRef) {
      captchaTokenRef.current = "";
    }

    // Reset the entire hCaptcha widget
    if (hCaptchaRef?.current) {
      hCaptchaRef.current.resetCaptcha();
    }

    tokenTimestampRef.current = null;
    logMessageToServer({
      message: `hCaptcha: manually reset token with age: ${tokenAge}s`,
      type: "info",
    });

    // Return age for external logging if needed
    return tokenAge;
  }, [captchaTokenRef, hCaptchaRef, logMessageToServer]);

  const getTokenAge = useCallback(() => {
    if (!tokenTimestampRef.current) return null;
    return (Date.now() - tokenTimestampRef.current) / 1000;
  }, []);

  return {
    setToken,
    resetToken,
    getTokenAge,
  };
};
