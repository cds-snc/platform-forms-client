import React, { useEffect, useState } from "react";
import { withFormik, FormikProps } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "@lib/validation";
import { submitToAPI } from "@lib/integration/helpers";
import { useFormTimer } from "@lib/hooks";
import { Button, Alert } from "../index";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { FormValues, InnerFormProps, DynamicFormProps, Responses } from "@lib/types";
import axios from "axios";
import { useFlag, useExternalScript } from "@lib/hooks";
import Loader from "../../globals/Loader";
import classNames from "classnames";

declare global {
  interface Window {
    dataLayer: Array<unknown>;
    grecaptcha: {
      // Maybe a better way to do this
      execute: (arg1: string | undefined, arg2: Record<string, unknown>) => Promise<string>;
      ready: (arg: () => void) => void;
    };
  }
}

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm: React.FC<InnerFormProps & FormikProps<FormValues> & DynamicFormProps> = (
  props: InnerFormProps & FormikProps<FormValues> & DynamicFormProps
) => {
  const { children, handleSubmit, isSubmitting, formConfig } = props;
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(-1);

  const { t } = useTranslation();

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = props.status === "Error" ? t("server-error") : null;
  const timerActive = useFlag("formTimer");
  const [formTimerState, { startTimer, checkTimer, disableTimer }] = useFormTimer();

  const isReCaptchaEnableOnSite = useFlag("reCaptcha");

  useExternalScript(
    `https://www.google.com/recaptcha/api.js?render=${formConfig?.reCaptchaID}`,
    isReCaptchaEnableOnSite
  );

  const [submitTooEarly, setSubmitTooEarly] = useState(false);

  const handleSubmitReCaptcha = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      window.grecaptcha.ready(async () => {
        // get reCAPTCHA response
        const clientToken = await window.grecaptcha.execute(formConfig.reCaptchaID, {
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

  const sendClientTokenForVerification = async (token: string) => {
    // call a backend API to verify reCAPTCHA response
    return await axios({
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
    let timeoutId: ReturnType<typeof setTimeout>;
    // calculate initial delay for submit timer
    if (timerActive) {
      const secondsBaseDelay = 2;
      const secondsPerFormElement = 2;
      const numberOfRequiredElements = formConfig.elements.filter(
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
      {/**
       * method attribute needs to stay here in case javascript does not load
       * otherwise GET request will be sent which will result in leaking all the user data
       * to the URL
       */}
      <form
        id="form"
        data-testid="form"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          if (timerActive) {
            if (!formTimerState.canSubmit) {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: "form_submission_spam_trigger",
                formID: formConfig.formID,
                formTitle: formConfig.titleEn,
                submitTime: formTimerState.remainingTime,
              });
              setSubmitTooEarly(true);
              // In case the useEffect timer failed check again
              //formTimerDispatch({ type: "check" });
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
        <div
          className={classNames({
            "border-l-2": submitTooEarly,
            "border-red-default": submitTooEarly,
            "border-green-default": formTimerState.remainingTime === 0 && submitTooEarly,
            "pl-3": submitTooEarly,
          })}
        >
          {submitTooEarly &&
            (formTimerState.remainingTime > 0 ? (
              <div role="alert">
                <p className="gc-label text-red-default">
                  {t("spam-error.error-part-1")} {formTimerState.timerDelay}{" "}
                  {t("spam-error.error-part-2")}
                </p>
                <p className="gc-description">
                  {t("spam-error.prompt-part-1")} {formTimerState.remainingTime}{" "}
                  {t("spam-error.prompt-part-2")}
                </p>
              </div>
            ) : (
              <div role="alert">
                <p className="gc-label text-green-default">{t("spam-error.success-message")}</p>
                <p className="gc-description">{t("spam-error.success-prompt")}</p>
              </div>
            ))}
          <div className="buttons">
            <Button type="submit">{t("submitButton")}</Button>
          </div>
        </div>
      </form>
    </>
  );
};

/**
 * This is the main Form component that wraps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */
export const Form = withFormik<DynamicFormProps, FormValues>({
  validateOnChange: false,

  validateOnBlur: false,

  enableReinitialize: true, // needed when switching languages

  mapPropsToValues: (props) => getFormInitialValues(props.formConfig, props.language) as FormValues,

  validate: (values, props) => validateOnSubmit(values, props),

  handleSubmit: async (values, formikBag) => {
    try {
      await submitToAPI(values as Responses, formikBag);
    } catch (err) {
      logMessage.error(err as Error);
    } finally {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submission_trigger",
        formID: formikBag.props.formConfig.formID,
        formTitle: formikBag.props.formConfig.titleEn,
      });

      formikBag.setSubmitting(false);
    }
  },
})(InnerForm);

export default Form;
