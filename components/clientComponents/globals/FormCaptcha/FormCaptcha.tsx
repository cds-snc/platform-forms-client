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
  id = "",
  dataTestId = "",
  className = "",
  noValidate = true,
  captchaToken,
}: {
  children: React.ReactNode;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  lang: string;
  id?: string;
  dataTestId?: string;
  className?: string;
  noValidate?: boolean;
  captchaToken: React.RefObject<string> | undefined;
}) => {
  const hCaptchaRef = useRef<HCaptcha>(null);
  const formSubmitEventRef = useRef<FormEvent<HTMLFormElement>>(null);

  // Help developers understand when there is a configuration issue
  const { getFlag } = useFeatureFlags();
  const hCaptcha = getFlag("hCaptcha");

  if (
    process.env.NODE_ENV === "development" &&
    hCaptcha &&
    !process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
  ) {
    logMessage.info(`hCaptcha: flag is enabled but hCaptchaSiteKey is missing. This will cause 
      hCaptcha to fail. Add the hCaptchaSiteKey to the App settings and make sure the
      HCAPTCHA_SITE_VERIFY_KEY is in your .env`);
  }

  const onVerified = async (token: string) => {
    if (captchaToken) {
      captchaToken.current = token;
    }
    handleSubmit(formSubmitEventRef.current as FormEvent<HTMLFormElement>);
  };

  // see https://github.com/hCaptcha/react-hcaptcha
  return (
    <form
      {...(id ? { id } : {})}
      {...(dataTestId ? { "data-testid": dataTestId } : {})}
      {...(className ? { className } : {})}
      {...(noValidate ? { noValidate } : {})}
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();

        if (process.env.APP_ENV === "test") {
          handleSubmit(e);
          return;
        }

        // The submit event is captured here so it can be used later in the passed in handleSubmit(e)
        // that is called in onVerified() that is triggerd below via hCaptchaRef.current.execute()
        // and later called from HCaptcha component event onVerify.
        formSubmitEventRef.current = e;
        hCaptchaRef.current?.execute();
      }}
    >
      {children}
      <HCaptcha
        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
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
    </form>
  );
};
