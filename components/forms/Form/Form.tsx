import React from "react";
import { NextRouter } from "next/router";
import { withFormik, FormikProps } from "formik";
import { getProperty, getFormInitialValues } from "../../../lib/formBuilder";
import { Button } from "../index";

import { TFunction } from "next-i18next";
import { logMessage } from "../../../lib/logger";
import { FormMetadataProperties } from "../../../lib/types";

interface InnerFormProps {
  children?: React.ReactNode;
  language: string;
  t: TFunction;
}

interface DynamicFormProps {
  formMetadata: FormMetadataProperties;
  language: string;
  router: NextRouter;
  t: TFunction;
}

//Shape of Form input values as returned by 'getFormInitialValues'
interface FormValues {
  [key: string]: unknown;
}

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm = (props: InnerFormProps & FormikProps<FormValues>) => {
  const { children, handleSubmit, t } = props;
  return (
    <form id="form" data-testid="form" onSubmit={handleSubmit} method="POST">
      {children}
      <div className="buttons">
        <Button className="gc-button" type="submit">
          {t("submitButton")}
        </Button>
      </div>
    </form>
  );
};

/**
 * This is the main Form component that wrapps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */
export const Form = withFormik<DynamicFormProps, FormValues>({
  validateOnChange: false,

  validateOnBlur: false,

  mapPropsToValues: (props) => {
    return getFormInitialValues(
      props.formMetadata,
      props.language
    ) as FormValues;
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
        .then(() => {
          const referrerUrl =
            formMetadata && formMetadata.endPage
              ? {
                  referrerUrl:
                    formMetadata.endPage[getProperty("referrerUrl", language)],
                }
              : null;
          router.push({
            pathname: `${language}/confirmation`,
            query: referrerUrl,
          });
        })
        .catch((error) => {
          logMessage.error(error);
        });

      formikBag.setSubmitting(false);
    }, 1000);
  },
})(InnerForm);

export default Form;
