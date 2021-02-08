import React from "react";
import { render } from "@testing-library/react";
import Form from "../Form/Form";
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
      <Form>
        <Dropdown id="dropdown" name="dropdown" choices={choices} />
      </Form>
    );
    expect(queryByTestId("dropdown")).toBeInTheDocument();
    expect(queryByText("Prince Edward Island")).toBeInTheDocument();
  });
});
