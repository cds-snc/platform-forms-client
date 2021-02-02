import React from "react";
import { render } from "@testing-library/react";

import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage component", () => {
  const text = "This is an error";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(
      <ErrorMessage>{text}</ErrorMessage>
    );
    expect(queryByTestId("errorMessage")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
