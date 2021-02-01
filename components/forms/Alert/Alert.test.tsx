import React from "react";
import { render } from "@testing-library/react";

import { Alert } from "./Alert";

describe("Alert component", () => {
  const text = "This is a success alert";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(
      <Alert type="success" heading="Success status">
        {text}
      </Alert>
    );
    expect(queryByTestId("alert")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
