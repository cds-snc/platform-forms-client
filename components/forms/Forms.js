import React from "react";
import { withTranslation } from "../../i18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProperty, buildForm } from "../../lib/formBuilder";
import PropTypes from "prop-types";

const Form = ({ formModel, i18n }) => {
  const formToRender = formModel;
  const [state, setState] = useState({});
  const router = useRouter();

  useEffect(() => {
    formToRender.elements.map((element) => {
      setState((prevState) => ({
        ...prevState,
        [element.id]:
          element.properties[getProperty("placeholder", i18n.language)],
      }));
    });
  }, [formToRender]);

  const handleChange = (event) => {
    const { target } = event;
    // This triggers everytime the input is changed

    setState((prevState) => ({
      ...prevState,
      [target.name]: [target.value],
    }));
  };
  const handleSubmit = (event) => {
    const formResponseObject = {
      form: formToRender,
      responses: state,
    };

    event.preventDefault();
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
        router.push("/confirmation");
      })
      .catch((error) => {
        console.log(error);
        // Need to add more error handling here
      });
  };

  return (
    <>
      <h1>{formToRender[getProperty("title", i18n.language)]}</h1>
      <form id="form" onSubmit={handleSubmit} method="POST">
        {formToRender.layout.map((item) => {
          const element = formToRender.elements.find(
            (element) => element.id === item
          );
          return buildForm(
            element,
            state[element.id],
            i18n.language,
            handleChange
          );
        })}
        <div className="buttons">
          <button className="submit-button w-60" type="submit">
            Submit
          </button>
        </div>
      </form>
    </>
  );
};
Form.propTypes = {
  t: PropTypes.func.isRequired,
  formModel: PropTypes.object.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation()(Form);
