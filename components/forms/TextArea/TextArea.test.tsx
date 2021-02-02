import React from "react";
import { render } from "@testing-library/react";

import { TextArea } from "./TextArea";

describe("TextArea component", () => {
  it("renders without errors", () => {
    const { queryByTestId } = render(
      <TextArea id="input-type-text" name="input-type-text" />
    );
    expect(queryByTestId("textarea")).toBeInTheDocument();
  });
});
