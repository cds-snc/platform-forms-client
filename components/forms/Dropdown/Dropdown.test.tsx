import React from "react";
import { render } from "@testing-library/react";

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

describe("Dropdown component", () => {
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(
      <Dropdown id="dropdown" name="dropdown" choices={choices} />
    );
    expect(queryByTestId("dropdown")).toBeInTheDocument();
    expect(queryByText("Prince Edward Island")).toBeInTheDocument();
  });
});
