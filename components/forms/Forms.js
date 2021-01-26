import React, { useRef } from "react";
import { withTranslation } from "../../i18n";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getProperty, buildForm } from "../../lib/formBuilder";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import Head from "next/head";

const Form = ({ formModel, i18n }) => {
  const formToRender = formModel;
  const router = useRouter();
  const initialState = useRef(null);

  useEffect(() => {
    formToRender.elements.map((element) => {
      initialState.current = {
        [element.id]:
          element.properties[getProperty("placeholder", i18n.language)],
      };
    });
  }, [formToRender]);

  const formik = useFormik({
    initialValues: initialState,
    onSubmit: (values) => {
      const formResponseObject = {
        form: formToRender,
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
                    formToRender.endPage[
                      getProperty("referrerUrl", i18n.language)
                    ],
                }
              : {};
          router.push({
            pathname: `${i18n.language}/confirmation`,
            query: referrerUrl,
          });
        })
        .catch((error) => {
          console.log(error);
          // Need to add more error handling here
        });
    },
  });

  return (
    <div>
      <Head>
        <title>{formToRender[getProperty("title", i18n.language)]}</title>
      </Head>
      <h1 className="gc-h1">
        {formToRender[getProperty("title", i18n.language)]}
      </h1>
      <form id="form" onSubmit={formik.handleSubmit} method="POST">
        {formToRender.layout.map((item) => {
          const element = formToRender.elements.find(
            (element) => element.id === item
          );
          if (element) {
            return buildForm(
              element,
              formik.values[element.id],
              i18n.language,
              formik.handleChange
            );
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
    </div>
  );
};
Form.propTypes = {
  t: PropTypes.func.isRequired,
  formModel: PropTypes.object.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation()(Form);
