import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FormEvent, useRef } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Acts as a hCaptcha wrapper to help simplify the wiring around adding hCaptcha to a form.
 *
 * Test hCapcha failing by adding `?hCaptchaForceFail` to the URL.
 */
export const FormCaptcha = ({
  children,
  hCaptchaSiteKey = "",
  handleSubmit,
  lang,
  id = "",
  dataTestId = "",
  className = "",
  isPreview = false,
  noValidate = true,
  captchaToken,
}: {
  children: React.ReactNode;
  hCaptchaSiteKey: string | undefined;
  // Determines whether or not to block a user marked as a bot by siteverify from submitting a form
  blockableMode?: boolean;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  lang: string;
  id?: string;
  dataTestId?: string;
  className?: string;
  isPreview?: boolean;
  noValidate?: boolean;
  captchaToken: React.RefObject<string> | undefined;
}) => {
  const hCaptchaRef = useRef<HCaptcha>(null);
  const formSubmitEventRef = useRef<FormEvent<HTMLFormElement>>(null);

  const hCaptchaForceFail = useSearchParams().has("hCaptchaForceFail");

  const { getFlag } = useFeatureFlags();
  const hCaptcha = getFlag("hCaptcha");
  const disableHCaptcha = !hCaptcha || isPreview || process.env.NEXT_PUBLIC_APP_ENV === "test";

  // Help developers understand when there is a configuration issue
  if (process.env.NODE_ENV === "development" && hCaptcha && !isPreview && !hCaptchaSiteKey) {
    logMessage.info(`hCaptcha: flag is enabled but hCaptchaSiteKey is missing. This will cause 
      hCaptcha to fail. Add the hCaptchaSiteKey to the App settings and make sure the
      HCAPTCHA_SITE_VERIFY_KEY is in your .env`);
  }

  const onVerified = async (token: string) => {
    if (captchaToken) {
      captchaToken.current = hCaptchaForceFail ? "INVALID_TOKEN_TEST" : token;
    }
    handleSubmit(formSubmitEventRef.current as FormEvent<HTMLFormElement>);
  };

  // For cases hCAPTCHA is intentionally disable, like in Preview mode, use the legacy form
  // without the hCaptcha flow.
  if (disableHCaptcha) {
    return (
      <form
        {...(id ? { id } : {})}
        {...(dataTestId ? { "data-testid": dataTestId } : {})}
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
          handleSubmit(e);
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
      {...(dataTestId ? { "data-testid": dataTestId } : {})}
      {...(className ? { className } : {})}
      {...(noValidate ? { noValidate } : {})}
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        // The submit event is captured here so it can be used later in the passed in handleSubmit(e)
        // that is called in onVerified() that is triggerd below via hCaptchaRef.current.execute()
        // and later called from HCaptcha component event onVerify.
        formSubmitEventRef.current = e;
        hCaptchaRef.current?.execute();
      }}
    >
      {children}
      <HCaptcha
        sitekey={hCaptchaSiteKey}
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
