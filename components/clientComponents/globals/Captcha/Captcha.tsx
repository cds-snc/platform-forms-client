import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./actions";

// Running in "100% Passive" mode that will never challenge users. The mode is set at account level.
// In the future we hope to use "99.9% Passive hybrid" that will show an A11Y prompt for the .1%
// suspicious users.
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
  // Determines whether to block a user from submitting a form that is marked as a bot by siteverify
  blockableMode?: boolean;
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
      logMessage.error(`hCaptcha: system error ${err}`);
      // Don't block the user from submittion on a system error (our fault not theirs)
      if (typeof successCb === "function") {
        successCb();
      }
    }
  };

  // Component will reset immediately after a Client sends bad data.
  // Note: An invalid sitekey will cause the HCaptcha component to fail without calling onError
  const clientComponentError = (code: string) => {
    // see https://docs.hcaptcha.com/#siteverify-error-codes-table
    logMessage.warn(`hCatpcha: clientComponentError error. Error: ${code}`);
  };

  const tokenExpired = () => {
    logMessage.info("hCaptcha: token expired");
    hCaptchaRef.current?.resetCaptcha();
  };

  const challengeExpired = () => {
    logMessage.info("hCaptcha: challenge expired");
    hCaptchaRef.current?.resetCaptcha();
  };

  // see https://github.com/hCaptcha/react-hcaptcha
  return (
    <HCaptcha
      sitekey={hCaptchaSiteKey}
      onVerify={verify}
      onError={clientComponentError}
      onChalExpired={challengeExpired}
      onExpire={tokenExpired}
      ref={hCaptchaRef}
      languageOverride={lang}
      // No checkbox is used
      size="invisible"
    />
  );
};
