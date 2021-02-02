import React from "react";
import { render } from "@testing-library/react";

import { Fieldset } from "./Fieldset";

describe("Fieldset component", () => {
  const legend = "This is a legend";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(
      <Fieldset>{legend}</Fieldset>
    );
    expect(queryByTestId("fieldset")).toBeInTheDocument();
    expect(queryByText(legend)).toBeInTheDocument();
  });
});
