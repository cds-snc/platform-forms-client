import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FormEvent, useRef } from "react";

/**
 * Acts as a hCaptcha wrapper to help simplify the wiring around adding hCaptcha to a form.
 */
export const FormCaptcha = ({
  children,
  handleSubmit,
  lang,
  dataTestId = "",
  isPublished = true,
  captchaToken,
  ...rest
}: {
  children: React.ReactNode;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  lang: string;
  dataTestId?: string;
  isPublished?: boolean;
  captchaToken: React.RefObject<string> | undefined;
} & React.FormHTMLAttributes<HTMLFormElement>) => {
  const hCaptchaRef = useRef<HCaptcha>(null);
  const formSubmitEventRef = useRef<FormEvent<HTMLFormElement>>(null);

  // Help developers understand when there is a configuration issue
  const { getFlag } = useFeatureFlags();
  const hCaptcha = getFlag("hCaptcha");

  const HCAPTCHA_SITE_KEY = "72924bde-40f6-4f84-b86a-85ca705ce0c6";

  if (
    process.env.NODE_ENV === "development" &&
    hCaptcha &&
    // !process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
    !HCAPTCHA_SITE_KEY
  ) {
    logMessage.warn(`hCaptcha: flag is enabled but hCaptchaSiteKey is missing. This will cause 
      hCaptcha to fail. Add the hCaptchaSiteKey to the App settings and make sure the
      HCAPTCHA_SITE_VERIFY_KEY is in your .env`);
  }

  const onVerified = async (token: string) => {
    if (captchaToken) {
      captchaToken.current = token;
    }
    handleSubmit(formSubmitEventRef.current as FormEvent<HTMLFormElement>);
  };

  // Skip the hCaptcha flow for test and Draft forms where we don't need an hCaptcha verification
  const doHCaptchaFlow = process.env.NEXT_PUBLIC_APP_ENV !== "test" && isPublished;

  // see https://github.com/hCaptcha/react-hcaptcha
  return (
    <form
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();

        if (!doHCaptchaFlow) {
          handleSubmit(e);
          return;
        }

        // The submit event is captured here so it can be used later in the passed in handleSubmit(e)
        // that is called in onVerified() that is triggerd below via hCaptchaRef.current.execute()
        // and later called from HCaptcha component event onVerify.
        formSubmitEventRef.current = e;
        hCaptchaRef.current?.execute();
      }}
      {...(dataTestId ? { "data-testid": dataTestId } : {})}
      {...rest}
    >
      {children}
      {doHCaptchaFlow && (
        <HCaptcha
          // sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
          sitekey={HCAPTCHA_SITE_KEY || ""}
          onVerify={onVerified}
          // Component will reset immediately after a Client sends bad data.
          // Note: An invalid sitekey will cause the HCaptcha component to fail without calling onError
          onError={(code: string) => {
            // @TODO investigate cases where the submission should be allowed through based on error code
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
      )}
    </form>
  );
};
