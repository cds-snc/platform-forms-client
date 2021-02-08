import React from "react";
import {
  getProperty,
  getFormInitialValues,
} from "../../../lib/formBuilder";
import { withFormik } from "formik";
import { logMessage } from "../../../lib/logger";

interface FormProps {
  children: React.ReactNode;
  router: object;
  t?: object;
  language: string;
  handleSubmit?: React.FormEvent<HTMLFormElement>;
}

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm = (props: FormProps) => {
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
export const Form = withFormik({
  validateOnChange: false,

  validateOnBlur: false,

  mapPropsToValues: (props) => {
    return getFormInitialValues(props.formMetadata, props.language);
  },

  handleSubmit: (values, bag) => {
    const { formMetadata, language, router } = bag.props;

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
                    formMetadata.endPage[
                      getProperty("referrerUrl", language)
                    ],
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

      bag.setSubmitting(false);
    }, 1000);
  },
})(InnerForm);

export default Form;
