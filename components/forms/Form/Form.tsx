import React from "react";
import { getProperty, getFormInitialValues } from "../../../lib/formBuilder";
import { withFormik, FormikProps } from "formik";
import { logMessage } from "../../../lib/logger";
import { FormMetadataProperties, callback } from "../../../lib/types";
import { useRouter } from "next/router";

interface FormProps {
  children?: React.ReactNode;
  language: string;
  handleSubmit: callback;
}

interface withFormikProps {
  formMetadata: FormMetadataProperties;
  language: string;
}

interface FormValues {
  [key: string]: unknown;
}

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm = (props: FormProps & FormikProps<FormValues>) => {
  return (
    <form
      id="form"
      data-testid="form"
      onSubmit={props.handleSubmit}
      method="POST"
    >
      {props.children}
      <div className="buttons">
        <button className="gc-button" type="submit">
          Submit
        </button>
      </div>
    </form>
  );
};

/**
 * This is the main Form component that wrapps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */
export const Form = withFormik<withFormikProps, FormValues>({
  validateOnChange: false,

  validateOnBlur: false,

  mapPropsToValues: (props) => {
    return getFormInitialValues(
      props.formMetadata,
      props.language
    ) as FormValues;
  },

  handleSubmit: (values, childPropsBag) => {
    const router = useRouter();
    const { formMetadata, language } = childPropsBag.props;

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
              : {};
          router.push({
            pathname: `${language}/confirmation`,
            query: referrerUrl,
          });
        })
        .catch((error) => {
          logMessage.error(error);
        });

      childPropsBag.setSubmitting(false);
    }, 1000);
  },
})(InnerForm);

export default Form;
