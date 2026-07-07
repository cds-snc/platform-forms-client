import { SubmitEvent, useRef, useEffect, useCallback } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { shouldCheckCaptcha } from "@lib/utils/shouldCheckCaptcha";
import { useCaptchaToken } from "./useCaptchaToken";
import { useCaptchaErrorHandling } from "./useCaptchaErrorHandling";
import { CaptchaDebugPanel } from "./CaptchaDebugPanel";

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
  hCaptchaDebugEnabled = false,
  ...rest
}: {
  children: React.ReactNode;
  handleSubmit: (e?: SubmitEvent<HTMLFormElement>) => void;
  lang: string;
  dataTestId?: string;
  isPublished?: boolean;
  captchaTokenRef: React.RefObject<string> | undefined;
  resetCaptchaRef?: React.RefObject<(() => void) | undefined>;
  hCaptchaDebugEnabled?: boolean;
} & React.FormHTMLAttributes<HTMLFormElement>) => {
  const hCaptchaRef = useRef<HCaptcha>(null);
  const formSubmitEventRef = useRef<SubmitEvent<HTMLFormElement>>(null);
  const doHCaptchaFlow = shouldCheckCaptcha(isPublished);

  const { setToken, resetToken } = useCaptchaToken(captchaTokenRef, hCaptchaRef);

  const { onErrorCallback, hasFatalErrorRef } = useCaptchaErrorHandling({
    resetToken,
    handleSubmit,
    formSubmitEventRef,
  });

  // Expose resetToken function to parent components via resetCaptchaRef ref
  useEffect(() => {
    if (resetCaptchaRef) {
      resetCaptchaRef.current = resetToken;
    }
  }, [resetCaptchaRef, resetToken]);

  const onFormSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Skip hCaptcha if flow disabled or fatal error returned from hCaptcha
      if (!doHCaptchaFlow || hasFatalErrorRef.current) {
        handleSubmit(event);
        return;
      }

      formSubmitEventRef.current = event;

      // For any case that hCaptcha is the cause of failure (e.g. not loaded yet), allow the form to submit
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
    <>
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
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
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
      <h1>
        hCaptchaDebugEnabled={hCaptchaDebugEnabled ? "true" : "false"}, doHCaptchaFlow=
        {doHCaptchaFlow ? "true" : "false"}, process.env.NEXT_PUBLIC_APP_ENV === production{" "}
        {process.env.NEXT_PUBLIC_APP_ENV === "production" ? "true" : "false"}
      </h1>
      <CaptchaDebugPanel
        hCaptchaRef={hCaptchaRef}
        captchaTokenRef={captchaTokenRef}
        doHCaptchaFlow={doHCaptchaFlow}
        hasFatalErrorRef={hasFatalErrorRef}
        onErrorCallback={onErrorCallback}
        resetToken={resetToken}
        hCaptchaDebugEnabled={hCaptchaDebugEnabled}
      />
    </>
  );
};
