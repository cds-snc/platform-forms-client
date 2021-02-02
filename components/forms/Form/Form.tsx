import React, { useRef, useEffect } from "react";
import { withTranslation } from "../../../i18n";
import { useRouter } from "next/router";
import { getProperty, buildForm } from "../../../lib/formBuilder";
import Head from "next/head";
import { Formik } from "formik";

interface FormProps {
  children: React.ReactNode;
}

export const Form = ({ formModel, i18n }) => {
  const formToRender = formModel;
  //const router = useRouter();
  const initialState = useRef(null);

  useEffect(() => {
    formToRender.elements.map((element) => {
      initialState.current = {
        [element.id]:
          element.properties[getProperty("placeholder", i18n.language)],
      };
    });
  }, [formToRender]);

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
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            actions.setSubmitting(false);
          }, 1000);
        }}
      >
        {(props) => (
          <form id="form" onSubmit={props.handleSubmit} method="POST">
            {formToRender.layout.map((item) => {
              const element = formToRender.elements.find(
                (element) => element.id === item
              );
              if (element) {
                return buildForm(element, "", i18n.language, () => {});
              } else {
                console.log(`Failed component look up ${item}`);
              }
            })}
            <div className="buttons">
              <button className="gc-button" type="submit">
                Submit
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default withTranslation()(Form);
