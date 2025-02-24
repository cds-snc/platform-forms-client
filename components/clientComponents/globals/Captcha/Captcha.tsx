import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./actions";

export const Captcha = ({
  successCb,
  hCaptchaRef,
  lang,
  hCaptchaSiteKey,
  blockableMode = true,
}: {
  successCb?: () => void;
  hCaptchaRef: React.RefObject<HCaptcha | null>;
  lang: string;
  hCaptchaSiteKey: string | undefined;
  blockableMode: boolean;
}) => {
  if (!hCaptchaSiteKey) {
    logMessage.error("hCaptcha: hCaptchaSiteKey is missing");
    return null;
  }

  // Verify the token on the server side.
  const verify = async (token: string) => {
    try {
      const success = await verifyHCaptchaToken(token, lang, blockableMode);
      logMessage.info(`hCaptcha: ${success ? "success" : "failed"}`);
      if (success && typeof successCb === "function") {
        successCb();
      }
    } catch (err) {
      logMessage.error(`hCaptcha: system error: ${err}`);
      // Don't block the user from submittion on a system error (our fault not theirs)
      if (typeof successCb === "function") {
        successCb();
      }
    }
  };

  // Component will reset immediately after a Client sends bad data.
  const clientComponentError = (code: string) => {
    // For more error info from the code see https://docs.hcaptcha.com/#siteverify-error-codes-table
    logMessage.error(`hCatpcha: clientComponentError error. Error: ${code}`);
  };

  const tokenExpired = () => {
    logMessage.info("hCaptcha: token expired");
    hCaptchaRef.current?.resetCaptcha();
  };

  const challengeExpired = () => {
    logMessage.info("hCaptcha: challenge expired");
    hCaptchaRef.current?.resetCaptcha();
  };

  // Running in 100% passive mode.
  // For React component info see https://github.com/hCaptcha/react-hcaptcha
  // Note: An invalid sitekey will cause the HCaptcha component to fail without calling onError
  // Note: Error '"Cookie “__cflb” has been rejected' is probably related to the accesible cookie (hoping to remove)
  return (
    <HCaptcha
      sitekey={hCaptchaSiteKey}
      onVerify={verify}
      onError={clientComponentError}
      onChalExpired={challengeExpired}
      onExpire={tokenExpired}
      ref={hCaptchaRef}
      languageOverride={lang}
      size="invisible"
    />
  );
};
