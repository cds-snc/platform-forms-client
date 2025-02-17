import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./actions";

export const Captcha = ({
  successCb,
  hCaptchaRef,
  lang,
  hCaptchaSiteKey,
}: {
  successCb?: () => void;
  hCaptchaRef: React.RefObject<HCaptcha | null>;
  lang: string;
  hCaptchaSiteKey: string | undefined;
}) => {
  if (!hCaptchaSiteKey) {
    logMessage.error("hCaptcha: hCaptchaSiteKey is missing");
    return null;
  }

  // Verify the token on the server side.
  const verify = async (token: string) => {
    try {
      const success = await verifyHCaptchaToken(token);
      if (success && typeof successCb === "function") {
        successCb();
      }
    } catch (err) {
      logMessage.error(`hCaptcha: system error: ${err}`);
    }
  };

  // Component will reset immediately after an error.
  // See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const clientComponentError = (code: string) => {
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
  // For component info see https://github.com/hCaptcha/react-hcaptcha
  // Note: An invalid sitekey will cause the HCaptcha component to fail without calling the onError
  // Note: The '"Cookie “__cflb” has been rejected' error is probably related to the accesible cookie (see if we can ditch it)
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
