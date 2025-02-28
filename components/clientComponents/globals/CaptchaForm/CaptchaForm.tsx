import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { verifyHCaptchaToken } from "./actions";
import { useRouter } from "next/navigation";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { hCaptchaEnabled } from "./helpers";
import { FormEvent, useRef } from "react";

// Running in "100% Passive" mode that will never challenge users. The mode is set at account level.
// In the future we hope to use "99.9% Passive hybrid" that will show an A11Y prompt for the .1%
// suspicious users.
export const CaptchaForm = ({
  blockableMode = false,
  hCaptchaSiteKey = "",
  children,
  onSubmit,
  lang,
  id = "",
  dataTestId = "",
  className = "",
  noValidate = true,
}: {
  hCaptchaSiteKey: string | undefined;
  // Determines whether or not to block a user marked as a bot by siteverify from submitting a form
  blockableMode?: boolean;
  children: React.ReactNode;
  onSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  lang: string;
  id?: string;
  dataTestId?: string;
  className?: string;
  noValidate?: boolean;
}) => {
  const router = useRouter();

  const formEventRef = useRef<FormEvent<HTMLFormElement>>(null);

  const { getFlag } = useFeatureFlags();
  const captchaEnabled = hCaptchaEnabled(getFlag("hCaptcha"), hCaptchaSiteKey);
  const hCaptchaRef = useRef<HCaptcha>(null);

  if (captchaEnabled && !hCaptchaSiteKey) {
    logMessage.error("hCaptcha: hCaptchaSiteKey is missing");
    return null;
  }

  // Verify the hCAPTCHA token on the server side
  const verify = async (token: string) => {
    try {
      const success = await verifyHCaptchaToken(token);
      if (success) {
        logMessage.info(`hCaptcha: success`);
        onSubmit(formEventRef.current as FormEvent<HTMLFormElement>);
      } else if (blockableMode) {
        logMessage.info(`hCaptcha: failed and submission blocked`);
        router.push(`/${lang}/unable-to-process`);
      } else {
        logMessage.info(`hCaptcha: failed and submission allowed`);
        onSubmit(formEventRef.current as FormEvent<HTMLFormElement>);
      }
    } catch (err) {
      logMessage.error(`hCaptcha: system error ${err}`);
      // Don't block the user from submitting on a system error
      onSubmit(formEventRef.current as FormEvent<HTMLFormElement>);
    }
  };

  if (!captchaEnabled) {
    return (
      <form
        {...(id ? { id } : {})}
        {...(dataTestId ? { "data-test-id": dataTestId } : {})}
        {...(className ? { className } : {})}
        {...(noValidate ? { noValidate } : {})}
        /**
         * method attribute needs to stay here in case javascript does not load
         * otherwise GET request will be sent which will result in leaking all the user data
         * to the URL
         */
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        {children}
      </form>
    );
  }

  // see https://github.com/hCaptcha/react-hcaptcha
  return (
    <form
      {...(id ? { id } : {})}
      {...(dataTestId ? { "data-test-id": dataTestId } : {})}
      {...(className ? { className } : {})}
      {...(noValidate ? { noValidate } : {})}
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        formEventRef.current = e;
        hCaptchaRef.current?.execute();
      }}
    >
      {children}
      <HCaptcha
        sitekey={hCaptchaSiteKey}
        onVerify={verify}
        // Component will reset immediately after a Client sends bad data.
        // Note: An invalid sitekey will cause the HCaptcha component to fail without calling onError
        onError={(code: string) => {
          // see https://docs.hcaptcha.com/#siteverify-error-codes-table
          logMessage.warn(`hCatpcha: clientComponentError error ${code}`);
        }}
        onChalExpired={() => {
          logMessage.info("hCaptcha: challenge expired");
          hCaptchaRef.current?.resetCaptcha();
        }}
        onExpire={() => {
          logMessage.info("hCaptcha: token expired");
          hCaptchaRef.current?.resetCaptcha();
        }}
        ref={hCaptchaRef}
        languageOverride={lang}
        // Do not show a checkbox
        size="invisible"
      />
    </form>
  );
};
