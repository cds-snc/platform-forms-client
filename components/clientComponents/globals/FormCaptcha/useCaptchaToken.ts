import { useCallback, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";

export const useCaptchaToken = (
  captchaTokenRef?: React.RefObject<string>,
  hCaptchaRef?: React.RefObject<HCaptcha | null>
) => {
  const tokenTimestampRef = useRef<number | null>(null);

  const setToken = useCallback(
    (token: string) => {
      if (captchaTokenRef) {
        captchaTokenRef.current = token;
        tokenTimestampRef.current = Date.now();
        logMessage.info(
          `hCaptcha: token generated ${new Date(tokenTimestampRef.current).toISOString()}`
        );
      } else {
        logMessage.warn("hCaptcha: failed to generate a token");
      }
    },
    [captchaTokenRef]
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
    logMessage.info(`hCaptcha: manually reset token with age: ${tokenAge}s`);

    // Return age for external logging if needed
    return tokenAge;
  }, [captchaTokenRef, hCaptchaRef]);

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
