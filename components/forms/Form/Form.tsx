import React, { ReactElement, useEffect, useState } from "react";
import { withFormik, FormikProps } from "formik";
import { GenerateElementProps, getFormInitialValues } from "@lib/formBuilder";
import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "@lib/validation";
import { submitToAPI } from "@lib/integration/helpers";
import { Button, Alert } from "../index";
import { logMessage } from "@lib/logger";
import { FormValues, InnerFormProps, DynamicFormProps, Responses } from "@lib/types";
import Loader from "../../globals/Loader";
import classNames from "classnames";

declare global {
  interface Window {
    dataLayer: Array<unknown>;
  }
}

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm = (props: InnerFormProps & FormikProps<FormValues> & DynamicFormProps) => {
  const { children, handleSubmit, t, isSubmitting, formConfig } = props;
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(-1);

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = props.status === "Error" ? t("server-error") : null;
  const [submitDelay, setSubmitDelay] = useState(0);
  const [submitTimer, setSubmitTimer] = useState(0);
  const [submitTooEarly, setSubmitTooEarly] = useState(false);

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
    if (!formConfig) {
      return;
    }

    // calculate initial delay for submit timer
    const secondsBaseDelay = 2;
    const secondsPerFormElement = 2;
    const numberOfRequiredElements = formConfig.elements.filter((element) => {
      if (!element) {
        return false;
      }
      return element.properties.validation?.required === true;
    }).length;

    const submitDelaySeconds = secondsBaseDelay + numberOfRequiredElements * secondsPerFormElement;
    setSubmitDelay(submitDelaySeconds);
    setSubmitTimer(submitDelaySeconds);
  }, [formConfig]);

  useEffect(() => {
    // timeout to prevent form from being submitted too quickly
    let timeoutId = 0;
    if (submitTimer > 0) {
      timeoutId = setTimeout(() => {
        setSubmitTimer((submitTimer) => submitTimer - 1);
      }, 1000) as unknown as number;
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [submitTimer]);

  return (
    <>
      {isSubmitting || (props.submitCount > 0 && props.isValid && !formStatusError) ? (
        <Loader loading={isSubmitting} message={t("loading")} />
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
            onSubmit={(e) => {
              if (submitTimer) {
                setSubmitTooEarly(true);
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                  event: "form_submission_spam_trigger",
                  formID: formConfig.formID,
                  formTitle: formConfig.titleEn,
                  submitTime: submitDelay - submitTimer,
                });
                if (submitTimer < 5) setSubmitTimer(5);
                e.preventDefault();
                return;
              }
              setSubmitTooEarly(false);
              handleSubmit(e);
            }}
            method="POST"
            noValidate
          >
            {children}
            <div
              className={classNames({
                "border-l-2": submitTimer >= 0 && submitTooEarly,
                "border-red-default": submitTimer >= 0 && submitTooEarly,
                "border-green-default": submitTimer == 0 && submitTooEarly,
                "pl-3": submitTimer >= 0 && submitTooEarly,
              })}
            >
              {submitTimer > 0 && submitTooEarly && (
                <div role="alert">
                  <p className="gc-label text-red-default">
                    {t("spam-error.error-part-1")} {submitDelay} {t("spam-error.error-part-2")}
                  </p>
                  <p className="gc-description">
                    {t("spam-error.prompt-part-1")} {submitTimer} {t("spam-error.prompt-part-2")}
                  </p>
                </div>
              )}
              {submitTimer == 0 && submitTooEarly && (
                <div role="alert">
                  <p className="gc-label text-green-default">{t("spam-error.success-message")}</p>
                  <p className="gc-description">{t("spam-error.success-prompt")}</p>
                </div>
              )}
              <div className="buttons">
                <Button type="submit">{t("submitButton")}</Button>
              </div>
            </div>
          </form>
        </>
      )}
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
