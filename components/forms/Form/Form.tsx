import React, { useEffect, useState } from "react";
import { FormikProps, withFormik } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList, setFocusOnErrorMessage, validateOnSubmit } from "@lib/validation";
import { submitToAPI } from "@lib/helpers";
import { useExternalScript, useFlag, useFormTimer } from "@lib/hooks";
import { Alert, Button, RichText } from "@components/forms";
import { logMessage } from "@lib/logger";
import { useTranslation, TFunction } from "next-i18next";
import axios from "axios";
import Loader from "../../globals/Loader";
import classNames from "classnames";
import { Responses, PublicFormRecord } from "@lib/types";
import { NextRouter } from "next/router";
interface SubmitButtonProps {
  submitTooEarly: boolean;
  checkTimer: () => void;
  timerDelay?: number;
  remainingTime: number;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({
  submitTooEarly,
  checkTimer,
  timerDelay,
  remainingTime,
}) => {
  const { t } = useTranslation();
  const [countDown, setCountDown] = useState(remainingTime);
  useEffect(() => {
    const intervalID = setInterval(() => {
      setCountDown((prev) => --prev);
    }, 1000);
    logMessage.debug(`Created interval ${intervalID}`);

    // Ensures the inverval timer is stopped when coundDown gets to zero
    const timeoutID = setTimeout(() => {
      logMessage.debug(`Remaining Time: ${remainingTime}`);
      logMessage.debug(`Cancelling interval ${intervalID}`);
      clearInterval(intervalID);
    }, remainingTime * 1000);

    return () => {
      logMessage.debug(`Clearing out interval ${intervalID} and timeout ${timeoutID}`);
      clearInterval(intervalID);
      clearTimeout(timeoutID);
    };
  }, [remainingTime, timerDelay]);

  return (
    <>
      <div
        className={classNames({
          "border-l-2": submitTooEarly,
          "border-red-default": submitTooEarly,
          "border-green-default": submitTooEarly && countDown === 0,
          "pl-3": submitTooEarly,
        })}
      >
        {submitTooEarly &&
          (countDown > 0 ? (
            <div role="alert">
              <p className="gc-label text-red-default">
                {t("spam-error.error-part-1")} {timerDelay} {t("spam-error.error-part-2")}
              </p>
              <p className="gc-description">
                {t("spam-error.prompt-part-1")} {countDown} {t("spam-error.prompt-part-2")}
              </p>
            </div>
          ) : (
            <div role="alert">
              <p className="gc-label text-green-default">{t("spam-error.success-message")}</p>
              <p className="gc-description">{t("spam-error.success-prompt")}</p>
            </div>
          ))}
      </div>
      <Button type="submit" onClick={() => checkTimer()}>
        {t("submitButton")}
      </Button>
    </>
  );
};

type InnerFormProps = FormProps & FormikProps<Responses>;

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm: React.FC<InnerFormProps> = (props) => {
  const {
    children,
    handleSubmit,
    isSubmitting,
    formRecord: { id: formID, reCaptchaID, form },
  }: InnerFormProps = props;
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(-1);
  const timerActive = useFlag("formTimer");
  const { t } = useTranslation();

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = props.status === "Error" ? t("server-error") : null;

  const isReCaptchaEnableOnSite = useFlag("reCaptcha");

  const [formTimerState, { startTimer, checkTimer, disableTimer }] = useFormTimer();
  const [submitTooEarly, setSubmitTooEarly] = useState(false);

  useExternalScript(
    `https://www.google.com/recaptcha/api.js?render=${reCaptchaID}`,
    isReCaptchaEnableOnSite
  );

  const handleSubmitReCaptcha = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      window.grecaptcha.ready(async () => {
        // get reCAPTCHA response
        const clientToken = await window.grecaptcha.execute(reCaptchaID, {
          action: "submit",
        });
        if (clientToken) {
          const scoreData = await sendClientTokenForVerification(clientToken);
          const { score, success } = scoreData.data;
          logMessage.info(`score : ${score}  status: ${success}`);
          // assuming you're not a Robot
          handleSubmit(evt);
        }
      });
    } catch (error) {
      logMessage.error(error as string);
    }
  };

  const sendClientTokenForVerification = (token: string) => {
    // call a backend API to verify reCAPTCHA response
    return axios({
      url: "/api/verify",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        userToken: token,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  };

  //  If there are errors on the page, set focus the first error field
  useEffect(() => {
    if (formStatusError) {
      setFocusOnErrorMessage(props, serverErrorId);
    }

    if (!props.isValid && !canFocusOnError) {
      if (props.submitCount > lastSubmitCount) {
        setCanFocusOnError(true);
        setLastSubmitCount(props.submitCount);
      }
    } else if (!props.isValid) {
      setFocusOnErrorMessage(props, errorId);
      setCanFocusOnError(false);
    }
  }, [formStatusError, errorList, lastSubmitCount, canFocusOnError]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // calculate initial delay for submit timer
    if (timerActive) {
      const secondsBaseDelay = 2;
      const secondsPerFormElement = 2;
      const numberOfRequiredElements = form.elements.filter(
        (element) => element.properties.validation?.required === true
      ).length;

      const submitDelaySeconds =
        secondsBaseDelay + numberOfRequiredElements * secondsPerFormElement;
      startTimer(submitDelaySeconds);
      // Initiate a callback to ensure that state of submit button is correctly displayed
      timeoutId = setTimeout(() => {
        checkTimer();
      }, submitDelaySeconds * 1000);
    } else {
      disableTimer();
    }

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [timerActive]);

  return isSubmitting || (props.submitCount > 0 && props.isValid && !formStatusError) ? (
    <Loader message={t("loading")} />
  ) : (
    <>
      {formStatusError && (
        <Alert type="error" heading={formStatusError} tabIndex={0} id={serverErrorId} />
      )}
      {errorList && (
        <Alert
          type="error"
          heading={t("input-validation.heading")}
          validation={true}
          id={errorId}
          tabIndex={0}
        >
          {errorList}
        </Alert>
      )}

      {
        <>
          <RichText>
            {form.introduction &&
              form.introduction[props.language == "en" ? "descriptionEn" : "descriptionFr"]}
          </RichText>

          <form
            id="form"
            data-testid="form"
            /**
             * method attribute needs to stay here in case javascript does not load
             * otherwise GET request will be sent which will result in leaking all the user data
             * to the URL
             */
            method="POST"
            onSubmit={(e) => {
              e.preventDefault();
              if (timerActive) {
                if (!formTimerState.canSubmit) {
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({
                    event: "form_submission_spam_trigger",
                    formID: formID,
                    formTitle: form.titleEn,
                    submitTime: formTimerState.remainingTime,
                  });
                  setSubmitTooEarly(true);
                  // In case the useEffect timer failed check again
                  return;
                }
                // Only change state if submitTooEarly is already set to true
                submitTooEarly && setSubmitTooEarly(false);
              }

              if (isReCaptchaEnableOnSite) {
                handleSubmitReCaptcha(e);
              } else {
                handleSubmit(e);
              }
            }}
            noValidate
          >
            {children}

            <RichText>
              {form.privacyPolicy &&
                form.privacyPolicy[props.language == "en" ? "descriptionEn" : "descriptionFr"]}
            </RichText>
            {props.renderSubmit ? (
              props.renderSubmit()
            ) : (
              <SubmitButton
                submitTooEarly={submitTooEarly}
                checkTimer={checkTimer}
                remainingTime={formTimerState.remainingTime}
                timerDelay={formTimerState.timerDelay}
                key={formTimerState.timerDelay}
              />
            )}
          </form>
        </>
      }
    </>
  );
};

interface FormProps {
  formRecord: PublicFormRecord;
  language: string;
  router: NextRouter;
  isReCaptchaEnableOnSite?: boolean;
  isPreview?: boolean;
  renderSubmit?: () => JSX.Element;
  onSuccess?: (id: string) => void;
  children?: (JSX.Element | undefined)[] | null;
  t: TFunction;
}

/**
 * This is the main Form component that wraps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */

export const Form = withFormik<FormProps, Responses>({
  validateOnChange: false,

  validateOnBlur: false,

  enableReinitialize: true, // needed when switching languages

  mapPropsToValues: (props) => getFormInitialValues(props.formRecord, props.language),

  validate: (values, props) => validateOnSubmit(values, props),

  handleSubmit: async (values, formikBag) => {
    try {
      const result = await submitToAPI(values, formikBag, formikBag.props.onSuccess ? false : true);
      result && formikBag.props.onSuccess && formikBag.props.onSuccess(result);
    } catch (err) {
      logMessage.error(err as Error);
    } finally {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submission_trigger",
        formID: formikBag.props.formRecord.id,
        formTitle: formikBag.props.formRecord.form.titleEn,
      });

      formikBag.setSubmitting(false);
    }
  },
})(InnerForm);
