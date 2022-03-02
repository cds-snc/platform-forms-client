import React, { useEffect, useState } from "react";
import { withFormik, FormikProps } from "formik";
import { getFormInitialValues } from "../../../lib/formBuilder";
import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "../../../lib/validation";
import { submitToAPI } from "../../../lib/integration/helpers";
import { Button, Alert } from "../index";
import { logMessage } from "../../../lib/logger";
import {
  FormValues,
  InnerFormProps,
  DynamicFormProps,
  Responses,
  ReCaptchaResponse,
} from "../../../lib/types";
import Loader from "../../globals/Loader";
import axios from "axios";

declare global {
  interface Window {
    dataLayer: Array<unknown>;
  }
}

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm = (props: InnerFormProps & FormikProps<FormValues>) => {
  const { children, handleSubmit, t, isSubmitting } = props;
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(0);

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = props.status === "Error" ? t("server-error") : null;

  const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  const isReCaptchaEnableOnSite = process.env.RECAPTCHA_ENABLE === "true";

  const handleSubmitWithRecaptcha = (e: React.FormEvent<EventTarget>) => {
    // avoid multiple re-call while on submit state.
    if (isSubmitting) return false;
    logMessage.debug(`reCaptcha On :  ${isReCaptchaEnableOnSite}`);
    e.preventDefault();
    window.grecaptcha.ready(() => {
      // get reCAPTCHA response
      window.grecaptcha.execute(SITE_KEY, { action: "submit" }).then(async (token) => {
        await sendRecaptchaToken(token).then((res) => {
          const recaptchaRes = res?.data as ReCaptchaResponse;
          logMessage.warn(recaptchaRes);
          // assuming you're not a Robot
          // continue submission process
          handleSubmit(e);
        });
      });
    });
  };

  const sendRecaptchaToken = async (token: string) => {
    // call a backend API to verify reCAPTCHA response
    try {
      return await axios({
        url: "/api/verify",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userToken: token,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 80000,
      });
    } catch (error) {
      logMessage.error(error);
    }
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

    const loadScriptFromURL = (id: string, url: string, callback?: () => void) => {
      const isScriptExist = document.getElementById(id);
      //calls once when a form is rendered
      if (!isScriptExist) {
        const newScript = document.createElement("script");
        newScript.type = "text/javascript";
        newScript.src = url;
        newScript.id = id;
        newScript.onload = function () {
          if (callback) callback();
        };
        document.body.appendChild(newScript);
      }
      if (isScriptExist && callback) callback();
    };

    if (isReCaptchaEnableOnSite && !isSubmitting) {
      // add a listener
      const formElement = document.getElementById("form");
      formElement?.addEventListener("submit", handleSubmitWithRecaptcha);
      // load the script by passing the URL
      loadScriptFromURL(
        "recaptcha-key",
        `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`,
        function () {
          logMessage.debug("Script loaded!");
        }
      );
      // no reCAPTCHA default behavior
    } else if (!isSubmitting) {
      const formElement = document.getElementById("form");
      formElement?.addEventListener("submit", handleSubmit);
    }
  }, [formStatusError, errorList, lastSubmitCount, canFocusOnError]);

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
          <form id="form" data-testid="form" method="POST" noValidate>
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
