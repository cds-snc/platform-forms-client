import React, { useRef } from "react";
import { withTranslation } from "../../i18n";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getProperty, buildForm } from "../../lib/formBuilder";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import Head from "next/head";
import { logMessage, logger } from "../../lib/logger";

const Form = ({ formModel, i18n, t }) => {
  const formToRender = formModel;
  const router = useRouter();
  const initialState = useRef(null);

  useEffect(() => {
    logger(
      formToRender.elements.map((element) => {
        initialState.current = {
          [element.id]:
            element.properties[getProperty("placeholder", i18n.language)],
        };
      })
    );
  }, [formToRender]);

  const formik = useFormik({
    initialValues: initialState,
    onSubmit: (values) => {
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
          logMessage.error(error);
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
      <form className="max-w-prose" id="form" onSubmit={formik.handleSubmit} method="POST">
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
            logMessage.error(
              `Failed component ID look up ${item} on form ID ${formToRender.id}`
            );
          }
        })}
        <div className="buttons">
          <button className="gc-button" type="submit">
            {t("submitButton")}
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
