import React from "react";
import { render } from "@testing-library/react";

import { Radio } from "./Radio";

describe("Radio component", () => {
  const text = "My radio button";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(
      <Radio id="input-radio" name="input-radio" label={text} />
    );
    expect(queryByTestId("radio")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
