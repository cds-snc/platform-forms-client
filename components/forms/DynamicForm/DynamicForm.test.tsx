import React from "react";
import { render } from "@testing-library/react";

import { Description } from "./Description";

describe("Description component", () => {
  const text = "This is a description";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(
      <Description>{text}</Description>
    );
    expect(queryByTestId("description")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
