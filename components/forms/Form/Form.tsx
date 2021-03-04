import React from "react";
import { withFormik, FormikProps } from "formik";
import { getProperty, getFormInitialValues } from "../../../lib/formBuilder";
import { validateOnSubmit, getErrorList } from "../../../lib/validation";
import { Button, Alert } from "../index";
import { logMessage } from "../../../lib/logger";
import {
  FormValues,
  InnerFormProps,
  DynamicFormProps,
} from "../../../lib/types";

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm = (props: InnerFormProps & FormikProps<FormValues>) => {
  const { children, handleSubmit, t } = props;

  const errorList = props.errors ? getErrorList(props) : null;
  return (
    <>
      {errorList ? (
        <Alert
          type="error"
          heading={t("input-validation.heading")}
          validation={true}
        >
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
    return getFormInitialValues(
      props.formMetadata,
      props.language
    ) as FormValues;
  },

  validate: (values, props) => {
    const validationResult = validateOnSubmit(values, props);
    //  If there are errors on the page, scroll into view
    if (typeof window !== "undefined" && Object.keys(validationResult).length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return validationResult;
  },

  handleSubmit: (values, formikBag) => {
    const { formMetadata, language, router } = formikBag.props;

    setTimeout(() => {
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
      fetch("/api/submit", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formResponseObject),
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.received === true) {
            const referrerUrl =
              formMetadata && formMetadata.endPage
                ? {
                    referrerUrl:
                      formMetadata.endPage[
                        getProperty("referrerUrl", language)
                      ],
                  }
                : null;
            router.push({
              pathname: `${language}/confirmation`,
              query: referrerUrl,
            });
          } else {
            throw Error("Server submit API returned an error");
          }
        })
        .catch((error) => {
          logMessage.error(error);
        });

      formikBag.setSubmitting(false);
    }, 1000);
  },
})(InnerForm);

export default Form;
