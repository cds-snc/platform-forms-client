import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { hCaptchaEnabled } from "./helpers";
import { FormEvent, useRef } from "react";

/**
 * Acts as a HCaptcha wrapper to simplify the wiring around adding hCaptcha to a form. When hCaptcha
 * is enable a form is wired up to use hCaptcha and returned. Otherwise a default form is returned.
 *
 * Note: hCaptcha is currently running in "100% Passive" mode that will never challenge users. The
 * mode is set at account level.
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

  const { getFlag } = useFeatureFlags();
  const captchaEnabled = hCaptchaEnabled(getFlag("hCaptcha"), hCaptchaSiteKey, isPreview);

  if (captchaEnabled && !hCaptchaSiteKey) {
    logMessage.error("hCaptcha: hCaptchaSiteKey is missing");
    return null;
  }

  const onVerified = async (token: string) => {
    if (captchaToken) {
      captchaToken.current = token;
    }
    handleSubmit(formSubmitEventRef.current as FormEvent<HTMLFormElement>);
  };

  if (!captchaEnabled) {
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
