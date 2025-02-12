import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./actions";
import { useRouter } from "next/navigation";

/**
 * Notes:
 * - Running in 100% passive mode - nope running 99.9% at the moment
 * - an invalid sitekey will cause the HCaptcha component fail without calling the onError callback
 *    (easy to spot looking in the network console)
 * - Seeing this error means an accessible cookie is set. None should be set, check the config.
 *    "Cookie “__cflb” has been rejected because it is in a cross-site context..."
 * - Known issue: "Only one captcha is permitted per parent container." happens when navigating
 *    back to a form page (kind of an edge case).
 *    See https://github.com/hCaptcha/react-hcaptcha/issues/189
 * - Local 192.* IPs will auto pass validation but be ignored by session evaluation (not in analytitics)
 */
export const Captcha = ({
  successCb,
  hCaptchaRef,
  lang,
  hCaptchaSiteKey,
}: {
  successCb: () => void;
  hCaptchaRef: React.RefObject<HCaptcha | null>;
  lang: string;
  hCaptchaSiteKey: string | undefined;
}) => {
  const router = useRouter();

  if (!hCaptchaSiteKey) {
    logMessage.error("hCaptcha not loaded because hCaptchaSiteKey is not set");
    return null;
  }

  // Verify the token on the server side.
  const verify = async (token: string) => {
    try {
      const success = await verifyHCaptchaToken(token);
      if (!success) {
        router.push(`/${lang}/error`);
      } else {
        successCb();
      }
    } catch (err) {
      logMessage.error(`hCapcha system error. Let user submit: ${err}`);
      successCb();
    }
  };

  // Component will reset immediately after an error.
  // See https://docs.hcaptcha.com/#siteverify-error-codes-table
  const clientComponentError = (code: string) => {
    logMessage.error(`clientComponentError error: ${code}`);
  };

  const tokenExpired = () => {
    logMessage.info("hCaptcha token expired");
    hCaptchaRef.current?.resetCaptcha();
  };

  const challengeExpired = () => {
    logMessage.info("hCaptcha challenge expired");
    hCaptchaRef.current?.resetCaptcha();
  };

  // See https://github.com/hCaptcha/react-hcaptcha
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
