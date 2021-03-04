import React from "react";
import { render } from "@testing-library/react";

import { Label } from "./Label";

describe("Label component", () => {
  const text = "This is a label";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(<Label htmlFor="testInput">{text}</Label>);
    expect(queryByTestId("label")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
