import React, { useEffect, useRef, useState } from "react";
import { Button } from "@clientComponents/globals";
import useFormTimer from "@lib/hooks/useFormTimer";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { logMessage } from "@lib/logger";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

interface SubmitButtonProps {
  getFormDelay: () => number;
  formID: string;
  formTitle: string;
}
export const SubmitButton: React.FC<SubmitButtonProps> = ({ getFormDelay, formID, formTitle }) => {
  const { t } = useTranslation();
  const [formTimerState, { startTimer, checkTimer, disableTimer }] = useFormTimer();
  const [submitTooEarly, setSubmitTooEarly] = useState(false);
  const screenReaderRemainingTime = useRef(formTimerState.remainingTime);
  const formDelay = useRef(getFormDelay());

  const { getFlag } = useFeatureFlags();
  const timerEnabled = getFlag("formTimer");

  // If the formDelay is less than 0 or the app is in test mode, disable the timer
  // because the user has already spent enough time on the form.

  const formTimerEnabled =
    process.env.NEXT_PUBLIC_APP_ENV !== "test" && timerEnabled && formDelay.current > 0;

  // The empty array of dependencies ensures that this useEffect only runs once on mount
  useEffect(() => {
    if (formTimerEnabled) {
      logMessage.debug(`Starting Form Timer with delay: ${formDelay.current}`);
      startTimer(formDelay.current);
    } else {
      disableTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formTimerEnabled && formTimerState.remainingTime > 0) {
      // Initiate a callback to ensure that state of submit button is correctly displayed

      // Calling the checkTimer modifies the state of the formTimerState
      // Which recalls this useEffect at least every second
      const timerID = setTimeout(() => checkTimer(), 1000);

      return () => {
        clearTimeout(timerID);
      };
    }
  }, [checkTimer, formTimerState.remainingTime, formTimerEnabled]);

  return (
    <>
      <div
        className={cn({
          "border-l-2": submitTooEarly,
          "border-red-default": submitTooEarly && formTimerState.remainingTime > 0,
          "border-green-default": submitTooEarly && formTimerState.remainingTime === 0,
          "pl-3": submitTooEarly,
        })}
      >
        {submitTooEarly &&
          (formTimerState.remainingTime > 0 ? (
            <>
              <div role="alert" className="gc-label text-red-default">
                {t("spam-error.error-part-1")} {formTimerState.timerDelay}{" "}
                {t("spam-error.error-part-2")}
                <span className="sr-only">
                  {" "}
                  {t("spam-error.prompt-part-1")} {screenReaderRemainingTime.current}{" "}
                  {t("spam-error.prompt-part-2")}
                </span>
              </div>
              <div aria-hidden={true} className="gc-description">
                {t("spam-error.prompt-part-1")} {formTimerState.remainingTime}{" "}
                {t("spam-error.prompt-part-2")}
              </div>
            </>
          ) : (
            <div role="alert">
              <p className="gc-label text-green-default">{t("spam-error.success-message")}</p>
              <p className="gc-description">{t("spam-error.success-prompt")}</p>
            </div>
          ))}
      </div>
      <Button
        id="form-submit-button"
        type="submit"
        onClick={(e) => {
          if (formTimerEnabled) checkTimer();
          screenReaderRemainingTime.current = formTimerState.remainingTime;
          if (!formTimerState.canSubmit) {
            e.preventDefault();
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: "form_submission_spam_trigger",
              formID: formID,
              formTitle: formTitle,
              submitTime: formTimerState.remainingTime,
            });

            setSubmitTooEarly(true);
            // In case the useEffect timer failed check again
            return;
          }
          // Only change state if submitTooEarly is already set to true
          submitTooEarly && setSubmitTooEarly(false);
        }}
      >
        {t("submitButton")}
      </Button>
    </>
  );
};
