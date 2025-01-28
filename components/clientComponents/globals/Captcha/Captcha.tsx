import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./helpers";

// IT BEGINS!!! This definitely doesn't work yet \o/
export const Captcha = ({
  successCb,
  failCb,
  hCaptchaSiteKey,
  hCaptchaRef,
  lang,
}: {
  successCb: () => void;
  failCb: () => void;
  hCaptchaSiteKey: string;
  hCaptchaRef: React.RefObject<HCaptcha | null>;
  lang: string;
}) => {
  if (!successCb || typeof successCb !== "function") {
    return;
  }

  // For more info on the React lib https://github.com/hCaptcha/react-hcaptcha
  return (
    <HCaptcha
      sitekey={hCaptchaSiteKey || ""}
      onVerify={async (token: string) => {
        logMessage.info(`Captcha token = ${token}`); // TODO remove
        const success = await verifyHCaptchaToken(token);
        if (!success) {
          logMessage.info("Captcha token verification failed");
          failCb && typeof failCb === "function" && failCb();
        } else {
          logMessage.info("Captcha token verification succeeded"); // TODO remove
          successCb();
        }
      }}
      onError={() => logMessage.info("Captcha Error")} // TODO
      onExpire={() => logMessage.info("Captcha Expired")} // TODO
      ref={hCaptchaRef}
      languageOverride={lang}
      size="invisible" // 100% passive mode
    />
  );
};
