import { SubmitEvent, useRef, useEffect, useCallback } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { shouldCheckCaptcha } from "@lib/utils/shouldCheckCaptcha";
import { useCaptchaToken } from "./useCaptchaToken";
import { useCaptchaErrorHandling } from "./useCaptchaErrorHandling";

/**
 * Acts as a hCaptcha wrapper to help simplify the wiring around adding hCaptcha to a form.
 */
export const FormCaptcha = ({
  children,
  handleSubmit,
  lang,
  dataTestId = "",
  isPublished = true,
  captchaTokenRef,
  resetCaptchaRef,
  ...rest
}: {
  children: React.ReactNode;
  handleSubmit: (e?: SubmitEvent<HTMLFormElement>) => void;
  lang: string;
  dataTestId?: string;
  isPublished?: boolean;
  captchaTokenRef: React.RefObject<string> | undefined;
  resetCaptchaRef?: React.RefObject<{ resetToken: () => void }>;
} & React.FormHTMLAttributes<HTMLFormElement>) => {
  const hCaptchaRef = useRef<HCaptcha>(null);
  const formSubmitEventRef = useRef<SubmitEvent<HTMLFormElement>>(null);
  const doHCaptchaFlow = shouldCheckCaptcha(isPublished);

  const { setToken, resetToken } = useCaptchaToken(captchaTokenRef, hCaptchaRef);
 
  const HCAPTCHA_SITE_KEY = "72924bde-40f6-4f84-b86a-85ca705ce0c6";

  const { onErrorCallback, hasFatalErrorRef } = useCaptchaErrorHandling({ resetToken });

  useEffect(() => {
    if (resetCaptchaRef) {
      resetCaptchaRef.current.resetToken = resetToken;
    }
  }, [resetCaptchaRef, resetToken]);

  const onFormSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Skip hCaptcha and allow submission though when hCaptcha's disabled or returns a fatal error code
      if (!doHCaptchaFlow || hasFatalErrorRef.current) {
        handleSubmit(event);
        return;
      }

      formSubmitEventRef.current = event;

      // Skip hCaptcha and allow submission though when when hCaptcha itself generates an excepetion (e.g. not loaded yet)
      try {
        if (hCaptchaRef.current) {
          hCaptchaRef.current.execute();
        } else {
          logMessage.warn("hCaptcha: not ready, bypassing hCaptcha and submitting form");
          handleSubmit(event);
        }
      } catch (error) {
        logMessage.warn(
          `hCaptcha: execute() failed, bypassing hCaptcha and submitting form: ${JSON.stringify(error)}`
        );
        handleSubmit(event);
      }
    },
    [doHCaptchaFlow, handleSubmit, hasFatalErrorRef]
  );

  const onTokenGeneratedCallback = useCallback(
    (token: string) => {
      setToken(token);
      handleSubmit(formSubmitEventRef.current as SubmitEvent<HTMLFormElement>);
    },
    [setToken, handleSubmit]
  );

  const onChallengeExpiredCallback = useCallback(() => {
    logMessage.info("hCaptcha: challenge expired");
    resetToken();
  }, [resetToken]);

  return (
    <form
      method="POST"
      {...(dataTestId ? { "data-testid": dataTestId } : {})}
      {...rest}
      onSubmit={onFormSubmit}
    >
      {children}
      {doHCaptchaFlow && (
        <HCaptcha
          ref={hCaptchaRef}
          sitekey={HCAPTCHA_SITE_KEY || ""}
          onVerify={onTokenGeneratedCallback}
          onError={onErrorCallback}
          onChalExpired={onChallengeExpiredCallback}
          onExpire={resetToken}
          languageOverride={lang}
          size="invisible"
          loadAsync={true}
        />
      )}
    </form>
  );
};
