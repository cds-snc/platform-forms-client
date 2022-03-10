import React, { useEffect, useState } from "react";
import { withFormik, FormikProps } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "@lib/validation";
import { submitToAPI } from "@lib/integration/helpers";
import { Button, Alert } from "../index";
import { logMessage } from "@lib/logger";
import { FormValues, InnerFormProps, DynamicFormProps, Responses } from "@lib/types";
import Loader from "../../globals/Loader";
import axios from "axios";

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
const InnerForm = (props: InnerFormProps & FormikProps<FormValues> & DynamicFormProps) => {
  const { children, handleSubmit, t, isSubmitting, isReCaptchaEnableOnSite } = props;
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(0);
  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = props.status === "Error" ? t("server-error") : null;

  const handleSubmitReCaptcha = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    window.grecaptcha.ready(() => {
      // get reCAPTCHA response
      window.grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY, { action: "submit" })
        .then(async (clientToken: string) => {
          sendClientTokenForVerification(clientToken)
            .then((res) => {
              const { score, success } = res.data;
              logMessage.warn(`score : ${score}  status: ${success}`);
              // assuming you're not a Robot and  submit
              handleSubmit(evt);
            })
            .catch((error) => {
              logMessage.error(error);
            });
        });
    });
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
            method="POST"
            onSubmit={(e) => {
              if (isReCaptchaEnableOnSite) {
                handleSubmitReCaptcha(e);
              } else {
                handleSubmit(e);
              }
            }}
            noValidate
          >
            {children}
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
