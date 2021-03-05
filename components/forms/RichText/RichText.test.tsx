import React from "react";
import { render } from "@testing-library/react";

import { RichText } from "./RichText";

describe("RichText component", () => {
  const text = "This is a RichText";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(<RichText>{text}</RichText>);
    expect(queryByTestId("richText")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
