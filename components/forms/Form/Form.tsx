import React, { ReactElement, useEffect, useState } from "react";
import { withFormik, FormikProps } from "formik";
import { GenerateElementProps, getFormInitialValues } from "@lib/formBuilder";
import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "@lib/validation";
import { submitToAPI } from "@lib/integration/helpers";
import { Button, Alert } from "../index";
import { logMessage } from "@lib/logger";
import { FormValues, InnerFormProps, DynamicFormProps, Responses, FormElement } from "@lib/types";
import Loader from "../../globals/Loader";

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
  const [submitTimer, setSubmitTimer] = useState(0);
  const [intervalID, setIntervalID] = useState(0);
  const [buttonInterval, setButtonInterval] = useState(0);

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
    // calculate initial delay for submit timer
    const secondsBaseDelay = 2;
    const secondsPerFormElement = 2;
    const numberOfRequiredElements = React.Children.toArray(children).filter((child) => {
      try {
        return (
          ((child as ReactElement).props as GenerateElementProps).element.properties.validation
            ?.required == true
        );
      } catch {
        return 0;
      }
    }).length;

    const submitDelay = secondsBaseDelay + numberOfRequiredElements * secondsPerFormElement;
    setSubmitTimer(submitDelay);
  }, []);

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
          {formStatusError ? (
            <Alert type="error" heading={formStatusError} tabIndex={0} id={serverErrorId} />
          ) : null}
          {errorList ? (
            <Alert
              type="error"
              heading={t("input-validation.heading")}
              validation={true}
              id={errorId}
              tabIndex={0}
            >
              {errorList}
            </Alert>
          ) : null}
          {/**
           * method attribute needs to stay here in case javascript does not load
           * otherwise GET request will be sent which will result in leaking all the user data
           * to the URL
           */}
          <form
            id="form"
            data-testid="form"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            method="POST"
            noValidate
          >
            {children}
            {submitTimer > 0 && <div>Try again in {submitTimer} seconds.</div>}
            <div className="buttons">
              <Button type="submit">{t("submitButton")}</Button>
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
