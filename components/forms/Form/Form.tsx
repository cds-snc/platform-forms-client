import React, { useRef, useEffect } from "react";
import { withTranslation } from "../../../i18n";
import { useRouter } from "next/router";
import { getProperty, buildForm, FormElement } from "../../../lib/formBuilder";
import Head from "next/head";
import { Formik } from "formik";

interface FormProps {
  children: React.ReactNode;
}

export const Form = ({ formModel, i18n }) => {
  const formToRender = formModel;
  const initialState = useRef(null);
  const router = useRouter();

  useEffect(() => {
    formToRender.elements.map((element: FormElement) => {
      initialState.current = {
        [element.id]:
          element.properties[getProperty("placeholder", i18n.language)],
      };
    });
  }, [formToRender]);

  const currentForm = getRenderedForm(formToRender, i18n.language);

  return (
    <div>
      <Head>
        <title>{formToRender[getProperty("title", i18n.language)]}</title>
      </Head>
      <h1 className="gc-h1">
        {formToRender[getProperty("title", i18n.language)]}
      </h1>

      <Formik
        initialValues={initialState}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={(values, actions) => {
          console.log("FORMIK form submission values", values);

          formSubmitHandler(formToRender, values, i18n.language, router);
          actions.setSubmitting(false);
        }}
      >
        {(props) => {
          console.log("FORMIK PROPS", props)
          return(
          <form id="form" onSubmit={props.handleSubmit} method="POST">
            {currentForm}
            <div className="buttons">
              <button className="gc-button" type="submit">
                Submit
              </button>
            </div>
          </form>
        )}
      }
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

/**
 * Internal function that is called when the form needs to be built from JSON
 * getRenderedForm
 * @param formToRender
 * @param language
 */
const getRenderedForm = (formToRender, language) => {
  if (!formToRender) {
    return null;
  }

  return formToRender.layout.map((item) => {
    const element = formToRender.elements.find(
      (element) => element.id === item
    );
    if (element) {
      return buildForm(element, language, (e) => {});
    } else {
      console.log(`Failed component look up ${item}`);
    }
  });
};
