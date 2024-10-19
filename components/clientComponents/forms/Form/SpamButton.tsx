import { Button } from "@clientComponents/globals";
import useFormTimer from "@lib/hooks/useFormTimer";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface SpamButtonProps {
  numberOfRequiredQuestions: number;
  formID: string;
  formTitle: string;
  callback?: () => void;
}
export const SpamButton: React.FC<SpamButtonProps> = ({
  numberOfRequiredQuestions,
  formID,
  formTitle,
  callback,
}) => {
  const { t } = useTranslation();
  const [formTimerState, { startTimer, checkTimer, disableTimer }] = useFormTimer();
  const [submitTooEarly, setSubmitTooEarly] = useState(false);
  const screenReaderRemainingTime = useRef(formTimerState.remainingTime);

  // calculate initial delay for submit timer
  const secondsBaseDelay = 2;
  const secondsPerFormElement = 2;
  const submitDelaySeconds = secondsBaseDelay + numberOfRequiredQuestions * secondsPerFormElement;

  const formTimerEnabled = process.env.NEXT_PUBLIC_APP_ENV !== "test";

  // If the timer hasn't started yet, start the timer
  if (!formTimerState.timerDelay && formTimerEnabled) startTimer(submitDelaySeconds);

  useEffect(() => {
    if (!formTimerEnabled && !formTimerState.canSubmit) {
      disableTimer();
    }
  }, [disableTimer, formTimerEnabled, formTimerState.canSubmit]);

  useEffect(() => {
    if (formTimerEnabled) {
      // Initiate a callback to ensure that state of submit button is correctly displayed

      // Calling the checkTimer modifies the state of the formTimerState
      // Which recalls this useEffect at least every second
      const timerID = setTimeout(() => checkTimer(), 1000);

      return () => {
        clearTimeout(timerID);
      };
    }
  }, [checkTimer, formTimerState.timerDelay, formTimerEnabled]);

  return (
    <>
      <div
        className={classNames({
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

          // debugger;
          e.preventDefault(); // even though not a submit, just encase
          callback && callback();
        }}
      >
        Spam button
      </Button>
    </>
  );
};
