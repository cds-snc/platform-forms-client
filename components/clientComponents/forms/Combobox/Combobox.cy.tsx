import React from "react";
import { Combobox } from "./Combobox";
import { Formik } from "formik";

describe("<Combobox />", () => {
  it("mounts", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );
  });
});
