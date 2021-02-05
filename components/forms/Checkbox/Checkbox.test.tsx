import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";
import { Checkbox } from "./Checkbox";

/*eslint no-empty-function: ["error", { "allow": ["arrowFunctions"] }]*/
describe("Checkbox component", () => {
  it("renders without errors", async () => {
    const { queryByTestId, queryByLabelText } = render(
      <Formik
        initialValues={{
          "input-radio": "",
        }}
        onSubmit={() => {}}
      >
        <Checkbox
          id="input-checkbox"
          name="input-checkbox"
          label="My checkbox"
        />
      </Formik>
    );
    expect(queryByTestId("checkbox")).toBeInTheDocument();
    expect(queryByLabelText("My checkbox")).toBeInTheDocument();
  });
});
