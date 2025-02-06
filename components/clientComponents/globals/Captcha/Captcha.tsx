import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./actions";

// Known issue: "Only one captcha is permitted per parent container." happens when navigating back to a form page (kind of an edge case)
// https://github.com/hCaptcha/react-hcaptcha/issues/189

// Not an issue on local? "Cookie “__cflb” has been rejected because it is in a cross-site context..."
// I think this is because of local not being http  vs should be https - verify on Staging

// Running in 100% passive mode
// See https://github.com/hCaptcha/react-hcaptcha
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
  hCaptchaSiteKey?: string;
}) => {
  if (!hCaptchaSiteKey) {
    return null;
  }

  logMessage.info("catpcha component loaded"); //temp

  const verify = async (token: string) => {
    try {
      const success = await verifyHCaptchaToken(token);
      if (!success) {
        logMessage.info("hCaptcha verification failed"); // temp
        failCb();
      } else {
        logMessage.info("hCaptcha verification succeeded"); //temp
        successCb();
      }
    } catch (err) {
      logMessage.error(`Capcha error, pass through: ${err}`);

      // TODO: Fall through?
      // successCb();
    }
  };

  // Component will reset immediately after an error.
  // See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const clientComponentError = (code: string) => {
    // TODO: How many times to let retry? e.g. after 5 failed attempts, just pass through?

    logMessage.error(`clientComponentError error: ${code}`);
  };

  // TODO will the SDK just reset itself? any way to trigger?
  const expired = () => logMessage.info("Captcha Expired");

  return (
    <HCaptcha
      sitekey={hCaptchaSiteKey}
      onVerify={verify}
      onError={clientComponentError}
      onExpire={expired}
      ref={hCaptchaRef}
      languageOverride={lang}
      size="invisible"
    />
  );
};
