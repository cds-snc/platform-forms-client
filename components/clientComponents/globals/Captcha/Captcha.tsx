import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./actions";

// Running in 100% passive mode
// For more info on the React lib https://github.com/hCaptcha/react-hcaptcha
export const Captcha = ({
  successCb,
  failCb,
  hCaptchaRef,
  lang,
  hCaptchaSiteKey,
}: {
  successCb: () => void;
  failCb: () => void;
  hCaptchaRef: React.RefObject<HCaptcha | null>;
  lang: string;
  hCaptchaSiteKey: string;
}) => {
  logMessage.info("catpcha component loaded");

  const verify = async (token: string) => {
    try {
      const success = await verifyHCaptchaToken(token);
      if (!success) {
        logMessage.info("Captcha token verification failed");
        failCb();
      } else {
        logMessage.info("Captcha token verification succeeded");
        successCb();
      }
    } catch (err) {
      logMessage.info(`Capcha error: ${err}`);
    }
  };

  const failed = (code: string) => {
    // TODO - do we just allow submitting at this point? (probably)

    // See hCAPTCHA error codes: https://docs.hcaptcha.com/#siteverify-error-codes-table
    logMessage.error(`Captcha error: ${code}`);
  };

  // TODO
  const expired = () => logMessage.info("Captcha Expired");

  return (
    <HCaptcha
      sitekey={hCaptchaSiteKey}
      onVerify={verify}
      onError={failed}
      onExpire={expired}
      ref={hCaptchaRef}
      languageOverride={lang}
      size="invisible"
    />
  );
};
