import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";
import { Dropdown } from "./Dropdown";

const choices = [
  "",
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

/*eslint no-empty-function: ["error", { "allow": ["arrowFunctions"] }]*/
describe("Dropdown component", () => {
  it("renders without errors", async () => {
    const { queryByTestId, queryByText } = render(
      <Formik
        initialValues={{
          "input-radio": "",
        }}
        onSubmit={() => {}}
      >
        <Dropdown id="dropdown" name="dropdown" choices={choices} />
      </Formik>
    );
    expect(queryByTestId("dropdown")).toBeInTheDocument();
    expect(queryByText("Prince Edward Island")).toBeInTheDocument();
  });
});
