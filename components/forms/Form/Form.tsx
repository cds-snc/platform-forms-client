import React from "react";
import { withFormik, FormikProps } from "formik";
import getConfig from "next/config";
import { getFormInitialValues } from "../../../lib/formBuilder";
import { validateOnSubmit, getErrorList } from "../../../lib/validation";
import { submitToAPI } from "../../../lib/dataLayer";
import { Button, Alert } from "../index";
import { logMessage } from "../../../lib/logger";
import { FormValues, InnerFormProps, DynamicFormProps } from "../../../lib/types";

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const {
  publicRuntimeConfig: { isProduction: isProduction },
} = getConfig();
const InnerForm = (props: InnerFormProps & FormikProps<FormValues>) => {
  const { children, handleSubmit, t } = props;

  const errorList = props.errors ? getErrorList(props) : null;
  const formStatus = props.status === "Error" ? t("server-error") : null;
  if (formStatus) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  return (
    <>
      {formStatus ? <Alert type="error" heading={formStatus} /> : null}
      {errorList ? (
        <Alert type="error" heading={t("input-validation.heading")} validation={true}>
          {errorList}
        </Alert>
      ) : null}

      <form
        id="form"
        data-testid="form"
        onSubmit={handleSubmit}
        method="POST"
        encType="multipart/form-data"
        noValidate
      >
        {children}
        <div className="buttons">
          <Button className="gc-button" type="submit">
            {t("submitButton")}
          </Button>
        </div>
      </form>
    </>
  );
};

/**
 * This is the main Form component that wrapps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */
export const Form = withFormik<DynamicFormProps, FormValues>({
  validateOnChange: false,

  validateOnBlur: false,

  enableReinitialize: true, // needed when switching languages

  mapPropsToValues: (props) => {
    return getFormInitialValues(props.formMetadata, props.language) as FormValues;
  },

  validate: (values, props) => {
    return validateOnSubmit(values, props);
    //  If there are errors on the page, scroll into view
  },

  handleSubmit: async (values, formikBag) => {
    try {
      const { formMetadata, language, router } = formikBag.props;
      const { setStatus } = formikBag;

      const formResponseObject = {
        form: {
          id: formMetadata.id,
          titleEn: formMetadata.titleEn,
          titleFr: formMetadata.titleFr,
          elements: formMetadata.elements,
          layout: formMetadata.layout,
        },
        responses: values,
      };

      //making a post request to the submit API
      await axios({
        url: "/api/submit",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        data: formResponseObject,
        timeout: isProduction ? 3000 : 0,
      })
        .then((serverResponse) => {
          if (serverResponse.data.received === true) {
            const referrerUrl =
              formMetadata && formMetadata.endPage
                ? {
                    referrerUrl: formMetadata.endPage[getProperty("referrerUrl", language)],
                  }
                : null;
            const { publicRuntimeConfig } = getConfig();
            const htmlEmail = !publicRuntimeConfig.isProduction
              ? serverResponse.data.htmlEmail
              : null;

            const endPageText =
              formMetadata && formMetadata.endPage
                ? formMetadata.endPage[getProperty("description", language)]
                : "";

            router.push(
              {
                pathname: `/${language}/confirmation`,
                query: {
                  ...referrerUrl,
                  htmlEmail: htmlEmail,
                  pageText: JSON.stringify(endPageText),
                },
              },
              {
                pathname: `/${language}/confirmation`,
              }
            );
          } else {
            throw Error("Server submit API returned an error");
          }
          // ;
        })
        .catch((err) => {
          if (err.response) {
            logMessage.error(err);
            setStatus("Error");
          }
        });
    } catch (err) {
      logMessage.error(err);
    } finally {
      formikBag.setSubmitting(false);
    }
  },
})(InnerForm);

export default Form;
