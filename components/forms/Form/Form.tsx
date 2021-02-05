import React, { useRef, useEffect } from "react";
import { withTranslation } from "../../../i18n";
import { useRouter } from "next/router";
import { getProperty, FormElement } from "../../../lib/formBuilder";
import { withFormik, Formik } from "formik";

interface FormProps {
  children: React.ReactNode;
  formObject: object;
  i18n: object;
  t: object;
}

export const Form = (props: FormProps) => {
  const { formObject, i18n, t, children } = props;
  const formToRender = formObject;
  let initialState = {};
  const router = useRouter();

  useEffect(() => {
    Object.keys(formToRender.elements).forEach(function (key) {
      let currentElement = formToRender.elements[key];

      initialState[`id-${currentElement.id}`] = {
        name: `name-${currentElement.id}`,
        value:
          currentElement.properties[getProperty("placeholder", i18n.language)],
      };

      if (currentElement.properties.choices) {
        let nestedObj = {};
        currentElement.properties.choices.map((choice, index) => {
          const choiceId = `id-${key}-${index}`;
          nestedObj[choiceId] = {
            name: `name-${currentElement.id}`,
            value: choice[i18n.language],
          };
        });
        initialState[`id-${currentElement.id}`].nested = nestedObj;
      }
    });
  }, [formToRender]);

  return (
    <div>
      <Formik
        initialValues={initialState}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={(values, actions) => {
          formSubmitHandler(formToRender, values, i18n.language, router);
          actions.setSubmitting(false);
        }}
      >
        {(formikProps) => {
          return (
            <form id="form" onSubmit={formikProps.handleSubmit} method="POST">
              {children}
              <div className="buttons">
                <button className="gc-button" type="submit">
                  {t("submitButton")}
                </button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default withTranslation()(React.memo(Form));

/**
 * Internal function that is called when the form is submitted
 * formSubmitHandler
 * @param formToRender
 * @param values
 * @param language
 */
const formSubmitHandler = (formToRender, values, language: string, router) => {
  const formResponseObject = {
    form: {
      id: formToRender.id,
      titleEn: formToRender.titleEn,
      titleFr: formToRender.titleFr,
      elements: formToRender.elements,
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
        formToRender && formToRender.endPage
          ? {
              referrerUrl:
                formToRender.endPage[getProperty("referrerUrl", language)],
            }
          : {};
      router.push({
        pathname: `${language}/confirmation`,
        query: referrerUrl,
      });
    })
    .catch((error) => {
      console.log(error);
      // Need to add more error handling here
    });
};
